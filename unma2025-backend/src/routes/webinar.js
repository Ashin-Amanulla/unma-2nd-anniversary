import express from "express";
import {
  getWebinars,
  getRecentWebinar,
  getWebinar,
  getAllWebinarsAdmin,
  createWebinar,
  updateWebinar,
  deleteWebinar,
  togglePublish,
} from "../controllers/webinar.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { logUserActivity } from "../middleware/userLogger.js";

const router = express.Router();

// Public — order matters: /recent before /:id
router.get("/recent", getRecentWebinar);
router.get("/", getWebinars);
router.get("/:id", getWebinar);

// Admin
router.use(verifyToken);

router.get("/admin/all", logUserActivity(), getAllWebinarsAdmin);
router.post("/", logUserActivity(), createWebinar);
router.put("/:id", logUserActivity(), updateWebinar);
router.delete("/:id", logUserActivity(), deleteWebinar);
router.patch("/:id/toggle-publish", logUserActivity(), togglePublish);

export default router;
