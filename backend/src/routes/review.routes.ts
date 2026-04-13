import express from 'express';
import Review from '../models/Review';
import { getAll, getById, create, update, remove } from '../controllers/generic.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Human recruiter reviews and scores
 */

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: List all reviews
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Add a candidate review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(protect, getAll(Review))
    .post(protect, create(Review));

export default router;
