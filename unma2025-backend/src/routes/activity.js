import express from "express";
import {
    getActivities,
    getAllActivitiesAdmin,
    getActivity,
    createActivity,
    updateActivity,
    deleteActivity,
    togglePublish,
} from "../controllers/activity.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { logUserActivity } from "../middleware/userLogger.js";

const router = express.Router();

// Public routes
router.get("/", getActivities);
router.get("/:id", getActivity);

// Protected admin routes
router.use(verifyToken);

router.get("/admin/all", logUserActivity(), getAllActivitiesAdmin);
router.post("/", logUserActivity(), createActivity);
router.put("/:id", logUserActivity(), updateActivity);
router.delete("/:id", logUserActivity(), deleteActivity);
router.patch("/:id/toggle-publish", logUserActivity(), togglePublish);

export default router;
