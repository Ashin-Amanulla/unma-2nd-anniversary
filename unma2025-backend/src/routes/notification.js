import express from "express";
import {
  sendAlumniNotificationEmail,
  bulkSendNotifications,
  bulkSendNotificationsToPaidRegistrations,
  sendTuesdayNotifications,
  getNotificationHistory,
  getNotificationStats,
} from "../controllers/notification.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   POST /api/v1/notifications/:registrationId/send
 * @desc    Send notification email/WhatsApp to specific alumni
 * @access  Private (Admin)
 * @body    sendEmail, sendWhatsApp
 */
router.post(
  "/:registrationId/send",
  authenticateToken,
  sendAlumniNotificationEmail
);

/**
 * @route   POST /api/v1/notifications/bulk-send
 * @desc    Send notifications to multiple alumni
 * @access  Private (Admin)
 * @body    registrationIds, sendEmail, sendWhatsApp
 */
router.post("/bulk-send", authenticateToken, bulkSendNotifications);

/**
 * @route   POST /api/v1/notifications/bulk-send-paid
 * @desc    Send notifications to paid registrations who haven't received notifications yet
 * @access  Private (Admin)
 * @body    batchSize (optional, defaults to 500)
 */
router.post("/bulk-send-paid", authenticateToken, bulkSendNotificationsToPaidRegistrations);

/**
 * @route   POST /api/v1/notifications/tuesday-batch
 * @desc    Send Tuesday evening notifications to all registered alumni
 * @access  Private (Admin)
 * @query   dryRun - Boolean to test without sending
 */
router.post("/tuesday-batch", authenticateToken, sendTuesdayNotifications);

/**
 * @route   GET /api/v1/notifications/:registrationId/history
 * @desc    Get notification history for a specific registration
 * @access  Private (Admin)
 */
router.get(
  "/:registrationId/history",
  authenticateToken,
  getNotificationHistory
);

/**
 * @route   GET /api/v1/notifications/stats
 * @desc    Get notification statistics and analytics
 * @access  Private (Admin)
 */
router.get("/stats", authenticateToken, getNotificationStats);

export default router;
