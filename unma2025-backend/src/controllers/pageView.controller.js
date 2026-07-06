import crypto from "crypto";
import PageView from "../models/PageView.js";
import { logger } from "../utils/logger.js";

function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    "unknown"
  );
}

function hashIP(ip) {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function normalizePath(path) {
  if (!path || typeof path !== "string") return null;
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("/admin")) return null;
  return trimmed.slice(0, 512);
}

export const recordPageView = async (req, res) => {
  try {
    const path = normalizePath(req.body?.path);
    const visitorId =
      typeof req.body?.visitorId === "string"
        ? req.body.visitorId.trim().slice(0, 64)
        : "";

    if (!path || !visitorId) {
      return res.status(400).json({
        status: "error",
        message: "Valid path and visitorId are required",
      });
    }

    const ipHash = hashIP(getClientIP(req));
    const userAgent = (req.headers["user-agent"] || "").slice(0, 512);

    await PageView.create({
      path,
      visitorId,
      ipHash,
      userAgent,
    });

    return res.status(204).send();
  } catch (error) {
    logger.error(`Error recording page view: ${error.message}`);
    return res.status(500).json({
      status: "error",
      message: "Failed to record page view",
    });
  }
};

export const getPageViewStats = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const matchStage = { createdAt: { $gte: startDate } };

    const [byPath, overall] = await Promise.all([
      PageView.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$path",
            totalHits: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$visitorId" },
          },
        },
        {
          $project: {
            path: "$_id",
            totalHits: 1,
            uniqueVisitors: { $size: "$uniqueVisitors" },
            _id: 0,
          },
        },
        { $sort: { totalHits: -1 } },
      ]),
      PageView.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalHits: { $sum: 1 },
            uniqueVisitors: { $addToSet: "$visitorId" },
          },
        },
        {
          $project: {
            totalHits: 1,
            totalUniqueVisitors: { $size: "$uniqueVisitors" },
            _id: 0,
          },
        },
      ]),
    ]);

    const summary = overall[0] || { totalHits: 0, totalUniqueVisitors: 0 };

    res.status(200).json({
      status: "success",
      data: {
        days,
        summary: {
          totalHits: summary.totalHits,
          totalUniqueVisitors: summary.totalUniqueVisitors,
        },
        byPath,
      },
    });
  } catch (error) {
    logger.error(`Error fetching page view stats: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch page view stats",
    });
  }
};
