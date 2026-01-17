import Joi from "joi";

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

// Validation schema for Republic Day Event Registration
export const republicDayEventRegistrationSchema = Joi.object({
  // Personal Information
  name: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().email().required().trim().lowercase(),
  phoneNumber: Joi.string()
    .required()
    .trim()
    .pattern(/^[0-9]{10,15}$/)
    .messages({
      "string.pattern.base":
        "Phone number must be 10-15 digits",
    }),

  // UNMA Details
  jnvSchool: Joi.string()
    .required()
    .valid(...jnvSchools)
    .trim(),
  jnvOther: Joi.when("jnvSchool", {
    is: "JNV Other",
    then: Joi.string().required().trim().min(2).max(100),
    otherwise: Joi.string().allow("").optional().trim(),
  }),
  batchYear: Joi.string().allow("").optional().trim(),

  // Preferences
  foodChoice: Joi.string().required().valid("Veg", "Non-Veg"),
  participateBloodDonation: Joi.boolean().default(false),
  participateNationalSong: Joi.boolean().default(false),
  joinBoatRide: Joi.boolean().default(false),
  readyToVolunteer: Joi.boolean().default(false),
  interestedInSponsorship: Joi.boolean().default(false),
  familyMembersCount: Joi.number().min(0).allow(null).optional(),

  // Payment Details (all optional)
  paymentMethod: Joi.string()
    .valid("IDBI Bank", "Federal Bank")
    .required(),
  transactionId: Joi.string().allow("").optional().trim(),
  amountPaid: Joi.number().min(0).default(0),
  paymentDate: Joi.date().allow(null).optional(),
});

// Validation middleware
export const validateRepublicDayEventRegistration = (req, res, next) => {
  const { error, value } = republicDayEventRegistrationSchema.validate(
    req.body,
    {
      abortEarly: false,
      stripUnknown: true,
    }
  );

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: errorMessages,
    });
  }

  req.body = value;
  next();
};
