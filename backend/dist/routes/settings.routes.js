"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Settings_1 = __importDefault(require("../models/Settings"));
const generic_controller_1 = require("../controllers/generic.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: User preferences management
 */
/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(auth_middleware_1.protect, (0, generic_controller_1.getAll)(Settings_1.default))
    .put(auth_middleware_1.protect, (0, generic_controller_1.update)(Settings_1.default));
exports.default = router;
