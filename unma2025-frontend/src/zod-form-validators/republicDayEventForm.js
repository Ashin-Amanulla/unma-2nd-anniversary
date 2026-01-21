import { z } from "zod";

// List of valid JNV schools
const jnvSchools = [
  "JNV Alappuzha",
  "JNV Malappuram",
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
    partOfWhatsAppGroup: z.preprocess(
      (val) => {
        if (typeof val === "boolean") return val;
        if (val === "true" || val === 1 || val === "1") return true;
        if (val === "false" || val === 0 || val === "0") return false;
        return undefined;
      },
      z.union([z.boolean(), z.undefined()]).refine(
        (val) => typeof val === "boolean",
        {
          message: "Please select whether you are part of the UNMA OneFamily WhatsApp group",
        }
      )
    ),
    participateBloodDonation: z.preprocess(
      (val) => {
        if (typeof val === "boolean") return val;
        if (val === "true" || val === 1 || val === "1") return true;
        return false;
      },
      z.boolean()
    ),
    participateNationalSong: z.preprocess(
      (val) => {
        if (typeof val === "boolean") return val;
        if (val === "true" || val === 1 || val === "1") return true;
        return false;
      },
      z.boolean()
    ),
    joinBoatRide: z.preprocess(
      (val) => {
        if (typeof val === "boolean") return val;
        if (val === "true" || val === 1 || val === "1") return true;
        return false;
      },
      z.boolean()
    ),
    readyToVolunteer: z.preprocess(
      (val) => {
        if (typeof val === "boolean") return val;
        if (val === "true" || val === 1 || val === "1") return true;
        return false;
      },
      z.boolean()
    ),
    interestedInSponsorship: z.preprocess(
      (val) => {
        if (typeof val === "boolean") return val;
        if (val === "true" || val === 1 || val === "1") return true;
        return false;
      },
      z.boolean()
    ),
    familyMembersCount: z.preprocess(
      (val) => {
        // Handle empty string, null, undefined, or whitespace-only strings
        if (val === "" || val === null || val === undefined) return null;
        const strVal = String(val).trim();
        if (strVal === "") return null;
        // Convert to number
        const num = Number(strVal);
        // Return null if NaN, otherwise return the number (including 0)
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
        // Allow empty string, null, undefined to be treated as missing (required)
        if (val === "" || val === null || val === undefined) return undefined;
        const num = Number(val);
        // Return undefined if NaN, otherwise return the number (including 0)
        return isNaN(num) ? undefined : num;
      },
      z.number({
        required_error: "Amount paid is required. Please enter 0 if facing financial difficulty.",
      })
        .min(0, "Amount cannot be negative")
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
