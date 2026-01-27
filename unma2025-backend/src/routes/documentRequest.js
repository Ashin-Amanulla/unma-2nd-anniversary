import express from 'express';
import { submitDocumentRequest } from '../controllers/documentRequest.controller.js';

const router = express.Router();

// Public route - no authentication required
router.post('/', submitDocumentRequest);

export default router;
