import { GoogleGenerativeAI } from "@google/generative-ai";
import culturalContext from "./culturalContext.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getFinancialAdvice({ message, language, culture }) {
  const cultureData = culturalContext[culture] || {};
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
  You are FinBridge, a kind, multicultural financial assistant.
  The user is from ${culture} culture and speaks ${language}.
  Provide advice in ${language} that is respectful, easy to understand,
  and includes cultural examples like ${cultureData.example}.
  
  User message: ${message}
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

