import { z } from "zod";

// List of valid JNV schools
const jnvSchools = [
  "JNV Ernakulam",
  "JNV Idukki",
  "JNV Kannur",
  "JNV Kasaragod",
  "JNV Kollam",
  "JNV Kottayam",
  "JNV Kozhikode",
  "JNV Lakshadweep",
  "JNV Mahe",
  "JNV Palakkad",
  "JNV Pathanamthitta",
  "JNV Thiruvananthapuram",
  "JNV Thrissur",
  "JNV Wayanad",
  "JNV Other",
];

// Republic Day Event Registration Schema
export const republicDayEventFormSchema = z
  .object({
    // Personal Information
    name: z.string().min(2, "Full name is required").max(100, "Name is too long"),
    email: z.string().email("Please enter a valid email address"),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^[0-9]{10,15}$/, "Phone number must contain only digits (10-15 digits)"),

    // UNMA Details
    jnvSchool: z.enum(jnvSchools, {
      errorMap: () => ({ message: "Please select a JNV" }),
    }),
    jnvOther: z.string().optional(),
    batchYear: z.string().optional(),

    // Preferences
    foodChoice: z.enum(["Veg", "Non-Veg"], {
      errorMap: () => ({ message: "Please select a food preference" }),
    }),
    participateBloodDonation: z.boolean().default(false),
    participateNationalSong: z.boolean().default(false),
    joinBoatRide: z.boolean().default(false),
    readyToVolunteer: z.boolean().default(false),
    interestedInSponsorship: z.boolean().default(false),
    familyMembersCount: z.preprocess(
      (val) => {
        if (val === "" || val === null || val === undefined) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
      },
      z.number().min(0, "Count cannot be negative").nullable().optional()
    ),

    // Payment Details
    paymentMethod: z.enum(["IDBI Bank", "Federal Bank"], {
      errorMap: () => ({ message: "Please select a payment method" }),
    }),
    transactionId: z.string().optional(),
    amountPaid: z.preprocess(
      (val) => {
        if (val === "" || val === null || val === undefined) return 0;
        return Number(val);
      },
      z.number().min(0, "Amount cannot be negative").default(0)
    ),
    paymentDate: z.string().optional().or(z.date().optional()),
  })
  .refine(
    (data) => {
      // If JNV School is "JNV Other", jnvOther must be provided
      if (data.jnvSchool === "JNV Other") {
        return data.jnvOther && data.jnvOther.trim().length >= 2;
      }
      return true;
    },
    {
      message: "Please specify your JNV if you selected 'JNV Other'",
      path: ["jnvOther"],
    }
  );

// Export type for TypeScript usage (if needed)
// export type RepublicDayEventFormData = z.infer<typeof republicDayEventFormSchema>;
