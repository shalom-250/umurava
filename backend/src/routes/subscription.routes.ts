import express from 'express';
import Subscription from '../models/Subscription';
import { getAll, create } from '../controllers/generic.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: SaaS Billing & Tier management
 */

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: List company subscriptions
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create or upgrade subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(protect, getAll(Subscription))
    .post(protect, create(Subscription));

export default router;
