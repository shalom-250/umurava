"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Company_1 = __importDefault(require("../models/Company"));
const generic_controller_1 = require("../controllers/generic.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Corporate profile management
 */
/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: List all companies
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a new company profile
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 */
router.route('/')
    .get(auth_middleware_1.protect, (0, generic_controller_1.getAll)(Company_1.default))
    .post(auth_middleware_1.protect, (0, generic_controller_1.create)(Company_1.default));
router.route('/:id')
    .get(auth_middleware_1.protect, (0, generic_controller_1.getById)(Company_1.default))
    .put(auth_middleware_1.protect, (0, generic_controller_1.update)(Company_1.default))
    .delete(auth_middleware_1.protect, (0, generic_controller_1.remove)(Company_1.default));
exports.default = router;
