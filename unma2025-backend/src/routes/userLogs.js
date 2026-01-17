import express from "express";
import { verifyToken, verifySuperAdmin } from "../middleware/auth.js";
import {
  getUserLogs,
  getUserLogById,
  getUserLogsStats,
  getUserActivityTimeline,
  exportUserLogs,
  cleanupUserLogs,
} from "../controllers/userLogs.controller.js";

const router = express.Router();

// All user log routes require super admin access
router.use(verifyToken);
router.use(verifySuperAdmin);

// Get all user logs with filtering and pagination
router.get("/", getUserLogs);

// Get user logs statistics
router.get("/stats", getUserLogsStats);

// Get specific user log by ID
router.get("/:id", getUserLogById);

// Get activity timeline for a specific user
router.get("/user/:userId/timeline", getUserActivityTimeline);

// Export user logs
router.get("/export", exportUserLogs);

// Cleanup old logs (DELETE operation)
router.delete("/cleanup", cleanupUserLogs);

export default router;
