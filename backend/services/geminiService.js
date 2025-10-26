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

const formatCurrency = (value, currency, language = "en") => {
    try {
        return new Intl.NumberFormat(language, {
            style: "currency",
            currency: currency || "USD",
            maximumFractionDigits: 2,
        }).format(value ?? 0);
    } catch {
        return `${currency || "USD"} ${Number(value ?? 0).toFixed(2)}`;
    }
};

const deriveMetrics = ({
    transactions = [],
    monthSummary = {},
    currency = "USD",
    language = "en",
}) => {
    const positive = transactions
        .filter((txn) => txn.amount > 0)
        .reduce((acc, txn) => acc + txn.amount, 0);
    const negative = transactions
        .filter((txn) => txn.amount < 0)
        .reduce((acc, txn) => acc + txn.amount, 0);
    const expenseByCategory = transactions.reduce((acc, txn) => {
        if (txn.amount >= 0) return acc;
        const key = txn.category || "Other";
        acc[key] = (acc[key] || 0) + Math.abs(txn.amount);
        return acc;
    }, {});

    const sortedCategories = Object.entries(expenseByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const tableRows = transactions.map((txn) => [
        txn.date ?? "",
        txn.category ?? "",
        txn.note ?? "",
        formatCurrency(txn.amount, currency, language),
    ]);

    const inferredIncome = monthSummary.income ?? positive;
    const inferredExpenses = monthSummary.expenses ?? Math.abs(negative);
    const inferredSavings =
        monthSummary.savings ?? inferredIncome - inferredExpenses;

    const summary = `You brought in ${formatCurrency(
        inferredIncome,
        currency,
        language
    )}, spent ${formatCurrency(
        inferredExpenses,
        currency,
        language
    )}, and have about ${formatCurrency(
        inferredSavings,
        currency,
        language
    )} available.`;

    const actions = [];
    if (sortedCategories[0]) {
        actions.push({
            label: `Review ${sortedCategories[0][0]} spending trends`,
            intent: "save",
        });
    }
    if (inferredSavings < inferredIncome * 0.1) {
        actions.push({
            label: "Set up an automatic weekly transfer to savings",
            intent: "plan",
        });
    } else {
        actions.push({
            label: "Allocate part of savings to a short-term goal",
            intent: "plan",
        });
    }
    actions.push({
        label: "Understand bank fees in your region",
        intent: "learn",
    });

    return {
        summary,
        kpis: {
            income: inferredIncome,
            expenses: inferredExpenses,
            savings: inferredSavings,
            currency,
        },
        chart: {
            type: "bar",
            labels: sortedCategories.map(([label]) => label),
            values: sortedCategories.map(([, value]) =>
                Number(value.toFixed(2))
            ),
        },
        table: {
            columns: ["Date", "Category", "Note", "Amount"],
            rows: tableRows,
        },
        actions,
        imagePrompt:
            "Friendly budgeting illustration focused on family finances and planning",
        derivedData: {
            categoryTotals: sortedCategories,
            totalIncomeFromTransactions: positive,
            totalExpensesFromTransactions: Math.abs(negative),
        },
    };
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
    const baseInsights = deriveMetrics({
        transactions,
        monthSummary,
        currency,
        language,
    });

    const prompt = `
You are FinBridge, a multicultural and multilingual financial guide.
Your job is to study the user’s recent financial data and message, then produce a structured “UI recipe” describing what the FinBridge dashboard should display.
====================
CRITICAL REQUIREMENTS
====================
1. Respond ONLY with valid JSON. Do not add commentary or markdown.
2. Follow the schema exactly as written below (keys, casing, and value types).
3. When numbers are required, return numeric values (not strings).
4. Use the cultural context and language guidance to tailor tone, examples, and suggested actions.
5. Ground every insight in the supplied financial data whenever possible. If data is missing, fill with thoughtful but conservative defaults and explicitly note assumptions in the summary text.
6. Keep text concise but informative (1-2 sentences for summary, short labels for chips, etc.).

====================
JSON SCHEMA TO RETURN
====================
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

====================
CONTEXT FOR THIS USER
====================
- Preferred language: ${language}
- Cultural background: ${culture}
- Cultural notes: ${JSON.stringify(cultureData)}
- User question: ${message || "How can I save more money each month?"}
- Currency: ${currency}
- Month summary (totals, may be missing fields): ${JSON.stringify(monthSummary)}
- Recent transactions (chronological, max 8 shown): ${JSON.stringify(
        transactions.slice(0, 8)
    )}
- Expense totals by category (top 6): ${JSON.stringify(
        baseInsights.derivedData.categoryTotals
    )}
- Inferred totals from transactions: ${JSON.stringify({
        totalIncome: baseInsights.derivedData.totalIncomeFromTransactions,
        totalExpenses: baseInsights.derivedData.totalExpensesFromTransactions,
    })}

====================
AUTHORING GUIDELINES
====================
- SUMMARY: 1-2 sentence overview in the preferred language highlighting the key takeaway and any urgent recommendation.
- KPIS: If monthSummary values are present, use them. Otherwise, fall back to the best estimates from transactions or reasonable placeholders.
- CHART: Focus on the largest spending categories or any meaningful segmentation visible in the data. Ensure labels and values arrays align (same length).
- TABLE: Show the rows in the order provided. Amount values should include currency symbol and sign if negative.
- ACTIONS: Provide 2-4 short, actionable suggestions aligned with user goals. Pick intent tags that describe the goal (save = reduce costs, plan = forward-looking, learn = educational).
- IMAGE PROMPT: Compose a short English phrase the design team can feed into an illustration generator. Mention cultural elements when relevant (e.g., “Haitian family budgeting around a shared meal, warm colors”).

Remember: output ONLY the JSON object that satisfies the schema above.
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
            summary: aiData.summary ?? baseInsights.summary ?? DEFAULT_UI.summary,
            kpis: {
                income:
                    aiData?.kpis?.income ??
                    baseInsights.kpis.income ??
                    monthSummary.income ??
                    0,
                expenses:
                    aiData?.kpis?.expenses ??
                    baseInsights.kpis.expenses ??
                    monthSummary.expenses ??
                    0,
                savings:
                    aiData?.kpis?.savings ??
                    baseInsights.kpis.savings ??
                    monthSummary.savings ??
                    0,
                currency:
                    aiData?.kpis?.currency ??
                    baseInsights.kpis.currency ??
                    monthSummary.currency ??
                    currency ??
                    DEFAULT_UI.kpis.currency,
            },
            chart:
                (aiData.chart?.labels?.length && aiData.chart?.values?.length
                    ? aiData.chart
                    : null) ??
                (baseInsights.chart.labels.length ? baseInsights.chart : null) ??
                DEFAULT_UI.chart,
            table:
                (aiData.table?.columns?.length && aiData.table?.rows?.length
                    ? aiData.table
                    : null) ??
                (baseInsights.table.rows.length ? baseInsights.table : null) ??
                DEFAULT_UI.table,
            actions: Array.isArray(aiData.actions) && aiData.actions.length
                ? aiData.actions
                : baseInsights.actions.length
                ? baseInsights.actions
                : DEFAULT_UI.actions,
            imagePrompt:
                aiData.imagePrompt ??
                baseInsights.imagePrompt ??
                DEFAULT_UI.imagePrompt,
        };
    } catch (error) {
        console.error("Gemini UI recipe error:", error);
        return {
            summary: baseInsights.summary ?? DEFAULT_UI.summary,
            kpis: baseInsights.kpis ?? DEFAULT_UI.kpis,
            chart:
                (baseInsights.chart?.labels?.length && baseInsights.chart) ||
                DEFAULT_UI.chart,
            table:
                (baseInsights.table?.rows?.length && baseInsights.table) ||
                DEFAULT_UI.table,
            actions:
                (baseInsights.actions?.length && baseInsights.actions) ||
                DEFAULT_UI.actions,
            imagePrompt:
                baseInsights.imagePrompt ?? DEFAULT_UI.imagePrompt,
        };
    }
}
