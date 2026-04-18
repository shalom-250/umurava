"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Interview_1 = __importDefault(require("../models/Interview"));
const generic_controller_1 = require("../controllers/generic.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Interviews
 *   description: Interview scheduling management
 */
/**
 * @swagger
 * /api/interviews:
 *   get:
 *     summary: List all interviews
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Schedule a new interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(auth_middleware_1.protect, (0, generic_controller_1.getAll)(Interview_1.default))
    .post(auth_middleware_1.protect, (0, generic_controller_1.create)(Interview_1.default));
/**
 * @swagger
 * /api/interviews/{id}:
 *   get:
 *     summary: Get interview by ID
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete interview
 *     tags: [Interviews]
 *     security:
 *       - bearerAuth: []
 */
router.route('/:id')
    .get(auth_middleware_1.protect, (0, generic_controller_1.getById)(Interview_1.default))
    .put(auth_middleware_1.protect, (0, generic_controller_1.update)(Interview_1.default))
    .delete(auth_middleware_1.protect, (0, generic_controller_1.remove)(Interview_1.default));
exports.default = router;
