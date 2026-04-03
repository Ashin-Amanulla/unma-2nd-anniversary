import cron from "node-cron";
import Job from "../models/Job.js";
import { logger } from "./logger.js";

/**
 * Deactivate jobs whose deadline has passed
 * Runs daily at midnight IST (18:30 UTC)
 */
const deactivateExpiredJobs = async () => {
    try {
        const now = new Date();
        const result = await Job.updateMany(
            {
                isActive: true,
                deadline: { $ne: null, $lt: now },
            },
            { $set: { isActive: false } }
        );

        if (result.modifiedCount > 0) {
            logger.info(`Cron: Deactivated ${result.modifiedCount} expired job(s)`);
        }
    } catch (error) {
        logger.error("Cron: Error deactivating expired jobs:", error);
    }
};

/**
 * Permanently delete jobs past retention:
 * - With deadline: delete 7+ days after deadline
 * - Without deadline: delete 40+ days after createdAt
 */
const deleteExpiredJobs = async () => {
    try {
        const now = new Date();

        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const fortyDaysAgo = new Date(now);
        fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);

        const result = await Job.deleteMany({
            $or: [
                { deadline: { $ne: null, $lt: sevenDaysAgo } },
                { deadline: null, createdAt: { $lt: fortyDaysAgo } },
            ],
        });

        if (result.deletedCount > 0) {
            logger.info(`Cron: Deleted ${result.deletedCount} expired job(s)`);
        }
    } catch (error) {
        logger.error("Cron: Error deleting expired jobs:", error);
    }
};

/**
 * Start all scheduled cron jobs
 */
export const startCronJobs = () => {
    // Run daily at midnight IST
    cron.schedule("0 0 * * *", deactivateExpiredJobs, {
        timezone: "Asia/Kolkata",
    });

    cron.schedule("0 0 * * *", deleteExpiredJobs, {
        timezone: "Asia/Kolkata",
    });

    logger.info(
        "Cron jobs started: deactivateExpiredJobs, deleteExpiredJobs (daily at midnight IST)"
    );
};
