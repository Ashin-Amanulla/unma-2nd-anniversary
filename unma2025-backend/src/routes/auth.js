import express from 'express';
import { isSuperAdmin, login, logout, verifyToken, getUser } from '../controllers/auth.controller.js';
import { validateLogin } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();


// Login route
router.post('/login', validateLogin, login);

// Logout route
router.post('/logout', logout);

// Token verification route
router.get("/verify", verifyToken);

// Check if user is super admin
router.get("/is-super-admin", isSuperAdmin);

router.get("/get-user", getUser);

export default router;
