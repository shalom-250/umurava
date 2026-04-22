import { extractCandidateInfoFromFile, extractCandidateInfoFromText } from './src/services/gemini.service';
import { extractTextFromPdf } from './src/services/pdf.service';
import * as path from 'path';

async function testExtraction() {
    try {
        const filePath = path.join(__dirname, '..', 'test-cvs', 'alex_johnson_perfect_cv.pdf');

        console.log('--- TESTING PDF EXTRACTION ---');
        try {
            const aiInfo = await extractCandidateInfoFromFile(filePath, 'application/pdf');
            console.log('PDF Gemini Output:', JSON.stringify(aiInfo, null, 2));
        } catch (e: any) {
            console.error('PDF Extraction Error:', e.message);
        }

        console.log('\n--- TESTING TEXT FALLBACK EXTRACTION ---');
        try {
            const text = await extractTextFromPdf(filePath);
            console.log('Extracted Text Length:', text.length);
            console.log('First 500 chars:', text.substring(0, 500));
            const betterInfo = await extractCandidateInfoFromText(text);
            console.log('Text Gemini Output:', JSON.stringify(betterInfo, null, 2));
        } catch (e: any) {
            console.error('Text Extraction Error:', e.message);
        }

    } catch (e) {
        console.error('Global Error:', e);
    }
}

testExtraction();
