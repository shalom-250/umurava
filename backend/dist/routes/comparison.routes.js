"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const comparison_controller_1 = require("../controllers/comparison.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/comparison:
 *   post:
 *     summary: Compare two candidates head-to-head
 *     tags: [Comparison]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           properties:
 *             jobId:
 *               type: string
 *             candidateAId:
 *               type: string
 *             candidateBId:
 *               type: string
 *     responses:
 *       200:
 *         description: AI Comparison result
 */
router.post('/', auth_middleware_1.protect, comparison_controller_1.getComparison);
exports.default = router;
