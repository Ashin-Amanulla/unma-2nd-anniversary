import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
dotenv.config();
// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const verifyToken = async (req, res, next) => {
    try {
        // Get token from authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.warn('Authentication failed: No token provided');
            return res.status(401).json({
                status: 'error',
                message: 'Authorization token is required'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        try {
            const decoded =  jwt.verify(token, JWT_SECRET);
            const admin = await Admin.findById(decoded.id);
            if (!decoded ||!admin) {
                logger.warn(`Authentication failed: Invalid token - ${err.message}`);
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid or expired token'
                });
            }

            // Add user info to request
            req.admin = admin;
            logger.info(`User ${decoded.email} authenticated successfully with role ${decoded.role}`);
            next();
        } catch (error) {
            logger.error(`Token verification error: ${error.message}`);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error during authentication'
            });
        }
    } catch (error) {
        logger.error(`Token verification error: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error during authentication'
        });
    }
};


export const verifySuperAdmin = (req, res, next) => {
    try {
        // First verify the token
        verifyToken(req, res, () => {
            // Check if user has admin role
            if (req.admin && req.admin.role === 'super_admin') {
                logger.info(`Super Admin access granted for user ${req.admin.email}`);
                next();
            } else {
                logger.warn(`Admin access denied for user ${req.admin ? req.admin.email : 'unknown'}`);
                return res.status(403).json({
                    status: 'error',
                    message: 'Access denied: Admin privileges required'
                });
            }
        });
    } catch (error) {
        logger.error(`Admin verification error: ${error.message}`);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error during authorization'
        });
    }
}; 

export const authenticateToken = (req, res, next) => {
           next();
   
};