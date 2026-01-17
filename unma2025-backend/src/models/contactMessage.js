import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    // Contact Information
    name: {
      type: String,
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
      index: true, // Index for faster queries
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          // Allow empty or valid phone numbers (10-15 digits, optional + and spaces)
          return !v || /^[\+]?[0-9\s\-\(\)]{10,15}$/.test(v);
        },
        message: "Please provide a valid phone number",
      },
    },

    // Message Content
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },

   
    // Status Management
    status: {
      type: String,
      enum: {
        values: ["new", "read", "in-progress", "responded", "resolved", "spam"],
        message:
          "Status must be one of: new, read, in-progress, responded, resolved, spam",
      },
      default: "new",
      index: true, // Index for filtering by status
    },

    // Priority for urgent messages
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "urgent"],
        message: "Priority must be one of: low, medium, high, urgent",
      },
      default: "medium",
    },

    // Response tracking
    responseData: {
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin", // Assuming you have a User model for admins
      },
      responseDate: Date,
      responseMessage: String,
      responseMethod: {
        type: String,
        enum: ["email", "phone", "internal-note"],
        default: "email",
      },
    },

    // Admin notes
    adminNotes: [
      {
        note: {
          type: String,
          required: true,
          maxlength: [1000, "Note cannot exceed 1000 characters"],
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admin",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Categorization
    category: {
      type: String,
      enum: {
        values: [
          "general-inquiry",
          "technical-support",
          "summit-related",
          "registration-help",
          "payment-issue",
          "sponsorship",
          "complaint",
          "suggestion",
          "other",
        ],
        message: "Invalid category",
      },
      default: "general-inquiry",
      index: true,
    },

    // Source tracking
    source: {
      type: String,
      enum: ["website-contact-form", "email", "phone", "social-media", "other"],
      default: "website-contact-form",
    },

    // Metadata
    ipAddress: {
      type: String,
      validate: {
        validator: function (v) {
          // Simple IP validation (IPv4 and IPv6)
          return (
            !v ||
            /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(v) ||
            /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(v)
          );
        },
        message: "Invalid IP address format",
      },
    },

    userAgent: String,

    // Auto-generated timestamps
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt

    // Index for better performance
    indexes: [
      { email: 1, createdAt: -1 }, // Compound index for email + date queries
      { status: 1, priority: -1 }, // Compound index for status + priority
      { category: 1, createdAt: -1 }, // Compound index for category + date
      { createdAt: -1 }, // Index for date-based sorting
    ],
  }
);

// Virtual for response status
contactMessageSchema.virtual("hasResponse").get(function () {
  return this.status === "responded" || this.status === "resolved";
});

// Virtual for age of message
contactMessageSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to auto-categorize based on subject/message content
contactMessageSchema.pre("save", function (next) {
  if (this.isNew && this.category === "general-inquiry") {
    const text = `${this.subject} ${this.message}`.toLowerCase();

    if (
      text.includes("payment") ||
      text.includes("transaction") ||
      text.includes("refund")
    ) {
      this.category = "payment-issue";
    } else if (
      text.includes("registration") ||
      text.includes("register") ||
      text.includes("sign up")
    ) {
      this.category = "registration-help";
    } else if (
      text.includes("technical") ||
      text.includes("error") ||
      text.includes("bug") ||
      text.includes("not working")
    ) {
      this.category = "technical-support";
    } else if (
      text.includes("summit") ||
      text.includes("event") ||
      text.includes("schedule")
    ) {
      this.category = "summit-related";
    } else if (text.includes("sponsor") || text.includes("partnership")) {
      this.category = "sponsorship";
    } else if (
      text.includes("complaint") ||
      text.includes("issue") ||
      text.includes("problem")
    ) {
      this.category = "complaint";
    } else if (
      text.includes("suggest") ||
      text.includes("improve") ||
      text.includes("feature")
    ) {
      this.category = "suggestion";
    }
  }

  next();
});

// Static method to get messages by status
contactMessageSchema.statics.getByStatus = function (status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to get unread messages
contactMessageSchema.statics.getUnread = function () {
  return this.find({ status: "new" }).sort({ priority: -1, createdAt: -1 });
};

// Instance method to mark as read
contactMessageSchema.methods.markAsRead = function (adminId) {
  this.status = "read";
  if (adminId) {
    this.adminNotes.push({
      note: "Message marked as read",
      addedBy: adminId,
      addedAt: new Date(),
    });
  }
  return this.save();
};

// Instance method to add admin note
contactMessageSchema.methods.addAdminNote = function (note, adminId) {
  this.adminNotes.push({
    note,
    addedBy: adminId,
    addedAt: new Date(),
  });
  return this.save();
};

// Export with additional options
const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

export default ContactMessage;
