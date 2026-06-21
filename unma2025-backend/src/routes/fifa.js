import express from "express";
import {
  getActiveCampaign,
  getLeaderboard,
  joinContest,
  resendCode,
  verifyCode,
  updateMySchool,
  getSlotPredictions,
  getMyPredictions,
  submitPrediction,
  createCampaign,
  updateCampaign,
  createSlot,
  updateSlot,
  deleteSlot,
  listSlots,
  createMatch,
  updateMatch,
  deleteMatch,
  getAdminMatches,
  enterMatchResult,
  regradeMatch,
  getSlotGrading,
  getGradingQueue,
  gradeAnswerManually,
  listParticipants,
  updateParticipantPoints,
  deleteParticipant,
} from "../controllers/fifa.controller.js";
import { verifyToken, verifyFifaAdmin } from "../middleware/auth.js";
import { logUserActivity } from "../middleware/userLogger.js";
import {
  validateFifa,
  joinSchema,
  resendSchema,
  verifySchema,
  myPredictionsSchema,
  updateSchoolSchema,
  predictSchema,
  campaignSchema,
  updateCampaignSchema,
  slotSchema,
  updateSlotSchema,
  matchSchema,
  updateMatchSchema,
  enterResultSchema,
  gradeOverrideSchema,
  updateParticipantPointsSchema,
} from "../validators/fifa.validator.js";

const router = express.Router();

router.get("/campaign", getActiveCampaign);
router.get("/leaderboard", getLeaderboard);

router.post("/join", validateFifa(joinSchema), joinContest);
router.post("/resend", validateFifa(resendSchema), resendCode);
router.post("/verify", validateFifa(verifySchema), verifyCode);
router.patch("/school", validateFifa(updateSchoolSchema), updateMySchool);

router.post("/predictions", validateFifa(myPredictionsSchema), getMyPredictions);
router.post("/predict", validateFifa(predictSchema), submitPrediction);
router.get("/slots/:slotId/predictions", getSlotPredictions);

const fifaAdmin = [verifyToken, verifyFifaAdmin, logUserActivity()];

router.post("/admin/campaign", ...fifaAdmin, validateFifa(campaignSchema), createCampaign);
router.put(
  "/admin/campaign/:id",
  ...fifaAdmin,
  validateFifa(updateCampaignSchema),
  updateCampaign
);

router.get("/admin/slots", ...fifaAdmin, listSlots);
router.post("/admin/slots", ...fifaAdmin, validateFifa(slotSchema), createSlot);
router.put("/admin/slots/:id", ...fifaAdmin, validateFifa(updateSlotSchema), updateSlot);
router.delete("/admin/slots/:id", ...fifaAdmin, deleteSlot);

router.get("/admin/matches", ...fifaAdmin, getAdminMatches);
router.post("/admin/matches", ...fifaAdmin, validateFifa(matchSchema), createMatch);
router.put("/admin/matches/:id", ...fifaAdmin, validateFifa(updateMatchSchema), updateMatch);
router.delete("/admin/matches/:id", ...fifaAdmin, deleteMatch);
router.put(
  "/admin/matches/:id/result",
  ...fifaAdmin,
  validateFifa(enterResultSchema),
  enterMatchResult
);
router.post("/admin/matches/:id/regrade", ...fifaAdmin, regradeMatch);

router.get("/admin/grading/queue", ...fifaAdmin, getGradingQueue);
router.get("/admin/grading/slot/:slotId", ...fifaAdmin, getSlotGrading);
router.put(
  "/admin/grading/:predictionId/:answerId",
  ...fifaAdmin,
  validateFifa(gradeOverrideSchema),
  gradeAnswerManually
);

router.get("/admin/participants", ...fifaAdmin, listParticipants);
router.patch(
  "/admin/participants/:id/points",
  ...fifaAdmin,
  validateFifa(updateParticipantPointsSchema),
  updateParticipantPoints
);
router.delete("/admin/participants/:id", ...fifaAdmin, deleteParticipant);

export default router;
