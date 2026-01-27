import express from "express";
import {
    getUpdates,
    getAllUpdatesAdmin,
    getUpdate,
    createUpdate,
    updateUpdate,
    deleteUpdate,
    togglePublish,
} from "../controllers/update.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { logUserActivity } from "../middleware/userLogger.js";

const router = express.Router();

// Public routes
router.get("/", getUpdates);
router.get("/:id", getUpdate);

// Protected admin routes
router.use(verifyToken);

router.get("/admin/all", logUserActivity(), getAllUpdatesAdmin);
router.post("/", logUserActivity(), createUpdate);
router.put("/:id", logUserActivity(), updateUpdate);
router.delete("/:id", logUserActivity(), deleteUpdate);
router.patch("/:id/toggle-publish", logUserActivity(), togglePublish);

export default router;
