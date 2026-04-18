const pdf = require('pdf-parse');
import fs from 'fs';

export const extractTextFromPdf = async (filePath: string): Promise<string> => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error: any) {
        console.error("PDF Parsing Error Details:", error);
        throw new Error("Failed to extract text from PDF: " + (error.message || "Invalid or corrupt PDF file"));
    }
};
