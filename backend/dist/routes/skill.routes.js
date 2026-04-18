"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Skill_1 = __importDefault(require("../models/Skill"));
const generic_controller_1 = require("../controllers/generic.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Skills
 *   description: Standardized skills taxonomy
 */
/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: List all skills
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Add a new skill to taxonomy
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(auth_middleware_1.protect, (0, generic_controller_1.getAll)(Skill_1.default))
    .post(auth_middleware_1.protect, (0, generic_controller_1.create)(Skill_1.default));
exports.default = router;
