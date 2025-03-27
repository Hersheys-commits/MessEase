import express from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { createComplaint } from '../controller/complaint.controller.js';
import { upload } from '../middleware/multer.middleware.js';
const router = express.Router();

router.post('/createcomplaint', verifyJWT, upload.array('images', 5), createComplaint);

export default router;