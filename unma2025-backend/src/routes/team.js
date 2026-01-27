import express from "express";
import {
    getTeamMembers,
    getTeamMember,
    createTeamMember,
    updateTeamMember,
    deleteTeamMember,
} from "../controllers/team.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { logUserActivity } from "../middleware/userLogger.js";

const router = express.Router();

// Public routes
router.get("/", getTeamMembers);
router.get("/:id", getTeamMember);

// Protected admin routes
router.use(verifyToken);

router.post("/", logUserActivity(), createTeamMember);
router.put("/:id", logUserActivity(), updateTeamMember);
router.delete("/:id", logUserActivity(), deleteTeamMember);

export default router;
