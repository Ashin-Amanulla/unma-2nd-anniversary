import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["super_admin", "school_admin", "registration_desk", "career_admin"],
      default: "school_admin",
    },
    assignedSchools: [
      {
        type: String,
        trim: true,
      },
    ],
    permissions: {
      canViewAllSchools: { type: Boolean, default: false },
      canManageAdmins: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: true },
      canExportData: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false },
    },
    district: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    sidebarAccess: {
      type: [String],
      enum: [
        "event_dashboard",
        "event_registrations",
        "event_management",
        "team_management",
        "updates_management",
        "careers_jobs",
        "pending_jobs",
        "feedback",
        "issues",
        "contact_messages",
        "settings",
        "user_logs",
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
adminSchema.pre("save", async function (next) {
  // Only hash the password if it's modified or new
  if (!this.isModified("password")) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login
adminSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  return this.save();
};

// Indexes
adminSchema.index({ role: 1 });

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
