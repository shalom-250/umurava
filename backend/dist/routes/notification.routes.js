"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Notification_1 = __importDefault(require("../models/Notification"));
const generic_controller_1 = require("../controllers/generic.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: System alerts and notifications
 */
/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: List user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth_middleware_1.protect, (0, generic_controller_1.getAll)(Notification_1.default));
exports.default = router;
