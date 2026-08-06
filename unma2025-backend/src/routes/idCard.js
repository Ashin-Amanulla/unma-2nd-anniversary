import express from "express";
import {
  generateIDCard,
  generateAndSaveIDCard,
  bulkGenerateIDCards,
  getIDCardPreview,
  verifyRegistration,
  getDownloadableIDCards,
  bulkDownloadIDCards,
  generateIDCardsForPaidRegistrations,
  getDownloadStats,
} from "../controllers/idCard.controller.js";

const router = express.Router();

/**
 * @route   GET /api/v1/id-card/stats
 * @desc    Get download statistics and summary
 * @access  Private (Admin)
 */
router.get("/stats", getDownloadStats);

/**
 * @route   GET /api/v1/id-card/downloadable
 * @desc    Get list of downloadable ID cards (with payment completed)
 * @access  Private (Admin)
 */
router.get("/downloadable", getDownloadableIDCards);

/**
 * @route   POST /api/v1/id-card/bulk
 * @desc    Bulk generate ID cards for multiple registrations
 * @access  Private (Admin)
 */
router.post("/bulk", bulkGenerateIDCards);

/**
 * @route   POST /api/v1/id-card/bulk-download
 * @desc    Bulk download ID cards as ZIP file
 * @access  Private (Admin)
 */
router.post("/bulk-download", bulkDownloadIDCards);

/**
 * @route   POST /api/v1/id-card/generate-paid
 * @desc    Generate ID cards for all registrations with completed payment
 * @access  Private (Admin)
 */
router.post("/generate-paid", generateIDCardsForPaidRegistrations);

/**
 * @route   GET /api/v1/id-card/verify/:registrationId
 * @desc    Verify registration using QR code data (Public endpoint)
 * @access  Public
 */
router.get("/verify/:registrationId", verifyRegistration);

/**
 * @route   GET /api/v1/id-card/:registrationId/preview
 * @desc    Get ID card preview as base64 image
 * @access  Private (Admin)
 */
router.get("/:registrationId/preview", getIDCardPreview);

/**
 * @route   POST /api/v1/id-card/:registrationId/save
 * @desc    Generate and save ID card to file system
 * @access  Private (Admin)
 */
router.post("/:registrationId/save", generateAndSaveIDCard);

/**
 * @route   GET /api/v1/id-card/:registrationId
 * @desc    Generate and download ID card (PNG or PDF)
 * @access  Private (Admin)
 * @query   format - 'png' or 'pdf' (default: png)
 */
router.get("/:registrationId", generateIDCard);

export default router;
