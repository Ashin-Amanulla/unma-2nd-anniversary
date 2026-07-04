import express from "express";
import {
  getActiveContest,
  checkEntry,
  submitEntry,
  getBoard,
  getEntry,
  adminGetContest,
  createContest,
  updateContest,
  setupR16,
  enterMatchResult,
  publishRound,
  adminListEntries,
  deleteEntry,
} from "../controllers/fifaBracket.controller.js";
import { verifyToken, verifyFifaAdmin } from "../middleware/auth.js";
import { logUserActivity } from "../middleware/userLogger.js";
import {
  validateFifaBracket,
  checkSchema,
  enterSchema,
  contestSchema,
  updateContestSchema,
  r16SetupSchema,
  matchResultSchema,
  publishRoundSchema,
} from "../validators/fifaBracket.validator.js";

const router = express.Router();

router.get("/contest", getActiveContest);
router.post("/check", validateFifaBracket(checkSchema), checkEntry);
router.post("/enter", validateFifaBracket(enterSchema), submitEntry);
router.get("/board", getBoard);
router.get("/entries/:id", getEntry);

const admin = [verifyToken, verifyFifaAdmin, logUserActivity()];

router.get("/admin/contest", ...admin, adminGetContest);
router.post("/admin/contest", ...admin, validateFifaBracket(contestSchema), createContest);
router.put("/admin/contest/:id", ...admin, validateFifaBracket(updateContestSchema), updateContest);
router.put("/admin/r16", ...admin, validateFifaBracket(r16SetupSchema), setupR16);
router.put("/admin/matches/:id/result", ...admin, validateFifaBracket(matchResultSchema), enterMatchResult);
router.post("/admin/publish", ...admin, validateFifaBracket(publishRoundSchema), publishRound);
router.get("/admin/entries", ...admin, adminListEntries);
router.delete("/admin/entries/:id", ...admin, deleteEntry);

export default router;
