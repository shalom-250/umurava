"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const candidate_controller_1 = require("../controllers/candidate.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
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
    .post(auth_middleware_1.protect, candidate_controller_1.saveCandidates)
    .get(auth_middleware_1.protect, candidate_controller_1.getCandidates);
router.post('/parse', auth_middleware_1.protect, candidate_controller_1.parseCandidateFile);
router.get('/me/dashboard', auth_middleware_1.protect, candidate_controller_1.getApplicantDashboardStats);
router.put('/me', auth_middleware_1.protect, candidate_controller_1.updateMyProfile);
exports.default = router;
