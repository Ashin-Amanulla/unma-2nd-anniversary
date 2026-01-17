import { z } from "zod";

// Quick Registration Form Validation Schema
export const QuickRegistrationSchema = z.object({
    // Personal Details
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters")
        .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

    email: z.string()
        .email("Please enter a valid email address")
        .min(1, "Email is required"),

    contactNumber: z.string()
        .min(1, "Contact number is required")
        .refine(
            (val) => {
                const digits = val.replace(/\D/g, "");
                // For Indian numbers (starting with +91 or 91)
                if (val.startsWith("+91") || val.startsWith("91")) {
                    return digits.length === 12; // 91 + 10 digits
                }
                // For other countries, ensure at least 10 digits
                return digits.length >= 10;
            },
            {
                message: "Indian numbers must be 10 digits (excluding country code)",
            }
        ),

    whatsappNumber: z.string()
        .optional()
        .refine(
            (val) => {
                if (!val) return true; // Optional field
                const digits = val.replace(/\D/g, "");
                if (val.startsWith("+91") || val.startsWith("91")) {
                    return digits.length === 12;
                }
                return digits.length >= 10;
            },
            {
                message: "WhatsApp number must be valid",
            }
        ),

    country: z.string()
        .min(2, "Country must be at least 2 characters")
        .max(50, "Country cannot exceed 50 characters"),

    stateUT: z.string()
        .min(2, "State/UT must be at least 2 characters")
        .max(50, "State/UT cannot exceed 50 characters"),

   
    bloodGroup: z.string()
        .min(1, "Please select a blood group")
        .refine(
            (val) => ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].includes(val),
            {
                message: "Please select a valid blood group",
            }
        ),

    // Event Attendance
    isAttending: z.boolean(),

    attendees: z.object({
        adults: z.object({
            veg: z.number().min(0, "Cannot be negative"),
            nonVeg: z.number().min(0, "Cannot be negative"),
        }),
        teens: z.object({
            veg: z.number().min(0, "Cannot be negative"),
            nonVeg: z.number().min(0, "Cannot be negative"),
        }),
        children: z.object({
            veg: z.number().min(0, "Cannot be negative"),
            nonVeg: z.number().min(0, "Cannot be negative"),
        }),
        toddlers: z.object({
            veg: z.number().min(0, "Cannot be negative"),
            nonVeg: z.number().min(0, "Cannot be negative"),
        }),
    }).refine(
        (data) => {
            // If attending, at least one person should be counted
            if (data) {
                const total = Object.values(data).reduce(
                    (sum, group) => sum + (group.veg || 0) + (group.nonVeg || 0),
                    0
                );
                return total > 0;
            }
            return true;
        },
        {
            message: "Please add at least one attendee if you plan to attend",
            path: ["attendees"],
        }
    ),

    eventParticipation: z.array(z.string())
        .optional()
        .default([]),

    participationDetails: z.string()
        .max(500, "Participation details cannot exceed 500 characters")
        .optional(),

    // Financial Contribution
    willContribute: z.boolean(),

    contributionAmount: z.number()
        .min(1, "Contribution amount must be at least ₹1")
        .max(1000000, "Contribution amount cannot exceed ₹10,00,000")
        .optional()
        .refine(
            (val) => {
                if (val === undefined || val === null) return true;
                return val >= 1;
            },
            {
                message: "Contribution amount must be at least ₹1",
            }
        ),

    paymentStatus: z.string()
        .default("pending")
        .refine(
            (val) => ["pending", "completed", "failed"].includes(val),
            {
                message: "Invalid payment status",
            }
        ),
});

// Validation function for the entire form
export const validateQuickRegistration = (data) => {
    try {
        const validatedData = QuickRegistrationSchema.parse(data);
        return { success: true, data: validatedData, errors: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const formattedErrors = {};
            error.errors.forEach((err) => {
                const path = err.path.join(".");
                formattedErrors[path] = err.message;
            });
            return { success: false, data: null, errors: formattedErrors };
        }
        return { success: false, data: null, errors: { general: "Validation failed" } };
    }
};

// Partial validation for step-by-step validation
export const validatePersonalDetails = (data) => {
    const personalSchema = QuickRegistrationSchema.pick({
        name: true,
        email: true,
        contactNumber: true,
        whatsappNumber: true,
        country: true,
        stateUT: true,
        district: true,
        bloodGroup: true,
    });

    try {
        const validatedData = personalSchema.parse(data);
        return { success: true, data: validatedData, errors: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const formattedErrors = {};
            error.errors.forEach((err) => {
                const path = err.path.join(".");
                formattedErrors[path] = err.message;
            });
            return { success: false, data: null, errors: formattedErrors };
        }
        return { success: false, data: null, errors: { general: "Validation failed" } };
    }
};

export const validateEventAttendance = (data) => {
    const eventSchema = QuickRegistrationSchema.pick({
        isAttending: true,
        attendees: true,
        eventParticipation: true,
        participationDetails: true,
    });

    try {
        const validatedData = eventSchema.parse(data);
        return { success: true, data: validatedData, errors: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const formattedErrors = {};
            error.errors.forEach((err) => {
                const path = err.path.join(".");
                formattedErrors[path] = err.message;
            });
            return { success: false, data: null, errors: formattedErrors };
        }
        return { success: false, data: null, errors: { general: "Validation failed" } };
    }
};

export const validateFinancialContribution = (data) => {
    const financialSchema = QuickRegistrationSchema.pick({
        willContribute: true,
        contributionAmount: true,
        paymentStatus: true,
    });

    try {
        const validatedData = financialSchema.parse(data);
        return { success: true, data: validatedData, errors: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            const formattedErrors = {};
            error.errors.forEach((err) => {
                const path = err.path.join(".");
                formattedErrors[path] = err.message;
            });
            return { success: false, data: null, errors: formattedErrors };
        }
        return { success: false, data: null, errors: { general: "Validation failed" } };
    }
};

export default QuickRegistrationSchema;
