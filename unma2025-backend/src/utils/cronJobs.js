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
 * Start all scheduled cron jobs
 */
export const startCronJobs = () => {
    // Run daily at midnight IST
    cron.schedule("0 0 * * *", deactivateExpiredJobs, {
        timezone: "Asia/Kolkata",
    });

    logger.info("Cron jobs started: deactivateExpiredJobs (daily at midnight IST)");
};
