const pdf = require('pdf-parse');
import fs from 'fs';

export const extractTextFromPdf = async (filePath: string): Promise<string> => {
    const dataBuffer = fs.readFileSync(filePath);
    return extractTextFromPdfBuffer(dataBuffer);
};

export const extractTextFromPdfBuffer = async (buffer: Buffer): Promise<string> => {
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (error: any) {
        console.error("PDF Parsing Error Details:", error);
        throw new Error("Failed to extract text from PDF: " + (error.message || "Invalid or corrupt PDF file"));
    }
};
