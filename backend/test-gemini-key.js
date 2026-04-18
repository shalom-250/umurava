const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    const key = "AIzaSyDUPm-96GecXV2zD8ZvWWcAZC6QquxibY4";
    const genAI = new GoogleGenerativeAI(key);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent("Explain how AI works in a few words");
        const response = await result.response;
        console.log("Response:", response.text());
        console.log("SUCCESS!");
    } catch (e) {
        console.error("ERROR flash-latest:", e.message);
    }
}
test();
