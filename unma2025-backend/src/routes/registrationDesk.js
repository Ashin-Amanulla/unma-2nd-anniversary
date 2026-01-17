import express from "express";
import {
  getRegistrationForEntry,
  updateAttendeeCount,
  markAsEntered,
  getRegistrationDeskStats,
} from "../controllers/registrationDesk.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/v1/registration-desk/entry/:registrationId
 * @desc    Get registration details for entry page
 * @access  Private (Admin)
 */
router.get(
  "/entry/:registrationId",
  authenticateToken,
  getRegistrationForEntry
);

/**
 * @route   PUT /api/v1/registration-desk/attendees/:registrationId
 * @desc    Update attendee count for registration
 * @access  Private (Admin)
 * @body    attendees
 */
router.put(
  "/attendees/:registrationId",
  authenticateToken,
  updateAttendeeCount
);

/**
 * @route   POST /api/v1/registration-desk/enter/:registrationId
 * @desc    Mark registration as entered
 * @access  Private (Admin)
 */
router.post(
  "/enter/:registrationId",
  authenticateToken,
  markAsEntered
);

/**
 * @route   GET /api/v1/registration-desk/stats
 * @desc    Get registration desk statistics
 * @access  Private (Admin)
 */
router.get("/stats", authenticateToken, getRegistrationDeskStats);

export default router;