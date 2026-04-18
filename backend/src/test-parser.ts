import fs from 'fs';
import path from 'path';
import { extractTextFromPdf } from './services/pdf.service';
import { extractTextFromDocx } from './services/doc.service';
import { extractCandidateInfo } from './services/gemini.service';

const testParsing = async () => {
    console.log("=== Testing PDF and DOCX Parsing ===");
    try {
        const dummyPdf = path.join(__dirname, 'test-resume.pdf');

        // Ensure pdf exists
        if (!fs.existsSync(dummyPdf)) {
            console.log("Skipping PDF test: No test-resume.pdf found for local testing.");
        } else {
            console.log("Testing PDF Extraction...");
            const text = await extractTextFromPdf(dummyPdf);
            console.log("Extracted PDF Text Length:", text.length);
            console.log("Sending to Gemini API...");
            const aiInfo = await extractCandidateInfo(text);
            console.log("AI Info Result:", JSON.stringify(aiInfo, null, 2));
        }

        const dummyDocx = path.join(__dirname, 'test-resume.docx');
        if (!fs.existsSync(dummyDocx)) {
            console.log("Skipping DOCX test: No test-resume.docx found.");
        } else {
            console.log("Testing DOCX Extraction...");
            const text2 = await extractTextFromDocx(dummyDocx);
            console.log("Extracted DOCX Text Length:", text2.length);
            console.log("Sending to Gemini API...");
            const aiInfo2 = await extractCandidateInfo(text2);
            console.log("AI Info Result:", JSON.stringify(aiInfo2, null, 2));
        }

    } catch (e: any) {
        console.error("Test Failed!", e.message);
    }
};

testParsing();
