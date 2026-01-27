import express from "express";
import {
    getActiveJobs,
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    toggleJobStatus,
    getJobStats,
    submitPublicJob,
    getPendingJobs,
    approveJob,
    rejectJob,
} from "../controllers/job.controller.js";
import { verifyToken, verifyCareerAccess } from "../middleware/auth.js";
import { logUserActivity } from "../middleware/userLogger.js";

const router = express.Router();

// Public routes
router.get("/", getActiveJobs);
router.get("/:id", getJobById);
router.post("/public/submit", submitPublicJob); // Public job submission (no auth)

// Protected admin routes
router.use(verifyToken);

router.get("/admin/all", verifyCareerAccess, logUserActivity(), getAllJobs);
router.get("/admin/stats", verifyCareerAccess, logUserActivity(), getJobStats);
router.get("/admin/pending", verifyCareerAccess, logUserActivity(), getPendingJobs);
router.post("/", verifyCareerAccess, logUserActivity(), createJob);
router.put("/:id", verifyCareerAccess, logUserActivity(), updateJob);
router.delete("/:id", verifyCareerAccess, logUserActivity(), deleteJob);
router.patch("/:id/toggle", verifyCareerAccess, logUserActivity(), toggleJobStatus);
router.patch("/:id/approve", verifyCareerAccess, logUserActivity(), approveJob);
router.patch("/:id/reject", verifyCareerAccess, logUserActivity(), rejectJob);

export default router;
