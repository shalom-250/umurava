"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const generic_controller_1 = require("../controllers/generic.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: SaaS Billing & Tier management
 */
/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: List company subscriptions
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create or upgrade subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(auth_middleware_1.protect, (0, generic_controller_1.getAll)(Subscription_1.default))
    .post(auth_middleware_1.protect, (0, generic_controller_1.create)(Subscription_1.default));
exports.default = router;
