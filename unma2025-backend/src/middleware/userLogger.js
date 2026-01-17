import UserLog from "../models/UserLog.js";
import { logger } from "../utils/logger.js";
import { UAParser } from "ua-parser-js";

/**
 * Middleware to log all admin user activities
 * This middleware should be used after authentication middleware
 */
export const logUserActivity = (options = {}) => {
  return async (req, res, next) => {
    const startTime = Date.now();

    // Skip logging for certain endpoints to avoid noise
    const skipPaths = options.skipPaths || [
      "/api/admin/health",
      "/api/admin/ping",
      "/favicon.ico",
    ];

    if (skipPaths.some((path) => req.path.includes(path))) {
      return next();
    }

    // Store original send method
    const originalSend = res.send;
    let responseBody = null;
    let statusCode = 200;

    // Override send method to capture response
    res.send = function (body) {
      responseBody = body;
      statusCode = res.statusCode;
      return originalSend.call(this, body);
    };

    // Continue with the request
    next();

    // Log after response is sent
    res.on("finish", async () => {
      try {
        await createUserLog(req, res, startTime, statusCode, responseBody);
      } catch (error) {
        logger.error("Failed to create user log:", error);
      }
    });
  };
};

/**
 * Create a user log entry
 */
async function createUserLog(req, res, startTime, statusCode, responseBody) {
  try {
    // Skip if no authenticated user
    if (!req.admin) {
      return;
    }

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Parse user agent
    const parser = new UAParser(req.headers["user-agent"]);
    const browserInfo = parser.getBrowser();
    const deviceInfo = parser.getDevice();

    // Get client IP
    const ipAddress = getClientIP(req);

    // Sanitize request body
    const sanitizedBody = sanitizeRequestBody(req.body);

    // Determine action and category
    const { action, category } = categorizeRequest(req);

    // Create log entry
    const logEntry = new UserLog({
      // User information
      userId: req.admin._id,
      userEmail: req.admin.email,
      userName: req.admin.name,
      userRole: req.admin.role,
      assignedSchools: req.admin.assignedSchools || [],

      // Request information
      method: req.method,
      endpoint: req.route ? req.route.path : req.path,
      fullUrl: req.originalUrl,

      // Client information
      ipAddress,
      userAgent: req.headers["user-agent"] || "",

      // Request details
      requestBody: sanitizedBody,
      queryParams: req.query,
      routeParams: req.params,

      // Response information
      statusCode,
      responseTime,

      // Action and category
      action,
      category,

      // Browser and device info
      browserInfo: {
        name: browserInfo.name || "Unknown",
        version: browserInfo.version || "Unknown",
      },
      deviceInfo: deviceInfo.type || "Unknown",

      // Error information (if any)
      ...(statusCode >= 400 && {
        errorMessage: getErrorMessage(responseBody),
      }),
    });

    // Sanitize sensitive data
    logEntry.sanitizeRequestBody();

    // Save log entry
    await logEntry.save();

    logger.info(
      `User activity logged: ${req.admin.email} ${req.method} ${req.originalUrl} - ${statusCode} (${responseTime}ms)`
    );
  } catch (error) {
    logger.error("Error creating user log:", error);
  }
}

/**
 * Get client IP address
 */
function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    "Unknown"
  );
}

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== "object") {
    return body;
  }

  const sensitiveFields = [
    "password",
    "token",
    "secret",
    "key",
    "authorization",
    "auth",
    "credentials",
    "passwordResetToken",
  ];

  const sanitized = JSON.parse(JSON.stringify(body));

  const sanitizeObject = (obj) => {
    Object.keys(obj).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        obj[key] = "[REDACTED]";
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    });
  };

  sanitizeObject(sanitized);
  return sanitized;
}

/**
 * Categorize request and determine action
 */
function categorizeRequest(req) {
  const fullPath = req.originalUrl.toLowerCase();
  const method = req.method.toUpperCase();

  // Extract base path without query parameters for better matching
  const basePath = fullPath.split("?")[0];

  // Authentication
  if (
    basePath.includes("/auth/") ||
    basePath.includes("/login") ||
    basePath.includes("/logout")
  ) {
    return {
      category: "authentication",
      action: getAuthAction(fullPath, method),
    };
  }

  // User management
  if (
    basePath.includes("/admin") &&
    (basePath.includes("/sub-admin") || basePath.includes("/admins"))
  ) {
    return {
      category: "user_management",
      action: getUserManagementAction(fullPath, method),
    };
  }

  // User logs (specific to admin user activity logs)
  if (basePath.includes("/admin/user-logs")) {
    return {
      category: "user_logs",
      action: getUserLogsAction(fullPath, method),
    };
  }

  // Analytics
  if (
    basePath.includes("/analytics") ||
    basePath.includes("/stats") ||
    basePath.includes("/dashboard")
  ) {
    return {
      category: "analytics",
      action: getAnalyticsAction(fullPath, method),
    };
  }

  // Configuration/Settings
  if (basePath.includes("/settings") || basePath.includes("/config")) {
    return {
      category: "configuration",
      action: getConfigurationAction(fullPath, method),
    };
  }

  // Data access - Fixed to properly match endpoints without requiring trailing slashes
  if (
    basePath.includes("/registrations") ||
    basePath.includes("/contact-messages") ||
    basePath.includes("/issues")
  ) {
    return {
      category: "data_access",
      action: getDataAccessAction(fullPath, method),
    };
  }

  // Default
  return {
    category: "other",
    action: `${method} ${req.originalUrl}`,
  };
}

/**
 * Get authentication action description
 */
function getAuthAction(path, method) {
  if (path.includes("/login")) return "User login attempt";
  if (path.includes("/logout")) return "User logout";
  if (path.includes("/refresh")) return "Token refresh";
  return `Authentication ${method}`;
}

/**
 * Get user management action description
 */
function getUserManagementAction(path, method) {
  if (method === "POST") return "Created new admin user";
  if (method === "PUT" || method === "PATCH") return "Updated admin user";
  if (method === "DELETE") return "Deleted admin user";
  if (method === "GET") return "Viewed admin users";
  return `Admin management ${method}`;
}

/**
 * Get analytics action description
 */
function getAnalyticsAction(path, method) {
  const cleanPath = path.split("?")[0].replace(/\/$/, "");

  if (cleanPath.includes("/dashboard")) return "Viewed dashboard statistics";
  if (cleanPath.includes("/district")) return "Viewed district analytics";
  if (cleanPath.includes("/payment")) return "Viewed payment analytics";
  if (cleanPath.includes("/registrations") && cleanPath.includes("/analytics"))
    return "Viewed registration analytics";
  if (cleanPath.includes("/stats")) return "Viewed statistics";
  return "Viewed analytics data";
}

/**
 * Get user logs action description
 */
function getUserLogsAction(path, method) {
  if (path.includes("/stats")) return "Viewed user logs statistics";
  if (path.includes("/export")) return "Exported user logs";
  if (path.includes("/cleanup")) return "Cleaned up user logs";
  if (path.includes("/timeline")) return "Viewed user activity timeline";

  // Check for specific log ID access
  const logIdMatch = path.match(/\/admin\/user-logs\/([a-f\d]{24})/);
  if (logIdMatch) {
    if (method === "GET") return "Viewed user log details";
    if (method === "DELETE") return "Deleted user log";
  }

  if (method === "GET") return "Viewed user logs";
  if (method === "POST") return "Created user log";
  if (method === "PUT" || method === "PATCH") return "Updated user log";
  if (method === "DELETE") return "Deleted user logs";

  return `User logs ${method}`;
}

/**
 * Get configuration action description
 */
function getConfigurationAction(path, method) {
  if (method === "PUT" || method === "PATCH")
    return "Updated system configuration";
  if (method === "GET") return "Viewed system settings";
  return `Configuration ${method}`;
}

/**
 * Get data access action description
 */
function getDataAccessAction(path, method) {
  // Remove trailing slash and query params for consistent matching
  const cleanPath = path.split("?")[0].replace(/\/$/, "");

  if (cleanPath.includes("/registrations")) {
    // Check for specific registration ID access
    const registrationIdMatch = cleanPath.match(
      /\/registrations\/([a-f\d]{24})/
    );
    if (registrationIdMatch) {
      if (method === "GET") return "Viewed registration details";
      if (method === "PUT" || method === "PATCH") return "Updated registration";
      if (method === "DELETE") return "Deleted registration";
    }

    // Check for specific actions
    if (cleanPath.includes("/approve")) return "Approved registration";
    if (cleanPath.includes("/reject")) return "Rejected registration";
    if (cleanPath.includes("/export")) return "Exported registrations";
    if (cleanPath.includes("/bulk")) return "Bulk updated registrations";

    if (method === "GET") return "Viewed registrations";
    if (method === "POST") return "Created registration";
    if (method === "PUT" || method === "PATCH") return "Updated registration";
    if (method === "DELETE") return "Deleted registration";
  }

  if (cleanPath.includes("/contact-messages")) {
    // Check for specific message ID access
    const messageIdMatch = cleanPath.match(/\/contact-messages\/([a-f\d]{24})/);
    if (messageIdMatch) {
      if (method === "GET") return "Viewed contact message details";
      if (method === "PUT" || method === "PATCH")
        return "Updated contact message";
      if (method === "DELETE") return "Deleted contact message";
    }

    // Check for specific actions
    if (cleanPath.includes("/status")) return "Updated contact message status";
    if (cleanPath.includes("/respond")) return "Responded to contact message";
    if (cleanPath.includes("/notes")) return "Added note to contact message";
    if (cleanPath.includes("/bulk")) return "Bulk updated contact messages";
    if (cleanPath.includes("/stats"))
      return "Viewed contact messages statistics";
    if (cleanPath.includes("/unread-count"))
      return "Checked unread messages count";

    if (method === "GET") return "Viewed contact messages";
    if (method === "POST") return "Created contact message";
    if (method === "PUT" || method === "PATCH")
      return "Updated contact message";
    if (method === "DELETE") return "Deleted contact message";
  }

  if (cleanPath.includes("/issues")) {
    // Check for specific issue ID access
    const issueIdMatch = cleanPath.match(/\/issues\/([a-f\d]{24})/);
    if (issueIdMatch) {
      if (method === "GET") return "Viewed issue details";
      if (method === "PUT" || method === "PATCH") return "Updated issue";
      if (method === "DELETE") return "Deleted issue";
    }

    // Check for specific actions
    if (cleanPath.includes("/status")) return "Updated issue status";
    if (cleanPath.includes("/assign")) return "Assigned issue";
    if (cleanPath.includes("/comments")) return "Added comment to issue";

    if (method === "GET") return "Viewed issues";
    if (method === "POST") return "Created issue";
    if (method === "PUT" || method === "PATCH") return "Updated issue";
    if (method === "DELETE") return "Deleted issue";
  }

  return `Data access ${method}`;
}

/**
 * Extract error message from response body
 */
function getErrorMessage(responseBody) {
  if (!responseBody) return "Unknown error";

  try {
    const parsed =
      typeof responseBody === "string"
        ? JSON.parse(responseBody)
        : responseBody;
    return parsed.message || parsed.error || "Unknown error";
  } catch (error) {
    return "Unknown error";
  }
}

export default logUserActivity;
