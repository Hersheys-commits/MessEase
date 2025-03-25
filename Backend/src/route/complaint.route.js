import express from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { createComplaint } from '../controller/complaint.controller.js';
const router = express.Router();

router.post('/create-complaint', verifyJWT, createComplaint);

export default router;