import express from 'express';
import Company from '../models/Company';
import { getAll, getById, create, update, remove } from '../controllers/generic.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Corporate profile management
 */

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: List all companies
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a new company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(protect, getAll(Company))
    .post(protect, create(Company));

router.route('/:id')
    .get(protect, getById(Company))
    .put(protect, update(Company))
    .delete(protect, remove(Company));

export default router;
