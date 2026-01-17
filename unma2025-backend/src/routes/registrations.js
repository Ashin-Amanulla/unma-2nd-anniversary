import express from "express";
import {
  getAllRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration,
  sendOtp,
  verifyOtp,
  processPayment,
  getRegistrationsByType,
  getRegistrationStats,
  getRegistrationByContact,
  saveRegistrationStep,
  sendMessage,
  transactionRegister,
  updateRegistrationPayment,
  addMoreAmount,
  staffRegistration,
  createQuickRegistration,
  tempQuickRegistration,
  findDuplicateRegistrations,
  deleteDuplicatePendingRegistrations,
  addNumberToregistration,
  getSerialNumberStatus,
  assignSerialNumberToRegistration,
  bulkAutoAssignSerialNumbers,
} from "../controllers/registrations.controller.js";
import { verifyToken, verifySuperAdmin } from "../middleware/auth.js";
import { logUserActivity } from "../middleware/userLogger.js";

const router = express.Router();

// Public endpoints

// Get registration by email/contact (for alumni updates)
router.post("/get-by-contact", getRegistrationByContact);

// Get registration by ID for feedback (public endpoint)
router.get("/feedback/:id", getRegistrationById);

// Send OTP for verification
router.post("/send-otp", sendOtp);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Save registration step (multi-step form)
router.post("/step/:id", saveRegistrationStep);

// Process payment
router.post("/:id/payment", processPayment);

router.post("/send-message", sendMessage);

//transaction register
router.post("/transaction/:id", transactionRegister);

// Update registration
router.put("/:id", updateRegistrationPayment);

//add more amount
router.patch("/:id/add-more-amount", addMoreAmount);

router.post("/staff/:id", staffRegistration);

router.post("/quick-registration/:id", createQuickRegistration);

router.post("/temp-quick-registration", tempQuickRegistration);

// Protected endpoints (require authentication)
router.use(verifyToken);

// Get all registrations with filtering and pagination
router.get("/", logUserActivity(), getAllRegistrations);

// Get registrations by type
router.get("/type/:type", getRegistrationsByType);

// Get registration statistics
router.get("/stats", getRegistrationStats);

// Get duplicate registrations report (Excel export)
router.get("/duplicates/export", logUserActivity(), findDuplicateRegistrations);

// Delete duplicate registrations with pending payment status (super admin only)
router.delete(
  "/duplicates/delete-pending",

  deleteDuplicatePendingRegistrations
);

router.get("/addNumber", logUserActivity(), addNumberToregistration);
router.get("/serial-number-status", logUserActivity(), getSerialNumberStatus);
router.post(
  "/assign-serial",
  logUserActivity(),
  assignSerialNumberToRegistration
);
router.post(
  "/bulk-auto-assign-serial",
  logUserActivity(),
  bulkAutoAssignSerialNumbers
);

router.put("/adminEdit/:id", updateRegistration);

// Get registration by id
router.get("/:id", logUserActivity(), getRegistrationById);

// Delete registration (admin only)
router.delete("/:id", verifySuperAdmin, deleteRegistration);

export default router;
