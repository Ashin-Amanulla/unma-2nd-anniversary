import mongoose from "mongoose";

const EventJan26RegistrationSchema = new mongoose.Schema(
  {
    // Personal Information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    // UNMA Details
    jnvSchool: {
      type: String,
      required: true,
      trim: true,
    },
    jnvOther: {
      type: String,
      trim: true,
    },
    batchYear: {
      type: String,
      trim: true,
    },

    // Preferences
    foodChoice: {
      type: String,
      enum: ["Veg", "Non-Veg"],
      required: true,
    },
    partOfWhatsAppGroup: {
      type: Boolean,
      required: true,
    },
    participateBloodDonation: {
      type: Boolean,
      default: false,
    },
    participateNationalSong: {
      type: Boolean,
      default: false,
    },
    joinBoatRide: {
      type: Boolean,
      default: false,
    },
    readyToVolunteer: {
      type: Boolean,
      default: false,
    },
    interestedInSponsorship: {
      type: Boolean,
      default: false,
    },
    familyMembersCount: {
      type: Number,
      min: 0,
      default: null,
    },

    // Payment Details
    paymentMethod: {
      type: String,
      enum: ["IDBI Bank", "Federal Bank", "QR Code", ""],
      default: "",
    },
    transactionId: {
      type: String,
      trim: true,
    },
    amountPaid: {
      type: Number,
      min: 0,
      default: 0,
    },
    paymentDate: {
      type: Date,
    },

    // Metadata
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    submitted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for duplicate prevention and queries
EventJan26RegistrationSchema.index({ email: 1 }, { unique: true });
EventJan26RegistrationSchema.index({ phoneNumber: 1 }, { unique: true });
EventJan26RegistrationSchema.index({ registrationDate: -1 });

// Text index for search
EventJan26RegistrationSchema.index({
  name: "text",
  email: "text",
  phoneNumber: "text",
  jnvSchool: "text",
});

// Pre-save middleware to update lastUpdated
EventJan26RegistrationSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  if (this.isNew) {
    this.submitted = true;
  }
  next();
});

const EventJan26Registration = mongoose.model(
  "EventJan26Registration",
  EventJan26RegistrationSchema
);

export default EventJan26Registration;
