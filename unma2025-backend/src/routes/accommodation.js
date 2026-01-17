import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { logUserActivity } from "../middleware/userLogger.js";
import {
  getAccommodationStats,
  getAccommodationProviders,
  getAccommodationSeekers,
  getHotelRequests,
  findCompatibleProviders,
  getAccommodationDistricts,
  exportAccommodationData,
  debugAccommodationData,
} from "../controllers/accommodation.controller.js";

const router = express.Router();

// Apply middleware to all routes
router.use(verifyToken);
router.use(logUserActivity());

router.get("/stats", getAccommodationStats);
router.get("/providers", getAccommodationProviders);

router.get("/seekers", getAccommodationSeekers);

router.get("/hotels", getHotelRequests);

router.get("/seekers/:seekerId/compatible", findCompatibleProviders);

router.get("/districts", getAccommodationDistricts);

router.get("/export", exportAccommodationData);
router.get("/debug", debugAccommodationData);

export default router;
