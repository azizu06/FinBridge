import { GoogleGenerativeAI } from "@google/generative-ai";
import culturalContext from "./culturalContext.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getFinancialAdvice({message, language, culture}) {
    const cultureData = culturalContext[culture] || {};

    const prompt = `You are FinBridge, a kind, multicultural financial assistant. User culture: ${culture} User language ${language} Use simple,respectful language. Prefer culturally relevant examples. If helpful, include examples like: ${cultureData.example ?? "savings for family events"}. Preferred term for "savings": ${cultureData.saving_term ?? "savings"}.
    Question: ${message}`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const result = await model.generateContent(prompt);
    return result.response.text();
}