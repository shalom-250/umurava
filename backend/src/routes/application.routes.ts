import express from 'express';
import Application from '../models/Application';
import { getAll, getById, create, update, remove } from '../controllers/generic.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Candidate applications management
 */

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: List all applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a new application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(protect, getAll(Application))
    .post(protect, create(Application));

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: Get application by ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.route('/:id')
    .get(protect, getById(Application))
    .put(protect, update(Application))
    .delete(protect, remove(Application));

export default router;
