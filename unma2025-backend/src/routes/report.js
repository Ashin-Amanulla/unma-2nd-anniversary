import express from "express";
import {
    getSchoolWiseReport,
    getBatchWiseReport,
    exportSchoolWiseCSV,
    exportBatchWiseCSV,
    exportFullRazorpayHistoryCSV,
} from "../controllers/report.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { logUserActivity } from "../middleware/userLogger.js";

const router = express.Router();

// Protected endpoints (require authentication)
// router.use(verifyToken);

// Get school-wise payment report (JSON)
router.get("/school-wise", logUserActivity(), getSchoolWiseReport);

// Get batch-wise payment report (JSON)
router.get("/batch-wise", logUserActivity(), getBatchWiseReport);

// Export school-wise report as CSV
router.get("/school-wise/export", logUserActivity(), exportSchoolWiseCSV);

// Export batch-wise report as CSV
router.get("/batch-wise/export", logUserActivity(), exportBatchWiseCSV);

// Export full Razorpay transaction history as CSV
router.get(
    "/razorpay-full-history/export",
    logUserActivity(),
    exportFullRazorpayHistoryCSV
);

export default router;

