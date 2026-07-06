import express from "express";
import { verifySuperAdmin } from "../middleware/auth.js";
import {
  recordPageView,
  getPageViewStats,
} from "../controllers/pageView.controller.js";

const router = express.Router();

router.post("/", recordPageView);
router.get("/stats", verifySuperAdmin, getPageViewStats);

export default router;
