/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       required:
 *         - title
 *         - description
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *         skills:
 *           type: array
 *           items:
 *             type: string
 */

import express from 'express';
import { createJob, getJobs, getJobById } from '../controllers/job.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       201:
 *         description: Job created
 *   get:
 *     summary: List all jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.route('/')
    .post(protect, createJob)
    .get(getJobs);

router.route('/:id')
    .get(getJobById);

export default router;
