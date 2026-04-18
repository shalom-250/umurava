/**
 * @swagger
 * components:
 *   schemas:
 *     Candidate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *         source:
 *           type: string
 *           enum: [structured, unstructured]
 */

import express from 'express';
import { saveCandidates, parseCandidateFile, getCandidates } from '../controllers/candidate.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Upload a candidate resume (PDF) or bulk CSV
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Candidate(s) created
 *   get:
 *     summary: Search and list candidates
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or skill
 *     responses:
 *       200:
 *         description: List of candidates
 */
router.route('/')
    .post(protect, saveCandidates)
    .get(protect, getCandidates);

router.post('/parse', protect, parseCandidateFile);

export default router;
