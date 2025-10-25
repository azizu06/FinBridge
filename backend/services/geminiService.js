import { GoogleGenAI } from "@google/genai";
import culturalContext from "./culturalContext.js";
import { response } from "express";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function getFinancialAdvice({message, language, culture}) {
    const cultureData = culturalContext[culture] || {};

    const prompt = `
    You are FinBridge, a helpful multicultural AI financial advisor.
    Respond in the user's preferred language (${language}).
    Give short, culturally relevant financial advice that fits ${culture} customs.
    Example topics: saving for family, managing expenses, smart budgeting.
    Question: ${message || "How can I save more money each month?"}
    `;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text = 
        result.output_text ||
        result?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate advice right now";

        return text.trim();
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Error generating advice");
    }
}
