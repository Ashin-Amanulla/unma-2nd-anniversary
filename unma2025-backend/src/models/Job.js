import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
    {
        // Basic Job Information
        title: {
            type: String,
            required: function() {
                return this.category !== "Job Fair";
            },
            trim: true,
            maxlength: 200,
        },
        company: {
            type: String,
            required: function() {
                return this.category !== "Job Fair";
            },
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
            required: function() {
                return this.category !== "Job Fair";
            },
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

        // Category: Job or Job Fair
        category: {
            type: String,
            enum: ["Job", "Job Fair"],
            default: "Job",
        },

        // Job Fair specific details (when category is "Job Fair")
        jobFairDetails: {
            eventDate: {
                type: Date,
                default: null,
            },
            venue: {
                type: String,
                trim: true,
                default: "",
            },
            organizer: {
                type: String,
                trim: true,
                default: "",
            },
            registrationLink: {
                type: String,
                trim: true,
                default: "",
            },
            participatingCompanies: {
                type: [String],
                default: [],
            },
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
            enum: ["10th Pass", "12th Pass", "Diploma", "Ongoing Degree", "Graduate", "Post Graduate", "PhD", "Any"],
            default: "Any",
        },

        // Career Growth/Promotions Information
        careerGrowth: {
            type: String,
            trim: true,
            default: "",
        },

        // Selection Criteria (multi-select)
        selectionCriteria: {
            type: [String],
            enum: [
                "Objective Examination",
                "Descriptive Examination",
                "Interview",
                "Group Discussion",
                "Degree Marks",
                "12th Marks",
                "10th Marks",
                "Field Experience",
                "Medical Examination",
                "Physical Examination",
            ],
            default: [],
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

// Pre-save middleware to normalize selectionCriteria (support legacy string)
JobSchema.pre('save', function (next) {
    if (this.selectionCriteria != null) {
        this.selectionCriteria = Array.isArray(this.selectionCriteria)
            ? this.selectionCriteria
            : typeof this.selectionCriteria === 'string' && this.selectionCriteria
                ? [this.selectionCriteria]
                : [];
    }
    next();
});

// Pre-save middleware to auto-populate title/company for Job Fairs and generate unique slug
JobSchema.pre('save', async function (next) {
    // Auto-populate title and company for Job Fairs from organizer and event date
    if (this.category === "Job Fair") {
        if (!this.title && this.jobFairDetails?.organizer) {
            const eventDate = this.jobFairDetails.eventDate 
                ? new Date(this.jobFairDetails.eventDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : '';
            this.title = eventDate 
                ? `Job Fair - ${eventDate}`
                : 'Job Fair';
        }
        if (!this.company && this.jobFairDetails?.organizer) {
            this.company = this.jobFairDetails.organizer;
        }
    }

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
JobSchema.index({ category: 1, isActive: 1 });
JobSchema.index({ qualification: 1, isActive: 1 });
JobSchema.index({ "ageLimit.minAge": 1, "ageLimit.maxAge": 1 });
JobSchema.index({ title: "text", company: "text", description: "text" });
JobSchema.index({ approvalStatus: 1, createdAt: -1 }); // For pending jobs queries
JobSchema.index({ slug: 1 }); // Index for slug lookups

const Job = mongoose.model("Job", JobSchema);

export default Job;
