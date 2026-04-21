"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromDocx = void 0;
const mammoth = require('mammoth');
const extractTextFromDocx = async (filePath) => {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    }
    catch (error) {
        console.error("DOCX Parsing Error:", error);
        throw new Error("Failed to extract text from DOCX");
    }
};
exports.extractTextFromDocx = extractTextFromDocx;
