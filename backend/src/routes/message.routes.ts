import express from 'express';
import Message from '../models/Message';
import { getAll, getById, create, update, remove } from '../controllers/generic.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Internal communication logs
 */

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: List direct messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(protect, getAll(Message))
    .post(protect, create(Message));

export default router;
