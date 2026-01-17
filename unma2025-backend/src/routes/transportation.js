import express from "express";
import {
  getTransportationStats,
  getVehicleProviders,
  getRideSeekers,
  findCompatibleRides,
  getTransportationDistricts,
  getTransportationStates,
  getProximityGroups,
  exportTransportationData,
  debugTransportationData,
} from "../controllers/transportation.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { logUserActivity } from "../middleware/userLogger.js";

const router = express.Router();
router.use(logUserActivity());

router.get("/stats", verifyToken, getTransportationStats);

router.get("/providers", verifyToken, getVehicleProviders);

router.get("/seekers", verifyToken, getRideSeekers);

router.get(
  "/compatible-rides",
  verifyToken,

  findCompatibleRides
);

router.get(
  "/proximity-groups",
  verifyToken,

  getProximityGroups
);

router.get(
  "/districts",
  verifyToken,

  getTransportationDistricts
);

router.get("/states", verifyToken, getTransportationStates);

router.get("/export", verifyToken, exportTransportationData);

router.get("/debug", verifyToken, debugTransportationData);

export default router;
