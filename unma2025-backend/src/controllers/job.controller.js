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
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const query = { isActive: true };

        // Filter by job type
        if (type && type !== "All") {
            query.type = type;
        }

        // Search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
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

        // Search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
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
        if (req.user) {
            jobData.postedBy = req.user.id;
        }

        const job = new Job(jobData);
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

        res.status(200).json({
            status: "success",
            data: {
                ...(stats[0] || {
                    totalJobs: 0,
                    activeJobs: 0,
                    inactiveJobs: 0,
                }),
                jobsByType,
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
