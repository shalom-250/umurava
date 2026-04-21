"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_service_1 = require("./services/pdf.service");
const doc_service_1 = require("./services/doc.service");
const gemini_service_1 = require("./services/gemini.service");
const testParsing = async () => {
    console.log("=== Testing PDF and DOCX Parsing ===");
    try {
        const dummyPdf = path_1.default.join(__dirname, 'test-resume.pdf');
        // Ensure pdf exists
        if (!fs_1.default.existsSync(dummyPdf)) {
            console.log("Skipping PDF test: No test-resume.pdf found for local testing.");
        }
        else {
            console.log("Testing PDF Extraction...");
            const text = await (0, pdf_service_1.extractTextFromPdf)(dummyPdf);
            console.log("Extracted PDF Text Length:", text.length);
            console.log("Sending to Gemini API...");
            const aiInfo = await (0, gemini_service_1.extractCandidateInfo)(text);
            console.log("AI Info Result:", JSON.stringify(aiInfo, null, 2));
        }
        const dummyDocx = path_1.default.join(__dirname, 'test-resume.docx');
        if (!fs_1.default.existsSync(dummyDocx)) {
            console.log("Skipping DOCX test: No test-resume.docx found.");
        }
        else {
            console.log("Testing DOCX Extraction...");
            const text2 = await (0, doc_service_1.extractTextFromDocx)(dummyDocx);
            console.log("Extracted DOCX Text Length:", text2.length);
            console.log("Sending to Gemini API...");
            const aiInfo2 = await (0, gemini_service_1.extractCandidateInfo)(text2);
            console.log("AI Info Result:", JSON.stringify(aiInfo2, null, 2));
        }
    }
    catch (e) {
        console.error("Test Failed!", e.message);
    }
};
testParsing();
