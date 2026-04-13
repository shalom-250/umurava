import express from 'express';
import Skill from '../models/Skill';
import { getAll, getById, create, update, remove } from '../controllers/generic.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Skills
 *   description: Standardized skills taxonomy
 */

/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: List all skills
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Add a new skill to taxonomy
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(protect, getAll(Skill))
    .post(protect, create(Skill));

export default router;
