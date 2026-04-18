const mammoth = require('mammoth');
import fs from 'fs';

export const extractTextFromDocx = async (filePath: string): Promise<string> => {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        console.error("DOCX Parsing Error:", error);
        throw new Error("Failed to extract text from DOCX");
    }
};
