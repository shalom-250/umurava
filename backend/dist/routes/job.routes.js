"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const job_controller_1 = require("../controllers/job.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
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
    .post(auth_middleware_1.protect, job_controller_1.createJob)
    .get(job_controller_1.getJobs);
router.route('/:id')
    .get(job_controller_1.getJobById);
exports.default = router;
