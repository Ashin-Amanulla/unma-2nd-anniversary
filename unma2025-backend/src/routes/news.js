import express from "express";
import {
    getNewsUpdates,
    getAllNewsAdmin,
    getNewsUpdate,
    createNewsUpdate,
    updateNewsUpdate,
    deleteNewsUpdate,
    togglePublish,
} from "../controllers/news.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { logUserActivity } from "../middleware/userLogger.js";

const router = express.Router();

// Public routes
router.get("/", getNewsUpdates);
router.get("/:id", getNewsUpdate);

// Protected admin routes
router.use(verifyToken);

router.get("/admin/all", logUserActivity(), getAllNewsAdmin);
router.post("/", logUserActivity(), createNewsUpdate);
router.put("/:id", logUserActivity(), updateNewsUpdate);
router.delete("/:id", logUserActivity(), deleteNewsUpdate);
router.patch("/:id/toggle-publish", logUserActivity(), togglePublish);

export default router;
