import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY || "";

async function directGenerate(modelName: string) {
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
        } else {
            console.log(`Error: ${JSON.stringify(data.error || data, null, 2)}`);
        }
    } catch (error: any) {
        console.error(`Fetch Error for ${modelName}:`, error.message);
    }
}

async function run() {
    await directGenerate("gemini-1.5-flash-8b");
}

run();
