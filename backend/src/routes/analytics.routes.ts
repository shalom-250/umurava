import express from 'express';
import { getDashboardStats } from '../controllers/analytics.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/analytics/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System-wide metrics
 */
router.get('/stats', protect, getDashboardStats);

export default router;
