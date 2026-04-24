/**
 * @swagger
 * components:
 *   schemas:
 *     Candidate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *         source:
 *           type: string
 *           enum: [structured, unstructured]
 */

import express from 'express';
import { saveCandidates, parseCandidateFile, getCandidates, getApplicantDashboardStats, updateMyProfile, uploadAvatar } from '../controllers/candidate.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// ... swagger hidden
router.route('/')
    .post(protect, saveCandidates)
    .get(protect, getCandidates);

router.post('/parse', protect, parseCandidateFile);

router.get('/me/dashboard', protect, getApplicantDashboardStats);
router.put('/me', protect, updateMyProfile);
router.post('/me/photo', protect, uploadAvatar);

export default router;
