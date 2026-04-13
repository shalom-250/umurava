import express from 'express';
import Interview from '../models/Interview';
import { getAll, getById, create, update, remove } from '../controllers/generic.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Interviews
 *   description: Interview scheduling management
 */

/**
 * @swagger
 * /api/interviews:
 *   get:
 *     summary: List all interviews
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Schedule a new interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(protect, getAll(Interview))
    .post(protect, create(Interview));

/**
 * @swagger
 * /api/interviews/{id}:
 *   get:
 *     summary: Get interview by ID
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 */
router.route('/:id')
    .get(protect, getById(Interview))
    .put(protect, update(Interview))
    .delete(protect, remove(Interview));

export default router;
