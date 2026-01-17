import mongoose from "mongoose";

const IDCardSchema = new mongoose.Schema(
  {
    // Reference to registration
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      unique: true, // One ID card per registration
    },

    // Basic info (denormalized for quick access)
    name: { type: String, required: true },
    email: { type: String, required: true },
    serialNumber: { type: Number, required: true, unique: true },
    registrationType: {
      type: String,
      enum: ["Alumni", "Staff", "Other"],
      required: true,
    },

    // ID Card Generation Details
    generationStatus: {
      type: String,
      enum: ["pending", "generated", "failed"],
      default: "pending",
    },

    // File storage information
    fileName: { type: String }, // e.g., "2025-01-27_John_Doe_12345.png"
    filePath: { type: String }, // Full file path
    fileSize: { type: Number }, // File size in bytes

    // Download tracking
    downloadStatus: {
      type: String,
      enum: ["not_downloaded", "downloaded", "bulk_downloaded"],
      default: "not_downloaded",
    },
    downloadCount: { type: Number, default: 0 },
    firstDownloadDate: { type: Date },
    lastDownloadDate: { type: Date },
    downloadHistory: [
      {
        downloadDate: { type: Date, default: Date.now },
        downloadType: {
          type: String,
          enum: ["individual", "bulk"],
          default: "individual",
        },
        userAgent: { type: String },
        ipAddress: { type: String },
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
      },
    ],

    // Generation metadata
    generatedAt: { type: Date },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    generationDuration: { type: Number }, // in milliseconds

    // Template and version info
    templateVersion: { type: String, default: "v1.0" },
    qrCodeData: { type: String }, // vCard data used in QR code

    // Quality control
    validated: { type: Boolean, default: false },
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    validatedAt: { type: Date },
    validationNotes: { type: String },

    // Error tracking
    errorMessage: { type: String },
    errorDetails: { type: Object },
    lastErrorAt: { type: Date },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Indexes for performance
IDCardSchema.index({ registrationId: 1 });
IDCardSchema.index({ serialNumber: 1 });
IDCardSchema.index({ generationStatus: 1 });
IDCardSchema.index({ downloadStatus: 1 });
IDCardSchema.index({ generatedAt: 1 });
IDCardSchema.index({ fileName: 1 });

// Compound indexes for common queries
IDCardSchema.index({ generationStatus: 1, downloadStatus: 1 });
IDCardSchema.index({ registrationType: 1, generationStatus: 1 });

// Methods
IDCardSchema.methods.markAsDownloaded = function (
  downloadType = "individual",
  metadata = {}
) {
  const now = new Date();

  this.downloadCount += 1;
  if (!this.firstDownloadDate) {
    this.firstDownloadDate = now;
  }
  this.lastDownloadDate = now;

  if (downloadType === "bulk") {
    this.downloadStatus = "bulk_downloaded";
  } else if (this.downloadStatus === "not_downloaded") {
    this.downloadStatus = "downloaded";
  }

  // Add to download history
  this.downloadHistory.push({
    downloadDate: now,
    downloadType,
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
    adminId: metadata.adminId,
  });

  return this.save();
};

IDCardSchema.methods.markAsGenerated = function (fileInfo, metadata = {}) {
  this.generationStatus = "generated";
  this.fileName = fileInfo.fileName;
  this.filePath = fileInfo.filePath;
  this.fileSize = fileInfo.fileSize;
  this.generatedAt = new Date();
  this.generatedBy = metadata.adminId;
  this.generationDuration = metadata.duration;
  this.qrCodeData = metadata.qrCodeData;

  return this.save();
};

IDCardSchema.methods.markAsFailedGeneration = function (error) {
  this.generationStatus = "failed";
  this.errorMessage = error.message;
  this.errorDetails = error.details || {};
  this.lastErrorAt = new Date();

  return this.save();
};

// Static methods
IDCardSchema.statics.getDownloadableCards = function () {
  return this.find({
    generationStatus: "generated",
    $expr: {
      $eq: [
        { $getField: { field: "paymentStatus", input: "$registrationId" } },
        "completed",
      ],
    },
  }).populate(
    "registrationId",
    "paymentStatus formDataStructured.financial.paymentStatus"
  );
};

IDCardSchema.statics.getBulkDownloadStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalGenerated: {
          $sum: { $cond: [{ $eq: ["$generationStatus", "generated"] }, 1, 0] },
        },
        totalDownloaded: {
          $sum: {
            $cond: [{ $ne: ["$downloadStatus", "not_downloaded"] }, 1, 0],
          },
        },
        totalBulkDownloaded: {
          $sum: {
            $cond: [{ $eq: ["$downloadStatus", "bulk_downloaded"] }, 1, 0],
          },
        },
        averageFileSize: { $avg: "$fileSize" },
        totalDownloadCount: { $sum: "$downloadCount" },
      },
    },
  ]);
};

const IDCard = mongoose.model("IDCard", IDCardSchema);

export default IDCard;












