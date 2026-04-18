"use strict";
/**
 * @swagger
 * components:
 *   schemas:
 *     Screening:
 *       type: object
 *       properties:
 *         jobId:
 *           type: string
 *         candidateId:
 *           type: string
 *         score:
 *           type: number
 *         rank:
 *           type: number
 *         recommendation:
 *           type: string
 *           enum: [Shortlist, Waitlist, Reject]
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const screening_controller_1 = require("../controllers/screening.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/screening/{jobId}:
 *   post:
 *     summary: Trigger AI screening for a job
 *     tags: [Screening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Screening completed
 *   get:
 *     summary: Get ranked screening results for a job
 *     tags: [Screening]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of ranked candidates
 */
router.post('/:jobId', auth_middleware_1.protect, screening_controller_1.runScreening);
router.post('/test-gemini/:jobId', auth_middleware_1.protect, screening_controller_1.runTestScreening);
router.get('/:jobId', auth_middleware_1.protect, screening_controller_1.getScreeningResults);
exports.default = router;
