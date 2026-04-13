import express from 'express';
import Department from '../models/Department';
import { getAll, getById, create, update, remove } from '../controllers/generic.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Internal organizational departments
 */

/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: List all departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(protect, getAll(Department))
    .post(protect, create(Department));

export default router;
