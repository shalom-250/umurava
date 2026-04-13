import express from 'express';
import Notification from '../models/Notification';
import { getAll, getById, create, update, remove } from '../controllers/generic.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: System alerts and notifications
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: List user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', protect, getAll(Notification));

export default router;
