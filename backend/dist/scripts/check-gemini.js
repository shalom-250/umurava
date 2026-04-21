"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const apiKey = process.env.GEMINI_API_KEY || "";
async function directGenerate(modelName) {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "hi" }] }]
            })
        });
        const data = await response.json();
        console.log(`--- Result for ${modelName} ---`);
        console.log(`Status: ${response.status}`);
        if (response.ok) {
            console.log(`Success: ${data.candidates[0].content.parts[0].text}`);
        }
        else {
            console.log(`Error: ${JSON.stringify(data.error || data, null, 2)}`);
        }
    }
    catch (error) {
        console.error(`Fetch Error for ${modelName}:`, error.message);
    }
}
async function run() {
    await directGenerate("gemini-1.5-flash-8b");
}
run();
