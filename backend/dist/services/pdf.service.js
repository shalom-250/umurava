"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromPdf = void 0;
const pdf = require('pdf-parse');
const fs_1 = __importDefault(require("fs"));
const extractTextFromPdf = async (filePath) => {
    try {
        const dataBuffer = fs_1.default.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    }
    catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Failed to extract text from PDF");
    }
};
exports.extractTextFromPdf = extractTextFromPdf;
