"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const generic_controller_1 = require("../controllers/generic.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: AuditLogs
 *   description: Security and activity tracking
 */
/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: List all system audit logs (Admin only)
 *     tags: [AuditLogs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth_middleware_1.protect, (0, generic_controller_1.getAll)(AuditLog_1.default));
exports.default = router;
