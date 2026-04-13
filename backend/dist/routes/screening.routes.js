"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const screening_controller_1 = require("../controllers/screening.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/:jobId', auth_middleware_1.protect, screening_controller_1.runScreening);
router.get('/:jobId', auth_middleware_1.protect, screening_controller_1.getScreeningResults);
exports.default = router;
