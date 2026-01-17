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
 * @route   GET /api/v1/id-card/:registrationId
 * @desc    Generate and download ID card (PNG or PDF)
 * @access  Private (Admin)
 * @query   format - 'png' or 'pdf' (default: png)
 */
router.get("/:registrationId", generateIDCard);

/**
 * @route   POST /api/v1/id-card/:registrationId/save
 * @desc    Generate and save ID card to file system
 * @access  Private (Admin)
 * @body    filename (optional) - Custom filename
 */
router.post("/:registrationId/save", generateAndSaveIDCard);

/**
 * @route   POST /api/v1/id-card/bulk
 * @desc    Bulk generate ID cards for multiple registrations
 * @access  Private (Admin)
 * @body    registrationIds - Array of registration IDs
 * @body    saveToFile - Boolean (default: false)
 */
router.post("/bulk", bulkGenerateIDCards);

/**
 * @route   GET /api/v1/id-card/:registrationId/preview
 * @desc    Get ID card preview as base64 image
 * @access  Private (Admin)
 */
router.get("/:registrationId/preview", getIDCardPreview);

/**
 * @route   GET /api/v1/id-card/verify/:registrationId
 * @desc    Verify registration using QR code data (Public endpoint)
 * @access  Public
 */
router.get("/verify/:registrationId", verifyRegistration);

/**
 * @route   GET /api/v1/id-card/downloadable
 * @desc    Get list of downloadable ID cards (with payment completed)
 * @access  Private (Admin)
 * @query   page - Page number (default: 1)
 * @query   limit - Records per page (default: 50)
 * @query   search - Search term for name/email/contact
 */
router.get("/downloadable",  getDownloadableIDCards);

/**
 * @route   POST /api/v1/id-card/bulk-download
 * @desc    Bulk download ID cards as ZIP file
 * @access  Private (Admin)
 * @body    registrationIds - Array of registration IDs (optional if downloadAll is true)
 * @body    downloadAll - Boolean to download all paid registrations (default: false)
 */
router.post("/bulk-download",  bulkDownloadIDCards);

/**
 * @route   POST /api/v1/id-card/generate-paid
 * @desc    Generate ID cards for all registrations with completed payment
 * @access  Private (Admin)
 * @body    batchSize - Number of registrations to process (default: 10, max: 50)
 */
router.post(
  "/generate-paid",
  
  generateIDCardsForPaidRegistrations
);

/**
 * @route   GET /api/v1/id-card/stats
 * @desc    Get download statistics and summary
 * @access  Private (Admin)
 */
router.get("/stats",  getDownloadStats);

export default router;
