import { GoogleGenAI } from "@google/genai";
import culturalContext from "./culturalContext.js";
import { getMockTransactions } from "../data/mockTransactions.js";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const ai = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    : null;

const DEFAULT_UI = {
    summary: "Here is your financial snapshot.",
    kpis: { income: 0, expenses: 0, savings: 0, currency: "USD" },
    chart: { type: "bar", labels: [], values: [] },
    pie: { labels: [], values: [] },
    table: {
        columns: ["Date", "Category", "Note", "Amount"],
        rows: [],
    },
    actions: [],
};

const formatter = (currency, locale) =>
    new Intl.NumberFormat(locale || "en-US", {
        style: "currency",
        currency: currency || "USD",
        maximumFractionDigits: 2,
    });

function deriveMetrics({ transactions = [], currency = "USD", locale = "en-US" }) {
    const income = transactions
        .filter((txn) => txn.amount > 0)
        .reduce((acc, txn) => acc + txn.amount, 0);
    const expenses = transactions
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

    const chart = {
        type: "bar",
        labels: sortedCategories.map(([label]) => label),
        values: sortedCategories.map(([, value]) => Number(value.toFixed(2))),
    };

    const pie = {
        labels: chart.labels,
        values: chart.values,
    };

    const format = formatter(currency, locale);
    const tableRows = transactions.map((txn) => [
        txn.date ?? "",
        txn.category ?? "",
        txn.note ?? "",
        format.format(txn.amount ?? 0),
    ]);

    const totalIncome = Number(income.toFixed(2));
    const totalExpenses = Number(Math.abs(expenses).toFixed(2));
    const savings = Number((totalIncome - totalExpenses).toFixed(2));

    return {
        kpis: {
            income: totalIncome,
            expenses: totalExpenses,
            savings,
            currency,
        },
        chart,
        pie,
        table: {
            columns: ["Date", "Category", "Note", "Amount"],
            rows: tableRows,
        },
        largestCategory: chart.labels[0] || null,
        format,
    };
}

function buildFallbackSummary({ kpis, largestCategory, format }, cultureData) {
    const phrases = [
        `You earned ${format.format(kpis.income)} and spent ${format.format(kpis.expenses)}, leaving ${format.format(kpis.savings)} to work with.`,
        `Your latest deposits total ${format.format(kpis.income)}, with ${format.format(kpis.expenses)} going out. That leaves ${format.format(kpis.savings)} in breathing room.`,
    ];
    const culturalNote = cultureData?.example
        ? ` Keep ${cultureData.example} in mind as you plan.`
        : "";
    const categoryNote = largestCategory
        ? ` ${largestCategory} is currently the costliest area, so nudging that down could make a big difference.`
        : " Consider reviewing your biggest categories to find quick wins.`";
    return `${phrases[Math.floor(Math.random() * phrases.length)]}${categoryNote}${culturalNote}`.replace(
        '``',
        ''
    );
}

function buildFallbackActions({ largestCategory, format, kpis }, cultureKey) {
    const topCategory = largestCategory || "daily expenses";
    return [
        {
            label: `Trim ${topCategory} costs`,
            followUp: `Walk me through culturally respectful ways to lower my ${topCategory} spending while keeping important traditions.`,
            intent: "save",
        },
        {
            label: "Automate savings",
            followUp: `Design a weekly savings transfer that helps me build beyond the ${format.format(kpis.savings)} I have now, even with my current income pattern.`,
            intent: "plan",
        },
        {
            label: "Learn local perks",
            followUp: `Explain financial programs or bank features that someone from a ${cultureKey || 'diverse'} background should explore to stretch their money further.`,
            intent: "learn",
        },
    ];
}

async function requestGeminiInsights({
    message,
    metrics,
    cultureData,
    cultureKey,
    languageConfig,
    transactions,
}) {
    if (!ai) return null;

    const prompt = `You are FinBridge, a multicultural financial advisor.

Return only JSON with the following structure:
{
  "summary": string,
  "actions": [
    { "label": string, "followUp": string, "intent": "save" | "plan" | "learn" }
  ]
}

Guidelines:
- The summary must be 2-3 lively English sentences tailored to the user. Blend the numbers into a relatable narrative and acknowledge any cultural notes (${cultureData?.example || 'none provided'}).
- Reference at least one numeric insight (income, expenses, or savings) and the largest expense category (${metrics.largestCategory || 'n/a'}).
- Provide exactly three actionable chips unless you state clearly why fewer are possible. Each label should be concise; each followUp must be an English prompt we can send back for deeper instructions.
- Cover a mix of intents (save, plan, learn) where possible.
- Do not wrap the JSON in code fences or add commentary.

User message: ${message || 'No specific question provided.'}
Culture: ${cultureKey || 'Not specified'} (details: ${JSON.stringify(cultureData)})
Preferred language for later localization: ${languageConfig?.geminiName || 'English'}
Income: ${metrics.kpis.income}
Expenses: ${metrics.kpis.expenses}
Savings: ${metrics.kpis.savings}
Top categories: ${JSON.stringify(metrics.chart)}
Recent transactions: ${JSON.stringify(transactions.slice(0, 6))}
`;

    try {
        const result = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
        });

        const text =
            result.output_text ||
            result?.response?.candidates?.[0]?.content?.parts
                ?.map((part) => part.text || "")
                .join("") ||
            "";

        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start === -1 || end === -1) return null;
        const jsonText = text.slice(start, end + 1);
        const parsed = JSON.parse(jsonText);
        if (!parsed || typeof parsed !== "object") return null;
        return parsed;
    } catch (error) {
        console.warn("Gemini insights fallback:", error?.message || error);
        return null;
    }
}

export async function getFinancialAdvice({
    userId = "default",
    message = "",
    languageCode = "en",
    locale = "en-US",
    culture,
}) {
    const userData =
        getMockTransactions(userId) || getMockTransactions("default") || {};
    const cultureData = culturalContext[culture] || {};
    const transactions = userData.transactions || [];
    const metrics = deriveMetrics({
        transactions,
        currency: userData.currency || "USD",
        locale,
    });

    const fallbackSummary = buildFallbackSummary(metrics, cultureData);
    const fallbackActions = buildFallbackActions(metrics, culture);

    let summary = fallbackSummary;
    let actions = fallbackActions;

    const languageConfig = {
        code: languageCode,
        geminiName: languageCode,
    };

    const aiInsights = await requestGeminiInsights({
        message,
        metrics,
        cultureData,
        cultureKey: culture,
        languageConfig,
        transactions,
    });

    if (aiInsights?.summary) {
        summary = aiInsights.summary.trim();
    }

    if (Array.isArray(aiInsights?.actions)) {
        const cleaned = aiInsights.actions
            .filter(
                (action) =>
                    typeof action?.label === "string" &&
                    action.label.trim().length &&
                    typeof action?.followUp === "string" &&
                    action.followUp.trim().length
            )
            .map((action) => ({
                label: action.label.trim(),
                followUp: action.followUp.trim(),
                intent: ["save", "plan", "learn"].includes(action.intent)
                    ? action.intent
                    : "plan",
            }));
        if (cleaned.length) {
            actions = cleaned.slice(0, 3);
        }
    }

    return {
        summary,
        kpis: metrics.kpis,
        chart: metrics.chart,
        pie: metrics.pie,
        table: metrics.table,
        actions,
    };
}
