import mongoose from "mongoose";

const userLogSchema = new mongoose.Schema(
  {
    // User information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      enum: ["super_admin", "school_admin", "registration_desk", "career_admin"],
      required: true,
    },

    // Request information
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
    endpoint: {
      type: String,
      required: true,
    },
    fullUrl: {
      type: String,
      required: true,
    },

    // Client information
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },

    // Request details
    requestBody: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    queryParams: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    routeParams: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Response information
    statusCode: {
      type: Number,
      required: true,
    },
    responseTime: {
      type: Number, // in milliseconds
      required: true,
    },

    // Error information (if any)
    errorMessage: {
      type: String,
    },
    errorStack: {
      type: String,
    },

    // Additional context
    action: {
      type: String, // Descriptive action like "Created new admin", "Viewed registrations", etc.
    },
    category: {
      type: String,
      enum: [
        "authentication",
        "user_management",
        "data_access",
        "configuration",
        "analytics",
        "other",
      ],
      default: "other",
    },

    // School context (for school admins)
    assignedSchools: [
      {
        type: String,
      },
    ],

    // Sensitive data flag
    containsSensitiveData: {
      type: Boolean,
      default: false,
    },

    // Browser and device info
    browserInfo: {
      name: String,
      version: String,
    },
    deviceInfo: {
      type: String,
    },

    // Geolocation (if available)
    location: {
      country: String,
      city: String,
      region: String,
    },
  },
  {
    timestamps: true,
    // Add indexes for better query performance
    index: [
      { userId: 1, createdAt: -1 },
      { userEmail: 1, createdAt: -1 },
      { method: 1, endpoint: 1 },
      { statusCode: 1 },
      { category: 1 },
      { createdAt: -1 },
    ],
  },
  {
    ttl: 60 * 60 * 24 * 30, // 30 days
  }
);

// Index for efficient queries
userLogSchema.index({ userId: 1, createdAt: -1 });
userLogSchema.index({ userEmail: 1, createdAt: -1 });
userLogSchema.index({ method: 1, endpoint: 1 });
userLogSchema.index({ statusCode: 1 });
userLogSchema.index({ category: 1 });
userLogSchema.index({ createdAt: -1 });

// Method to sanitize sensitive data from request body
userLogSchema.methods.sanitizeRequestBody = function () {
  const sensitiveFields = [
    "password",
    "token",
    "secret",
    "key",
    "authorization",
  ];

  if (this.requestBody && typeof this.requestBody === "object") {
    const sanitized = { ...this.requestBody };

    // Recursively remove sensitive fields
    const sanitizeObject = (obj) => {
      Object.keys(obj).forEach((key) => {
        if (
          sensitiveFields.some((field) => key.toLowerCase().includes(field))
        ) {
          obj[key] = "[REDACTED]";
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };

    sanitizeObject(sanitized);
    this.requestBody = sanitized;
    this.containsSensitiveData = true;
  }
};

// Static method to get activity summary
userLogSchema.statics.getActivitySummary = async function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          method: "$method",
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.date": -1 },
    },
  ]);
};

const UserLog = mongoose.model("UserLog", userLogSchema);

export default UserLog;
