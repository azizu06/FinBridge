import { GoogleGenAI } from "@google/genai";
import culturalContext from "./culturalContext.js";
import { getMockTransactions } from "../data/mockTransactions.js";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const DEFAULT_UI = {
    summary: "Here is your financial snapshot.",
    kpis: { income: 0, expenses: 0, savings: 0, currency: "USD" },
    chart: { type: "bar", labels: [], values: [] },
    table: {
        columns: ["Date", "Category", "Note", "Amount"],
        rows: [],
    },
    actions: [],
    imagePrompt: "friendly budgeting illustration",
};

export async function getFinancialAdvice({
    userId = "default",
    message,
    language,
    culture,
}) {
    const userData = getMockTransactions(userId) || getMockTransactions("default") || {};
    const cultureData = culturalContext[culture] || {};
    const { monthSummary = {}, transactions = [], currency = "USD" } = userData;

    const prompt = `
You are FinBridge, a multicultural financial advisor.
Return ONLY valid JSON that matches this structure:
{
  "summary": string,
  "kpis": {
    "income": number,
    "expenses": number,
    "savings": number,
    "currency": string
  },
  "chart": {
    "type": "bar",
    "labels": string[],
    "values": number[]
  },
  "table": {
    "columns": ["Date","Category","Note","Amount"],
    "rows": Array<[string,string,string,string]>
  },
  "actions": [
    { "label": string, "intent": "save" | "learn" | "plan" }
  ],
  "imagePrompt": string
}

Language: ${language}
User culture: ${culture}
Culture context: ${JSON.stringify(cultureData)}
User question: ${message || "How can I save more money each month?"}

Financial data to reference:
- monthSummary: ${JSON.stringify(monthSummary)}
- transactions (max 8): ${JSON.stringify(transactions.slice(0, 8))}
- currency: ${currency}
`;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const rawText =
            result.output_text ||
            result?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "";

        const jsonMatch = rawText.match(/\{[\s\S]*\}$/);
        if (!jsonMatch) {
            throw new Error("No JSON found in Gemini response");
        }

        const aiData = JSON.parse(jsonMatch[0]);

        return {
            summary: aiData.summary ?? DEFAULT_UI.summary,
            kpis: {
                income: aiData?.kpis?.income ?? monthSummary.income ?? 0,
                expenses: aiData?.kpis?.expenses ?? monthSummary.expenses ?? 0,
                savings: aiData?.kpis?.savings ?? monthSummary.savings ?? 0,
                currency:
                    aiData?.kpis?.currency ??
                    monthSummary.currency ??
                    currency ??
                    DEFAULT_UI.kpis.currency,
            },
            chart: aiData.chart ?? DEFAULT_UI.chart,
            table: aiData.table ?? DEFAULT_UI.table,
            actions: Array.isArray(aiData.actions) ? aiData.actions : DEFAULT_UI.actions,
            imagePrompt: aiData.imagePrompt ?? DEFAULT_UI.imagePrompt,
        };
    } catch (error) {
        console.error("Gemini UI recipe error:", error);
        return { ...DEFAULT_UI };
    }
}
