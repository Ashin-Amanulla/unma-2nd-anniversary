import express from "express";
import {
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  getRegistrationStats,
} from "../controllers/republicDayEvent.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { validateRepublicDayEventRegistration } from "../validators/republicDayEvent.validator.js";
import { logUserActivity } from "../middleware/userLogger.js";

const router = express.Router();

// Public routes
router.post(
  "/register",
  validateRepublicDayEventRegistration,
  createRegistration
);

// Protected admin routes
router.use(verifyToken);

router.get("/registrations", logUserActivity(), getAllRegistrations);
router.get("/registrations/:id", logUserActivity(), getRegistrationById);
router.get("/stats", logUserActivity(), getRegistrationStats);

export default router;
