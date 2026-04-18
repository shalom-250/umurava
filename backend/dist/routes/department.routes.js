"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Department_1 = __importDefault(require("../models/Department"));
const generic_controller_1 = require("../controllers/generic.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Internal organizational departments
 */
/**
 * @swagger
 * /api/departments:
 *   get:
 *     summary: List all departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(auth_middleware_1.protect, (0, generic_controller_1.getAll)(Department_1.default))
    .post(auth_middleware_1.protect, (0, generic_controller_1.create)(Department_1.default));
exports.default = router;
