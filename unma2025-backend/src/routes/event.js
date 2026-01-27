import express from "express";
import {
    getEvents,
    getAllEventsAdmin,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    togglePublish,
} from "../controllers/event.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { logUserActivity } from "../middleware/userLogger.js";

const router = express.Router();

// Public routes
router.get("/", getEvents);
router.get("/:id", getEvent);

// Protected admin routes
router.use(verifyToken);

router.get("/admin/all", logUserActivity(), getAllEventsAdmin);
router.post("/", logUserActivity(), createEvent);
router.put("/:id", logUserActivity(), updateEvent);
router.delete("/:id", logUserActivity(), deleteEvent);
router.patch("/:id/toggle-publish", logUserActivity(), togglePublish);

export default router;
