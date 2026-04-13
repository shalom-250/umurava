"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const candidate_controller_1 = require("../controllers/candidate.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.route('/')
    .post(auth_middleware_1.protect, candidate_controller_1.uploadCandidate)
    .get(auth_middleware_1.protect, candidate_controller_1.getCandidates);
exports.default = router;
