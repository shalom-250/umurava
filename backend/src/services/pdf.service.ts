const pdf = require('pdf-parse');
import fs from 'fs';

export const extractTextFromPdf = async (filePath: string): Promise<string> => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Failed to extract text from PDF");
    }
};
