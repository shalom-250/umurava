"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Message_1 = __importDefault(require("../models/Message"));
const generic_controller_1 = require("../controllers/generic.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Internal communication logs
 */
/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: List direct messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(auth_middleware_1.protect, (0, generic_controller_1.getAll)(Message_1.default))
    .post(auth_middleware_1.protect, (0, generic_controller_1.create)(Message_1.default));
exports.default = router;
