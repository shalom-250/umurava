import express from 'express';
import { getComparison } from '../controllers/comparison.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/comparison:
 *   post:
 *     summary: Compare two candidates head-to-head
 *     tags: [Comparison]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           properties:
 *             jobId:
 *               type: string
 *             candidateAId:
 *               type: string
 *             candidateBId:
 *               type: string
 *     responses:
 *       200:
 *         description: AI Comparison result
 */
router.post('/', protect, getComparison);

export default router;
