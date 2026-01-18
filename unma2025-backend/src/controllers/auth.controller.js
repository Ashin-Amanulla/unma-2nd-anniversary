import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { AppError } from "../middleware/error.js";
import User from "../models/Admin.js";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();
// JWT secret key and token expiration
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-for-development-only";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Register a new admin user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError(400, "User already exists"));
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "admin",
    });

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      },
    });
  } catch (error) {
    logger.error("Error registering user:", error);
    next(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info(`Login attempt for user: ${email}`);



    // For production, check against database
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn(`Failed login attempt for ${email}: User not found`);
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      logger.warn(`Failed login attempt for ${email}: Invalid password`);
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Update last login timestamp
    await user.updateLastLogin();

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info(`User ${email} logged in successfully`);

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        token,
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const logout = (req, res) => {
  try {
    // In a stateless JWT system, the client simply discards the token
    // This endpoint is mostly for completeness and logging

    // We can extract the user info from the token if available
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        logger.info(`User ${decoded.email} logged out`);
      } catch (err) {
        // Token is invalid, but we'll still complete the logout
        logger.info("User with invalid token logged out");
      }
    }

    res.status(200).json({
      status: "success",
      message: "Logout successful",
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const verifyToken = (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Token verification failed: No token provided");
      return res.status(401).json({
        status: "error",
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.warn(`Token verification failed: ${err.message}`);
        return res.status(401).json({
          status: "error",
          message: "Invalid or expired token",
        });
      }

      logger.info(`Token verified for user: ${decoded.email}`);

      res.status(200).json({
        status: "success",
        message: "Token is valid",
        data: {
          user: {
            email: decoded.email,
            name: decoded.name,
            role: decoded.role,
          },
        },
      });
    });
  } catch (error) {
    logger.error(`Token verification error: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

// Setup 2FA
export const setup2FA = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `UNMA2025:${user.email}`,
    });

    // Save secret to user
    user.twoFactorSecret = secret.base32;
    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        secret: secret.base32,
        otpauth_url: secret.otpauth_url,
      },
    });
  } catch (error) {
    logger.error("Error setting up 2FA:", error);
    next(error);
  }
};

// Verify 2FA token
export const verify2FA = async (req, res, next) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return next(new AppError(401, "Invalid 2FA token"));
    }

    // Enable 2FA for the user if not already enabled
    if (!user.twoFactorEnabled) {
      user.twoFactorEnabled = true;
      await user.save();
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id, user.role);

    res.status(200).json({
      status: "success",
      token: jwtToken,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
        },
      },
    });
  } catch (error) {
    logger.error("Error verifying 2FA:", error);
    next(error);
  }
};

// Check if user is super admin
export const isSuperAdmin = async (req, res) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "No token provided",
      });
    }

    // Extract token from header
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const isSuperAdmin = user.role === "super_admin";

    res.status(200).json({
      status: "success",
      data: {
        isSuperAdmin,
      },
    });
  } catch (error) {
    logger.error("Error checking if user is super admin:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "No token provided",
      });
    }

    // Extract token from header
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    logger.error("Error getting user:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
