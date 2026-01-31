import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
    {
        // Basic Job Information
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
            maxlength: 200,
        },
        company: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
            maxlength: 200,
        },
        description: {
            type: String,
            required: [true, "Job description is required"],
            trim: true,
        },
        type: {
            type: String,
            enum: ["Full-time", "Part-time", "Internship", "Contract", "Freelance", "Apprenticeship", "Trainee"],
            required: [true, "Job type is required"],
        },
        location: {
            type: String,
            trim: true,
            default: "",
        },
        salary: {
            type: String,
            trim: true,
            default: "",
        },

        // Image/Logo
        image: {
            type: String,
            trim: true,
            default: "",
        },

        // Job Details
        requirements: {
            type: [String],
            default: [],
        },
        responsibilities: {
            type: [String],
            default: [],
        },

        // Application Details
        applicationUrl: {
            type: String,
            trim: true,
            default: "",
        },
        applicationEmail: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },
        contactPerson: {
            type: String,
            trim: true,
            default: "",
        },
        contactPhone: {
            type: String,
            trim: true,
            default: "",
        },

        // Deadline
        deadline: {
            type: Date,
            default: null,
        },

        // Age Eligibility
        ageLimit: {
            minAge: {
                type: Number,
                default: null,
                min: 0,
                max: 100,
            },
            maxAge: {
                type: Number,
                default: null,
                min: 0,
                max: 100,
            },
        },

        // Educational Qualification
        qualification: {
            type: String,
            enum: ["10th Pass", "12th Pass", "Diploma", "Graduate", "Post Graduate", "PhD", "Any"],
            default: "Any",
        },

        // Career Growth/Promotions Information
        careerGrowth: {
            type: String,
            trim: true,
            default: "",
        },

        // Selection Criteria
        selectionCriteria: {
            type: String,
            enum: ["Written Exam", "Interview", "Both", "Degree Marks", "Walk-in", "Online Assessment", "Other"],
            default: "Other",
        },

        // Notification PDF URL
        notificationPdf: {
            type: String,
            trim: true,
            default: "",
        },

        // Optional Poster Image
        poster: {
            type: String,
            trim: true,
            default: "",
        },

        // SEO-friendly slug for URL
        slug: {
            type: String,
            trim: true,
            unique: true,
            sparse: true, // Allow multiple documents without slug (for migration)
        },

        // Status
        isActive: {
            type: Boolean,
            default: true,
        },

        // Posted By (Admin reference)
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        },

        // Approval Status (for public submissions)
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "approved", // Admin-created jobs are auto-approved
        },

        // Submitter Info (for public submissions)
        submitterInfo: {
            name: {
                type: String,
                trim: true,
                default: "",
            },
            email: {
                type: String,
                trim: true,
                lowercase: true,
                default: "",
            },
            phone: {
                type: String,
                trim: true,
                default: "",
            },
            organization: {
                type: String,
                trim: true,
                default: "",
            },
        },

        // Rejection reason (if rejected)
        rejectionReason: {
            type: String,
            trim: true,
            default: "",
        },

        // Approved By (Admin who approved the job)
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null,
        },

        // Approved At timestamp
        approvedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Helper function to generate slug from text
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim()
        .substring(0, 80); // Limit length
};

// Pre-save middleware to generate unique slug
JobSchema.pre('save', async function (next) {
    // Only generate slug if it doesn't exist and title + company are present
    if (!this.slug && this.title && this.company) {
        const baseSlug = generateSlug(`${this.title} ${this.company}`);

        // Add a unique suffix using timestamp + random string
        const uniqueSuffix = Date.now().toString(36).slice(-4) +
            Math.random().toString(36).slice(2, 6);

        this.slug = `${baseSlug}-${uniqueSuffix}`;
    }
    next();
});

// Indexes for efficient queries
JobSchema.index({ isActive: 1, createdAt: -1 });
JobSchema.index({ type: 1, isActive: 1 });
JobSchema.index({ qualification: 1, isActive: 1 });
JobSchema.index({ selectionCriteria: 1, isActive: 1 });
JobSchema.index({ "ageLimit.minAge": 1, "ageLimit.maxAge": 1 });
JobSchema.index({ title: "text", company: "text", description: "text" });
JobSchema.index({ approvalStatus: 1, createdAt: -1 }); // For pending jobs queries
JobSchema.index({ slug: 1 }); // Index for slug lookups

const Job = mongoose.model("Job", JobSchema);

export default Job;
