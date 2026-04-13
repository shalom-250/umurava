import express from 'express';
import Settings from '../models/Settings';
import { getAll, update } from '../controllers/generic.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: User preferences management
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(protect, getAll(Settings))
    .put(protect, update(Settings));

export default router;
