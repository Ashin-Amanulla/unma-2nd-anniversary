import express from "express";

import { verifyToken, verifySuperAdmin } from "../middleware/auth.js";
import {
  getAnalytics,
  getDistrictAnalytics,
  getPaymentAnalytics,
  getRazorpayPaymentsBySchool,
  getDashboardStats,
  getRegistrationStats,
  getDailyRegistrations,
  exportAllRegistrations,
} from "../controllers/analytics.controller.js";
import {
  getAdmin,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  createSubAdmin,
  getSubAdmins,
  updateSubAdmin,
  getAvailableSchools,
} from "../controllers/admin.controller.js";
import { logUserActivity } from "../middleware/userLogger.js";
const router = express.Router();

router.use(verifyToken);
// Utility routes
router.get("/schools", getAvailableSchools);

// Dashboard and stats routes
router.get("/dashboard-stats", logUserActivity(), getDashboardStats);
router.get("/registration-stats", getRegistrationStats);
router.get("/daily-registrations", getDailyRegistrations);

// Analytics routes
router.get("/analytics", logUserActivity(), getAnalytics);
router.get("/analytics/district", getDistrictAnalytics);
router.get("/analytics/payment", getPaymentAnalytics);
router.get("/analytics/razorpay-payments", logUserActivity(), getRazorpayPaymentsBySchool);
router.get("/analytics/export", logUserActivity(), exportAllRegistrations);

// Sub-admin management routes
router.post("/sub-admins", logUserActivity(), verifySuperAdmin, createSubAdmin);
router.get("/sub-admins", logUserActivity(), verifySuperAdmin, getSubAdmins);
router.put(
  "/sub-admins/:id",
  logUserActivity(),
  verifySuperAdmin,
  updateSubAdmin
);

// Admin CRUD routes
router.get("/", getAdmin);
router.get("/:id", getAdminById);
router.post("/", createAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;
