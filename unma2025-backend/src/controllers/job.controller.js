import Job from "../models/Job.js";
import { logger } from "../utils/logger.js";

/**
 * Get all active jobs (Public endpoint)
 * Supports pagination and filtering by type
 */
export const getActiveJobs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            type,
            search,
            qualification,
            selectionCriteria,
            minAge,
            maxAge,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        // Show approved jobs, or legacy jobs without approvalStatus (created before approval workflow)
        const query = {
            isActive: true,
            $or: [
                { approvalStatus: "approved" },
                { approvalStatus: { $exists: false } },
                { approvalStatus: null },
            ],
        };

        // Filter by job type
        if (type && type !== "All") {
            query.type = type;
        }

        // Filter by qualification
        if (qualification && qualification !== "All" && qualification !== "Any") {
            query.qualification = qualification;
        }

        // Filter by selection criteria
        if (selectionCriteria && selectionCriteria !== "All") {
            query.selectionCriteria = selectionCriteria;
        }

        // Filter by age range - find jobs where age range overlaps with filter range
        // Job age range overlaps if: job.minAge <= filter.maxAge AND job.maxAge >= filter.minAge
        if (minAge || maxAge) {
            const ageConditions = [];
            
            if (minAge && maxAge) {
                // Both min and max provided - find overlapping ranges
                ageConditions.push(
                    // Job has both min and max, and ranges overlap
                    {
                        "ageLimit.minAge": { $exists: true, $ne: null, $lte: Number(maxAge) },
                        "ageLimit.maxAge": { $exists: true, $ne: null, $gte: Number(minAge) },
                    },
                    // Job has only max age, and it's within range
                    {
                        "ageLimit.minAge": null,
                        "ageLimit.maxAge": { $exists: true, $ne: null, $gte: Number(minAge), $lte: Number(maxAge) },
                    },
                    // Job has only min age, and it's within range
                    {
                        "ageLimit.maxAge": null,
                        "ageLimit.minAge": { $exists: true, $ne: null, $gte: Number(minAge), $lte: Number(maxAge) },
                    },
                    // Job has no age restrictions
                    {
                        "ageLimit.minAge": null,
                        "ageLimit.maxAge": null,
                    }
                );
            } else if (minAge) {
                // Only min age provided
                ageConditions.push(
                    { "ageLimit.maxAge": { $exists: true, $ne: null, $gte: Number(minAge) } },
                    { "ageLimit.maxAge": null }
                );
            } else if (maxAge) {
                // Only max age provided
                ageConditions.push(
                    { "ageLimit.minAge": { $exists: true, $ne: null, $lte: Number(maxAge) } },
                    { "ageLimit.minAge": null }
                );
            }
            
            if (ageConditions.length > 0) {
                query.$and = query.$and || [];
                query.$and.push({ $or: ageConditions });
            }
        }

        // Search filter
        if (search) {
            const searchConditions = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { company: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                    { location: { $regex: search, $options: "i" } },
                ],
            };
            
            if (query.$and) {
                query.$and.push(searchConditions);
            } else {
                query.$and = [searchConditions];
            }
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        const jobs = await Job.find(query)
            .select("-postedBy")
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .lean();

        const total = await Job.countDocuments(query);

        res.status(200).json({
            status: "success",
            data: jobs,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        logger.error("Error fetching active jobs:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch jobs",
            error: error.message,
        });
    }
};

/**
 * Get all jobs (Admin endpoint)
 * Includes inactive jobs
 */
export const getAllJobs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            type,
            search,
            isActive,
            qualification,
            selectionCriteria,
            minAge,
            maxAge,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const query = {};

        // Filter by job type
        if (type && type !== "All") {
            query.type = type;
        }

        // Filter by active status
        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        // Filter by qualification
        if (qualification && qualification !== "All" && qualification !== "Any") {
            query.qualification = qualification;
        }

        // Filter by selection criteria
        if (selectionCriteria && selectionCriteria !== "All") {
            query.selectionCriteria = selectionCriteria;
        }

        // Filter by age range - find jobs where age range overlaps with filter range
        if (minAge || maxAge) {
            const ageConditions = [];
            
            if (minAge && maxAge) {
                ageConditions.push(
                    {
                        "ageLimit.minAge": { $exists: true, $ne: null, $lte: Number(maxAge) },
                        "ageLimit.maxAge": { $exists: true, $ne: null, $gte: Number(minAge) },
                    },
                    {
                        "ageLimit.minAge": null,
                        "ageLimit.maxAge": { $exists: true, $ne: null, $gte: Number(minAge), $lte: Number(maxAge) },
                    },
                    {
                        "ageLimit.maxAge": null,
                        "ageLimit.minAge": { $exists: true, $ne: null, $gte: Number(minAge), $lte: Number(maxAge) },
                    },
                    {
                        "ageLimit.minAge": null,
                        "ageLimit.maxAge": null,
                    }
                );
            } else if (minAge) {
                ageConditions.push(
                    { "ageLimit.maxAge": { $exists: true, $ne: null, $gte: Number(minAge) } },
                    { "ageLimit.maxAge": null }
                );
            } else if (maxAge) {
                ageConditions.push(
                    { "ageLimit.minAge": { $exists: true, $ne: null, $lte: Number(maxAge) } },
                    { "ageLimit.minAge": null }
                );
            }
            
            if (ageConditions.length > 0) {
                query.$and = query.$and || [];
                query.$and.push({ $or: ageConditions });
            }
        }

        // Search filter
        if (search) {
            const searchConditions = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { company: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                    { location: { $regex: search, $options: "i" } },
                ],
            };
            
            if (query.$and) {
                query.$and.push(searchConditions);
            } else {
                query.$and = [searchConditions];
            }
        }

        const skip = (Number(page) - 1) * Number(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        const jobs = await Job.find(query)
            .populate("postedBy", "name email")
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .lean();

        const total = await Job.countDocuments(query);

        res.status(200).json({
            status: "success",
            data: jobs,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        logger.error("Error fetching all jobs:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch jobs",
            error: error.message,
        });
    }
};

/**
 * Get job by ID (Public/Admin)
 */
export const getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id)
            .populate("postedBy", "name email")
            .lean();

        if (!job) {
            return res.status(404).json({
                status: "error",
                message: "Job not found",
            });
        }

        res.status(200).json({
            status: "success",
            data: job,
        });
    } catch (error) {
        logger.error("Error fetching job by ID:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch job",
            error: error.message,
        });
    }
};

/**
 * Create new job (Admin endpoint)
 */
export const createJob = async (req, res) => {
    try {
        const jobData = req.body;

        // Add the admin who posted the job
        if (req.admin) {
            jobData.postedBy = req.admin._id;
        }

        const job = new Job(jobData);
        await job.save();

        // Admin-created jobs are auto-approved
        job.approvalStatus = "approved";
        job.approvedBy = req.admin?._id || null;
        job.approvedAt = new Date();
        await job.save();

        logger.info(`Job created: ${job.title} at ${job.company}`);

        res.status(201).json({
            status: "success",
            message: "Job created successfully",
            data: job,
        });
    } catch (error) {
        logger.error("Error creating job:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to create job",
            error: error.message,
        });
    }
};

/**
 * Update job (Admin endpoint)
 */
export const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const job = await Job.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!job) {
            return res.status(404).json({
                status: "error",
                message: "Job not found",
            });
        }

        logger.info(`Job updated: ${job.title} (${job._id})`);

        res.status(200).json({
            status: "success",
            message: "Job updated successfully",
            data: job,
        });
    } catch (error) {
        logger.error("Error updating job:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to update job",
            error: error.message,
        });
    }
};

/**
 * Delete job (Admin endpoint)
 */
export const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findByIdAndDelete(id);

        if (!job) {
            return res.status(404).json({
                status: "error",
                message: "Job not found",
            });
        }

        logger.info(`Job deleted: ${job.title} (${job._id})`);

        res.status(200).json({
            status: "success",
            message: "Job deleted successfully",
        });
    } catch (error) {
        logger.error("Error deleting job:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to delete job",
            error: error.message,
        });
    }
};

/**
 * Toggle job active status (Admin endpoint)
 */
export const toggleJobStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                status: "error",
                message: "Job not found",
            });
        }

        job.isActive = !job.isActive;
        await job.save();

        logger.info(`Job status toggled: ${job.title} - isActive: ${job.isActive}`);

        res.status(200).json({
            status: "success",
            message: `Job ${job.isActive ? "activated" : "deactivated"} successfully`,
            data: job,
        });
    } catch (error) {
        logger.error("Error toggling job status:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to toggle job status",
            error: error.message,
        });
    }
};

/**
 * Get job statistics (Admin endpoint)
 */
export const getJobStats = async (req, res) => {
    try {
        const stats = await Job.aggregate([
            {
                $group: {
                    _id: null,
                    totalJobs: { $sum: 1 },
                    activeJobs: {
                        $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    },
                    inactiveJobs: {
                        $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
                    },
                },
            },
        ]);

        // Get jobs by type
        const jobsByType = await Job.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);

        // Get jobs by qualification
        const jobsByQualification = await Job.aggregate([
            {
                $group: {
                    _id: "$qualification",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);

        // Get jobs by selection criteria
        const jobsBySelectionCriteria = await Job.aggregate([
            {
                $group: {
                    _id: "$selectionCriteria",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);

        res.status(200).json({
            status: "success",
            data: {
                ...(stats[0] || {
                    totalJobs: 0,
                    activeJobs: 0,
                    inactiveJobs: 0,
                }),
                jobsByType,
                jobsByQualification,
                jobsBySelectionCriteria,
            },
        });
    } catch (error) {
        logger.error("Error fetching job stats:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch statistics",
            error: error.message,
        });
    }
};

/**
 * Submit job for public approval (Public endpoint - no auth required)
 */
export const submitPublicJob = async (req, res) => {
    try {
        const {
            title,
            company,
            description,
            type,
            location,
            salary,
            requirements,
            responsibilities,
            applicationUrl,
            applicationEmail,
            contactPerson,
            contactPhone,
            deadline,
            ageLimit,
            qualification,
            careerGrowth,
            selectionCriteria,
            image,
            notificationPdf,
            poster,
            // Submitter info
            submitterName,
            submitterEmail,
            submitterPhone,
            submitterOrganization,
        } = req.body;

        // Validate required fields
        if (!title || !company || !description || !type) {
            return res.status(400).json({
                status: "error",
                message: "Title, company, description, and type are required",
            });
        }

        // Validate submitter info
        if (!submitterName || !submitterEmail) {
            return res.status(400).json({
                status: "error",
                message: "Submitter name and email are required",
            });
        }

        // Process requirements and responsibilities (split by newline if string)
        let requirementsArray = [];
        let responsibilitiesArray = [];

        if (requirements) {
            requirementsArray = Array.isArray(requirements)
                ? requirements
                : requirements.split("\n").filter((r) => r.trim());
        }

        if (responsibilities) {
            responsibilitiesArray = Array.isArray(responsibilities)
                ? responsibilities
                : responsibilities.split("\n").filter((r) => r.trim());
        }

        const jobData = {
            title,
            company,
            description,
            type,
            location: location || "",
            salary: salary || "",
            requirements: requirementsArray,
            responsibilities: responsibilitiesArray,
            applicationUrl: applicationUrl || "",
            applicationEmail: applicationEmail || "",
            contactPerson: contactPerson || "",
            contactPhone: contactPhone || "",
            deadline: deadline || null,
            ageLimit: ageLimit || { minAge: null, maxAge: null },
            qualification: qualification || "Any",
            careerGrowth: careerGrowth || "",
            selectionCriteria: selectionCriteria || "Other",
            image: image || "",
            notificationPdf: notificationPdf || "",
            poster: poster || "",
            isActive: true,
            approvalStatus: "pending", // Public submissions start as pending
            submitterInfo: {
                name: submitterName,
                email: submitterEmail,
                phone: submitterPhone || "",
                organization: submitterOrganization || "",
            },
        };

        const job = new Job(jobData);
        await job.save();

        logger.info(`Public job submission received: ${job.title} at ${job.company} by ${submitterEmail}`);

        res.status(201).json({
            status: "success",
            message: "Job submitted successfully. It will be reviewed by an administrator before being published.",
            data: {
                id: job._id,
                title: job.title,
                company: job.company,
            },
        });
    } catch (error) {
        logger.error("Error submitting public job:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to submit job",
            error: error.message,
        });
    }
};

/**
 * Get pending jobs (Admin endpoint)
 */
export const getPendingJobs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const query = { approvalStatus: "pending" };

        const skip = (Number(page) - 1) * Number(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        const jobs = await Job.find(query)
            .populate("postedBy", "name email")
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .lean();

        const total = await Job.countDocuments(query);

        res.status(200).json({
            status: "success",
            data: jobs,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        logger.error("Error fetching pending jobs:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch pending jobs",
            error: error.message,
        });
    }
};

/**
 * Approve a job (Admin endpoint)
 */
export const approveJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                status: "error",
                message: "Job not found",
            });
        }

        if (job.approvalStatus !== "pending") {
            return res.status(400).json({
                status: "error",
                message: `Job is already ${job.approvalStatus}`,
            });
        }

        job.approvalStatus = "approved";
        job.approvedBy = req.admin._id;
        job.approvedAt = new Date();
        await job.save();

        logger.info(`Job approved: ${job.title} (${job._id}) by ${req.admin.email}`);

        res.status(200).json({
            status: "success",
            message: "Job approved successfully",
            data: job,
        });
    } catch (error) {
        logger.error("Error approving job:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to approve job",
            error: error.message,
        });
    }
};

/**
 * Reject a job (Admin endpoint)
 */
export const rejectJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({
                status: "error",
                message: "Job not found",
            });
        }

        if (job.approvalStatus !== "pending") {
            return res.status(400).json({
                status: "error",
                message: `Job is already ${job.approvalStatus}`,
            });
        }

        job.approvalStatus = "rejected";
        job.rejectionReason = reason || "";
        job.approvedBy = req.admin._id;
        job.approvedAt = new Date();
        await job.save();

        logger.info(`Job rejected: ${job.title} (${job._id}) by ${req.admin.email}. Reason: ${reason || "No reason provided"}`);

        res.status(200).json({
            status: "success",
            message: "Job rejected successfully",
            data: job,
        });
    } catch (error) {
        logger.error("Error rejecting job:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to reject job",
            error: error.message,
        });
    }
};
