import express from "express";
import * as feedbackController from "../controllers/feedback.controller.js";
import { verifyToken, verifySuperAdmin } from "../middleware/auth.js";
import Joi from "joi";

const router = express.Router();

// Validation schemas
const submitFeedbackSchema = Joi.object({
  registrationId: Joi.string().optional(),
  name: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().email().required().trim().lowercase(),
  phone: Joi.string().optional().trim(),
  school: Joi.string().optional().trim(),
  overallSatisfaction: Joi.number().required().min(1).max(5),
  mostEnjoyedAspect: Joi.string().required().trim().min(10).max(1000),
  organizationRating: Joi.number().required().min(1).max(5),
  sessionUsefulness: Joi.number().required().min(1).max(5),
  favoriteSpeakerSession: Joi.string().required().trim().min(5).max(500),
  wouldRecommend: Joi.string().required().valid("Yes", "No", "Maybe"),
  improvementSuggestions: Joi.string().required().trim().min(10).max(1000),
  accommodationRating: Joi.number().optional().min(1).max(5),
  accommodationFeedback: Joi.string().optional().trim().max(500),
  transportationRating: Joi.number().optional().min(1).max(5),
  transportationFeedback: Joi.string().optional().trim().max(500),
  foodQualityRating: Joi.number().optional().min(1).max(5),
  networkingOpportunitiesRating: Joi.number().optional().min(1).max(5),
  venueQualityRating: Joi.number().optional().min(1).max(5),
  audioVisualRating: Joi.number().optional().min(1).max(5),
  eventScheduleRating: Joi.number().optional().min(1).max(5),
  registrationProcessRating: Joi.number().optional().min(1).max(5),
  communicationRating: Joi.number().optional().min(1).max(5),
  favoriteHighlight: Joi.string().optional().trim().max(500),
  comparedToExpectations: Joi.string()
    .optional()
    .valid("Exceeded", "Met", "Below"),
  wouldAttendFuture: Joi.string()
    .optional()
    .valid("Definitely", "Probably", "Not Sure", "Probably Not"),
  topAreaForImprovement: Joi.string().optional().trim().max(500),
  futureSessionSuggestions: Joi.string().optional().trim().max(500),
  additionalComments: Joi.string().optional().trim().max(1000),
});

// Public routes
router.post("/submit", feedbackController.submitFeedback);

router.get("/check-status", feedbackController.checkFeedbackStatus);

router.use(verifyToken);
// Admin routes
router.get("/all", verifyToken, feedbackController.getAllFeedback);

router.get("/stats", verifyToken, feedbackController.getFeedbackStats);

router.get("/export", verifyToken, feedbackController.exportFeedback);

router.get("/:id", verifyToken, feedbackController.getFeedbackById);

export default router;
