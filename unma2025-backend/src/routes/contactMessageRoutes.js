import express from "express";
import { verifyToken, verifySuperAdmin } from "../middleware/auth.js";
import {
  sendMessage,
  getMessages,
  getMessage,
  updateStatus,
  respondToMessage,
  addNote,
  getMessageStats,
  getUnreadCount,
  bulkUpdateStatus,
} from "../controllers/contactMessageController.js";

const router = express.Router();

// Public routes
router.post("/send-message", sendMessage);

// Protected routes (admin only)
router.use(verifyToken); // Apply token verification to all remaining routes
router.use(verifySuperAdmin); // Apply admin verification to all remaining routes    
router.get("/", getMessages);
router.get("/stats", getMessageStats);
router.get("/unread-count", getUnreadCount);
router.get("/:id", getMessage);
router.put("/:id/status", updateStatus);
router.post("/:id/respond", respondToMessage);
router.post("/:id/notes", addNote);
router.put("/bulk/status", bulkUpdateStatus);

export default router;
