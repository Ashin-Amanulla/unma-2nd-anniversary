import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import compression from "compression";
import dotenv from "dotenv";
import loginSeedData from "./seed/login_seed_data.js";
// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/auth.js";
import registrationRoutes from "./routes/registrations.js";
import adminRoutes from "./routes/admin.js";
import paymentRoutes from "./routes/payment.js";
import uploadRoutes from "./routes/upload.js";
import issueRoutes from "./routes/issueRoutes.js";
import contactMessageRoutes from "./routes/contactMessageRoutes.js";
import userLogsRoutes from "./routes/userLogs.js";
import accommodationRoutes from "./routes/accommodation.js";
import transportationRoutes from "./routes/transportation.js";
import idCardRoutes from "./routes/idCard.js";
import notificationRoutes from "./routes/notification.js";
import registrationDeskRoutes from "./routes/registrationDesk.js";
import feedbackRoutes from "./routes/feedback.js";
import reportRoutes from "./routes/report.js";
import republicDayEventRoutes from "./routes/republicDayEvent.js";
import jobRoutes from "./routes/job.js";
// Import middlewares
import { errorHandler, notFoundHandler } from "./middleware/error.js";

// Import configurations
import { connectDB } from "./config/database.js";
import { setupSwagger } from "./config/swagger.js";
import { logger, stream } from "./utils/logger.js";
import { logUserActivity } from "./middleware/userLogger.js";

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Seed data (admin already created)
// loginSeedData();

// Setup security middlewares
app.use(helmet());
app.use(cors());
// app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 300, // 15 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
//     message: {
//       status: "error",
//       message: "Too many requests, please try again later",
//     },
//   })
// );

app.use((req, res, next) => {
  const ua = req.headers["user-agent"]?.toLowerCase() || "";
  const badBots = ["zgrab", "masscan", "sqlmap", "acunetix", "nmap", "nikto"];
  if (badBots.some((bot) => ua.includes(bot))) {
    return res.status(403).send("Go away bot!");
  }
  next();
});

// Setup request parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Setup logging middleware
app.use(morgan("combined", { stream: stream }));

// Setup user activity logging middleware (for admin routes only)

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Setup routes

const baseRoutes = `/api/v1`;

app.use(`${baseRoutes}/auth`, logUserActivity(), authRoutes);
app.use(`${baseRoutes}/registrations`, registrationRoutes);
app.use(`${baseRoutes}/admin/user-logs`, userLogsRoutes);
app.use(`${baseRoutes}/admin`, adminRoutes);
app.use(`${baseRoutes}/accommodation`, accommodationRoutes);
app.use(`${baseRoutes}/transportation`, transportationRoutes);
app.use(`${baseRoutes}/payment`, paymentRoutes);
app.use(`${baseRoutes}/issues`, logUserActivity(), issueRoutes);
app.use(
  `${baseRoutes}/contact-messages`,
  logUserActivity(),
  contactMessageRoutes
);
app.use(`${baseRoutes}/upload`, uploadRoutes);
app.use(`${baseRoutes}/id-card`, idCardRoutes);
app.use(`${baseRoutes}/notifications`, notificationRoutes);
app.use(`${baseRoutes}/registration-desk`, registrationDeskRoutes);
app.use(`${baseRoutes}/feedback`, feedbackRoutes);
app.use(`${baseRoutes}/report`, reportRoutes);
app.use(`${baseRoutes}/republic-day-event`, republicDayEventRoutes);
app.use(`${baseRoutes}/jobs`, jobRoutes);

// Setup Swagger documentation
// setupSwagger(app);

// Handle undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  //time indian standard time
  const indianTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  logger.info(`Server running on port ${PORT} since ${indianTime}`);
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

export default app;
