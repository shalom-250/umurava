/**
 * @swagger
 * components:
 *   schemas:
 *     Screening:
 *       type: object
 *       properties:
 *         jobId:
 *           type: string
 *         candidateId:
 *           type: string
 *         score:
 *           type: number
 *         rank:
 *           type: number
 *         recommendation:
 *           type: string
 *           enum: [Shortlist, Waitlist, Reject]
 */

import express from 'express';
import { runScreening, getScreeningResults } from '../controllers/screening.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/screening/{jobId}:
 *   post:
 *     summary: Trigger AI screening for a job
 *     tags: [Screening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Screening completed
 *   get:
 *     summary: Get ranked screening results for a job
 *     tags: [Screening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of ranked candidates
 */
router.post('/:jobId', protect, runScreening);
router.get('/:jobId', protect, getScreeningResults);

export default router;
