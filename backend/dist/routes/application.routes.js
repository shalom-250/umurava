"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Application_1 = __importDefault(require("../models/Application"));
const generic_controller_1 = require("../controllers/generic.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Candidate applications management
 */
/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: List all applications
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a new application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
const candidate_controller_1 = require("../controllers/candidate.controller");
router.route('/')
    .get(auth_middleware_1.protect, (0, generic_controller_1.getAll)(Application_1.default))
    .post(auth_middleware_1.protect, candidate_controller_1.applyForJob);
/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: Get application by ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *   put:
 *     summary: Update application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 */
router.route('/:id')
    .get(auth_middleware_1.protect, (0, generic_controller_1.getById)(Application_1.default))
    .put(auth_middleware_1.protect, (0, generic_controller_1.update)(Application_1.default))
    .delete(auth_middleware_1.protect, (0, generic_controller_1.remove)(Application_1.default));
exports.default = router;
