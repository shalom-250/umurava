import express from 'express';
import AuditLog from '../models/AuditLog';
import { getAll } from '../controllers/generic.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AuditLogs
 *   description: Security and activity tracking
 */

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: List all system audit logs (Admin only)
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', protect, getAll(AuditLog));

export default router;
