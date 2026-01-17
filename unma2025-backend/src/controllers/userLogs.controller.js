import UserLog from "../models/UserLog.js";
import { logger } from "../utils/logger.js";
import mongoose from "mongoose";

/**
 * Get all user logs with filtering and pagination
 */
export const getUserLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      userId,
      userEmail,
      method,
      category,
      statusCode,
      startDate,
      endDate,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    // User filters
    if (userId) filter.userId = userId;
    if (userEmail) filter.userEmail = new RegExp(userEmail, "i");

    // Request filters
    if (method) filter.method = method;
    if (category) filter.category = category;
    if (statusCode) filter.statusCode = parseInt(statusCode);

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Search across multiple fields
    if (search) {
      filter.$or = [
        { userName: new RegExp(search, "i") },
        { userEmail: new RegExp(search, "i") },
        { endpoint: new RegExp(search, "i") },
        { action: new RegExp(search, "i") },
        { ipAddress: new RegExp(search, "i") },
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const [logs, totalCount] = await Promise.all([
      UserLog.find(filter)
        .populate("userId", "name email role assignedSchools")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      UserLog.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      status: "success",
      data: {
        logs,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    logger.error("Error fetching user logs:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user logs",
      error: error.message,
    });
  }
};

/**
 * Get user log by ID
 */
export const getUserLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await UserLog.findById(id)
      .populate("userId", "name email role assignedSchools district")
      .lean();

    if (!log) {
      return res.status(404).json({
        status: "error",
        message: "User log not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { log },
    });
  } catch (error) {
    logger.error("Error fetching user log by ID:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user log",
      error: error.message,
    });
  }
};

/**
 * Get user logs statistics
 */
export const getUserLogsStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get basic stats
    const [
      totalLogs,
      uniqueUsers,
      methodStats,
      categoryStats,
      statusCodeStats,
      recentActivity,
      topUsers,
      errorLogs,
    ] = await Promise.all([
      // Total logs count
      UserLog.countDocuments({ createdAt: { $gte: startDate } }),

      // Unique users count
      UserLog.distinct("userId", { createdAt: { $gte: startDate } }).then(
        (users) => users.length
      ),

      // Method distribution
      UserLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$method", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Category distribution
      UserLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Status code distribution
      UserLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: "$statusCode", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Recent activity (last 24 hours by hour)
      UserLog.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              hour: { $hour: "$createdAt" },
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": -1, "_id.hour": -1 } },
      ]),

      // Top active users
      UserLog.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$userId",
            count: { $sum: 1 },
            userName: { $first: "$userName" },
            userEmail: { $first: "$userEmail" },
            userRole: { $first: "$userRole" },
            lastActivity: { $max: "$createdAt" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Error logs count
      UserLog.countDocuments({
        createdAt: { $gte: startDate },
        statusCode: { $gte: 400 },
      }),
    ]);

    // Calculate average response time
    const avgResponseTime = await UserLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: null, avgResponseTime: { $avg: "$responseTime" } } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        summary: {
          totalLogs,
          uniqueUsers,
          errorLogs,
          averageResponseTime: avgResponseTime[0]?.avgResponseTime || 0,
          period: `${days} days`,
        },
        distributions: {
          methods: methodStats,
          categories: categoryStats,
          statusCodes: statusCodeStats,
        },
        recentActivity,
        topUsers,
      },
    });
  } catch (error) {
    logger.error("Error fetching user logs statistics:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user logs statistics",
      error: error.message,
    });
  }
};

/**
 * Get activity timeline for a specific user
 */
export const getUserActivityTimeline = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30, limit = 100 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const activities = await UserLog.find({
      userId,
      createdAt: { $gte: startDate },
    })
      .select(
        "method endpoint action category statusCode responseTime createdAt ipAddress"
      )
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Get user summary
    const userSummary = await UserLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          averageResponseTime: { $avg: "$responseTime" },
          errorCount: {
            $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] },
          },
          lastActivity: { $max: "$createdAt" },
          userName: { $first: "$userName" },
          userEmail: { $first: "$userEmail" },
          userRole: { $first: "$userRole" },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        userSummary: userSummary[0] || null,
        activities,
      },
    });
  } catch (error) {
    logger.error("Error fetching user activity timeline:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user activity timeline",
      error: error.message,
    });
  }
};

/**
 * Export user logs to CSV
 */
export const exportUserLogs = async (req, res) => {
  try {
    const { startDate, endDate, userId, category, format = "csv" } = req.query;

    // Build filter
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (userId) filter.userId = userId;
    if (category) filter.category = category;

    const logs = await UserLog.find(filter)
      .populate("userId", "name email role")
      .sort({ createdAt: -1 })
      .limit(10000) // Limit for performance
      .lean();

    if (format === "csv") {
      // Convert to CSV format
      const csvHeaders = [
        "Timestamp",
        "User Name",
        "User Email",
        "User Role",
        "Method",
        "Endpoint",
        "Action",
        "Category",
        "Status Code",
        "Response Time (ms)",
        "IP Address",
        "Browser",
        "Device",
      ];

      const csvRows = logs.map((log) => [
        log.createdAt.toISOString(),
        log.userName,
        log.userEmail,
        log.userRole,
        log.method,
        log.endpoint,
        log.action,
        log.category,
        log.statusCode,
        log.responseTime,
        log.ipAddress,
        `${log.browserInfo?.name || "Unknown"} ${
          log.browserInfo?.version || ""
        }`,
        log.deviceInfo || "Unknown",
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) => row.join(",")),
      ].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=user-logs-${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      res.send(csvContent);
    } else {
      // Return JSON
      res.status(200).json({
        status: "success",
        data: { logs },
      });
    }
  } catch (error) {
    logger.error("Error exporting user logs:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to export user logs",
      error: error.message,
    });
  }
};

/**
 * Delete old user logs (cleanup)
 */
export const cleanupUserLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const result = await UserLog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    logger.info(
      `Cleaned up ${result.deletedCount} user logs older than ${days} days`
    );

    res.status(200).json({
      status: "success",
      message: `Successfully deleted ${result.deletedCount} old log entries`,
      data: {
        deletedCount: result.deletedCount,
        cutoffDate,
      },
    });
  } catch (error) {
    logger.error("Error cleaning up user logs:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to cleanup user logs",
      error: error.message,
    });
  }
};
