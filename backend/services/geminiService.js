import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import culturalContext from "./culturalContext.js";
import { getMockTransactions } from "../data/mockTransactions.js";
import { LANGUAGE_CONFIG, DEFAULT_LANGUAGE } from "../config/languages.js";

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

const ACTION_LIBRARY = [
    {
        id: "optimize_spending",
        intent: "save",
        label: "Reduce spending in your largest category",
        followUp: ({ topCategory, cultureName }) =>
            `Provide a step-by-step plan to help me lower my ${topCategory} spending while respecting ${cultureName} customs and preferences.`,
    },
    {
        id: "automate_savings",
        intent: "plan",
        label: "Automate weekly savings contributions",
        followUp: () =>
            "Show me how to set up an automatic weekly transfer into savings, including how much I should move each week to hit a 3-month cushion.",
    },
    {
        id: "plan_cultural_events",
        intent: "plan",
        label: "Plan for upcoming cultural or family events",
        followUp: ({ cultureExample }) =>
            `Help me budget for upcoming cultural or family events, like ${cultureExample || "important celebrations"}, with a monthly savings schedule.`,
    },
    {
        id: "boost_income",
        intent: "learn",
        label: "Explore additional income opportunities",
        followUp: ({ cultureName }) =>
            `Suggest practical side-income ideas suitable for someone from a ${cultureName} background, including time commitment and expected earnings.`,
    },
];

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const geminiClient = process.env.GEMINI_API_KEY
    ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    : null;

const KEYWORD_SCENARIOS = [
    {
        keywords: ["celebration", "party", "festival", "wedding"],
        category: "Celebrations",
        amountRange: [-650, -120],
        note: "Event planning expense",
    },
    {
        keywords: ["travel", "flight", "vacation", "trip"],
        category: "Travel",
        amountRange: [-900, -200],
        note: "Travel booking and preparation",
    },
    {
        keywords: ["medical", "health", "doctor", "hospital"],
        category: "Healthcare",
        amountRange: [-450, -80],
        note: "Healthcare visit and prescriptions",
    },
    {
        keywords: ["education", "college", "school", "tuition"],
        category: "Education",
        amountRange: [-700, -150],
        note: "Tuition and learning materials",
    },
    {
        keywords: ["business", "startup", "side hustle"],
        category: "Business",
        amountRange: [-800, -200],
        note: "Small business investment",
    },
    {
        keywords: ["remittance", "family overseas", "support family"],
        category: "Remittance",
        amountRange: [-400, -100],
        note: "Family support transfer",
    },
];

const INCOME_KEYWORDS = [
    {
        keywords: ["bonus", "raise", "increase"],
        amountRange: [300, 900],
        note: "Workplace performance bonus",
    },
    {
        keywords: ["freelance", "contract", "gig"],
        amountRange: [150, 600],
        note: "Freelance project payment",
    },
    {
        keywords: ["grant", "scholarship"],
        amountRange: [250, 500],
        note: "Scholarship or grant received",
    },
];

const randomBetween = (min, max, rng) => {
    const lower = Math.min(min, max);
    const upper = Math.max(min, max);
    return Number((lower + rng() * (upper - lower)).toFixed(2));
};

function createRng(seedString) {
    const hash = crypto.createHash("sha256").update(seedString).digest();
    let index = 0;
    return () => {
        const value = hash[index % hash.length] / 255;
        index += 1;
        return value;
    };
}

function normalizeCultureKey(culture) {
    if (!culture) return null;
    const lower = culture.toLowerCase();
    return Object.keys(culturalContext).find(
        (key) => key.toLowerCase() === lower
    );
}

function mutateTransactions(baseTransactions, message, rng) {
    const clone = baseTransactions.map((txn) => ({ ...txn }));

    const jittered = clone.map((txn, idx) => {
        const factor = 0.75 + rng() * 0.5;
        const amount = Number((txn.amount * factor).toFixed(2));
        const date = txn.date
            ? txn.date
            : new Date(Date.now() - idx * 86400000).toISOString().slice(0, 10);
        return {
            ...txn,
            amount: amount === 0 ? txn.amount : amount,
            date,
        };
    });

    const lowerMessage = (message || "").toLowerCase();

    KEYWORD_SCENARIOS.forEach((scenario, scenarioIndex) => {
        if (
            scenario.keywords.some((keyword) => lowerMessage.includes(keyword))
        ) {
            const amount = -randomBetween(
                Math.abs(scenario.amountRange[0]),
                Math.abs(scenario.amountRange[1]),
                rng
            );
            const date = new Date(
                Date.now() - (scenarioIndex + 1) * 43200000
            )
                .toISOString()
                .slice(0, 10);
            jittered.push({
                date,
                amount: Number(amount.toFixed(2)),
                category: scenario.category,
                note: scenario.note,
            });
        }
    });

    INCOME_KEYWORDS.forEach((scenario, scenarioIndex) => {
        if (
            scenario.keywords.some((keyword) => lowerMessage.includes(keyword))
        ) {
            const amount = randomBetween(
                scenario.amountRange[0],
                scenario.amountRange[1],
                rng
            );
            const date = new Date(
                Date.now() - (scenarioIndex + 2) * 3600000
            )
                .toISOString()
                .slice(0, 10);
            jittered.push({
                date,
                amount: Number(amount.toFixed(2)),
                category: "Income",
                note: scenario.note,
            });
        }
    });

    // Add a small random discretionary expense to keep the data fresh.
    const discretionaryAmount = -randomBetween(15, 120, rng);
    jittered.push({
        date: new Date().toISOString().slice(0, 10),
        amount: Number(discretionaryAmount.toFixed(2)),
        category: "Everyday Life",
        note: "Discretionary purchase",
    });

    return jittered
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 12);
}

const formatCurrency = (value, currency, locale = "en-US") => {
    try {
        return new Intl.NumberFormat(locale, {
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
    currency = "USD",
    locale = "en-US",
}) => {
    const incomes = transactions
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
        values: sortedCategories.map(([, value]) =>
            Number(value.toFixed(2))
        ),
    };

    const pie = {
        labels: chart.labels,
        values: chart.values,
    };

    const tableRows = transactions.map((txn) => [
        txn.date ?? "",
        txn.category ?? "",
        txn.note ?? "",
        formatCurrency(txn.amount, currency, locale),
    ]);

    const totalExpenses = Math.abs(expenses);
    const inferredIncome = incomes;
    const inferredSavings = inferredIncome - totalExpenses;

    return {
        kpis: {
            income: Number(inferredIncome.toFixed(2)),
            expenses: Number(totalExpenses.toFixed(2)),
            savings: Number(inferredSavings.toFixed(2)),
            currency,
        },
        chart,
        pie,
        table: {
            columns: ["Date", "Category", "Note", "Amount"],
            rows: tableRows,
        },
        largestCategory: chart.labels[0] || null,
        totalExpenses,
    };
};

function buildSummary({ metrics, cultureData, currency, locale }) {
    const { kpis, largestCategory } = metrics;
    const culturalTail = cultureData?.example
        ? ` Consider traditions like ${cultureData.example}.`
        : "";
    return [
        `Income ${formatCurrency(kpis.income, currency, locale)}, expenses ${formatCurrency(
            kpis.expenses,
            currency,
            locale
        )}, savings ${formatCurrency(kpis.savings, currency, locale)}.`,
        largestCategory
            ? `${largestCategory} is currently your largest expense.`
            : "Track your top expense categories to stay on target.",
        culturalTail,
    ]
        .join(" ")
        .trim();
}

function buildActions({ metrics, cultureData, cultureKey }) {
    const topCategory = metrics.largestCategory || "daily expenses";
    const cultureName = cultureKey || "your community";
    return ACTION_LIBRARY.map((action) => ({
        id: action.id,
        intent: action.intent,
        label:
            action.id === "optimize_spending"
                ? `Reduce ${topCategory} costs`
                : action.id === "plan_cultural_events" && cultureData?.example
                ? `Plan for ${cultureData.example}`
                : action.label,
        followUp: action.followUp({
            topCategory,
            cultureName,
            cultureExample: cultureData?.example,
        }),
    }));
}

async function requestGeminiInsights({
    message,
    metrics,
    cultureData,
    cultureKey,
    languageConfig,
    scenario,
}) {
    if (!geminiClient) return null;

    const cultureLine = cultureKey
        ? `${cultureKey} (notes: ${JSON.stringify(cultureData)})`
        : 'Not specified';

    const prompt = `You are FinBridge, a multicultural financial advisor.

Ground your response in the data provided and produce JSON that follows this schema exactly:
{
  "summary": string,
  "actions": [
    { "label": string, "followUp": string, "intent": "save" | "plan" | "learn" }
  ]
}

- The summary must be 1-2 English sentences that reference the user's finances and offer a culturally aware recommendation.
- Provide 3 actionable chips that align with the financial situation. Each label should be concise. The followUp text should be a specific prompt we can send back to you for deeper guidance.
- Use the intents evenly when it makes sense (at least one of each where relevant).
- The followUp text should stay in English so the assistant can understand it, but labels can reference cultural concepts.
- Do not wrap the JSON in code fences, markdown, or additional commentary.

Conversation details:
- User message: ${message || 'No specific question provided.'}
- User cultural background: ${cultureLine}
- Preferred language (for final localization): ${
        languageConfig?.geminiName || 'English'
    }

Financial snapshot to reference:
- Income this period: ${metrics.kpis.income}
- Expenses this period: ${metrics.kpis.expenses}
- Savings delta: ${metrics.kpis.savings}
- Largest expense category: ${metrics.largestCategory || 'n/a'}
- Expense categories (top): ${JSON.stringify(metrics.chart)}
- Recent transactions: ${JSON.stringify(scenario.transactions.slice(0, 6))}
`;

    try {
        const result = await geminiClient.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
        });

        const text =
            result.output_text ||
            result?.response?.candidates?.[0]?.content?.parts
                ?.map((part) => part.text || '')
                .join('') ||
            '';

        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1) return null;
        const jsonText = text.slice(start, end + 1);
        const parsed = JSON.parse(jsonText);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed;
    } catch (error) {
        console.warn('Gemini insights fallback:', error?.message || error);
        return null;
    }
}

function generateScenario({ userId, message }) {
    const baseData =
        getMockTransactions(userId) || getMockTransactions("default") || {};
    const rng = createRng(`${message}-${Date.now()}-${userId}`);
    const currency = baseData.currency || "USD";
    const transactions = mutateTransactions(
        baseData.transactions || [],
        message,
        rng
    );

    const incomeTotal = transactions
        .filter((txn) => txn.amount > 0)
        .reduce((acc, txn) => acc + txn.amount, 0);
    const expenseTotal = transactions
        .filter((txn) => txn.amount < 0)
        .reduce((acc, txn) => acc + txn.amount, 0);

    return {
        transactions,
        monthSummary: {
            income: Number(incomeTotal.toFixed(2)),
            expenses: Number(Math.abs(expenseTotal).toFixed(2)),
            savings: Number(
                (incomeTotal - Math.abs(expenseTotal)).toFixed(2)
            ),
        },
        currency,
    };
}

export async function getFinancialAdvice({
    userId = "default",
    message = "",
    languageCode = DEFAULT_LANGUAGE,
    locale = "en-US",
    culture,
}) {
    const scenario = generateScenario({ userId, message });
    const cultureKey = normalizeCultureKey(culture) || culture;
    const cultureData = culturalContext[cultureKey] || {};
    const languageConfig =
        LANGUAGE_CONFIG[languageCode] || LANGUAGE_CONFIG[DEFAULT_LANGUAGE];

    const metrics = deriveMetrics({
        transactions: scenario.transactions,
        currency: scenario.currency,
        locale: languageConfig.locale || locale,
    });

    let summary = buildSummary({
        metrics,
        cultureData,
        currency: scenario.currency,
        locale: languageConfig.locale || locale,
    });

    const actions = buildActions({
        metrics,
        cultureData,
        cultureKey: cultureKey || culture,
    });

    const aiInsights = await requestGeminiInsights({
        message,
        metrics,
        cultureData,
        cultureKey: cultureKey || culture,
        languageConfig,
        scenario,
    });

    if (aiInsights?.summary) {
        summary = aiInsights.summary;
    }

    let parsedActions = actions;
    if (Array.isArray(aiInsights?.actions) && aiInsights.actions.length) {
        parsedActions = aiInsights.actions
            .filter(
                (action) =>
                    typeof action.label === 'string' &&
                    action.label.trim().length > 0 &&
                    typeof action.followUp === 'string' &&
                    action.followUp.trim().length > 0
            )
            .map((action) => ({
                label: action.label.trim(),
                followUp: action.followUp.trim(),
                intent: ['save', 'plan', 'learn'].includes(action.intent)
                    ? action.intent
                    : 'plan',
            }));
        if (!parsedActions.length) {
            parsedActions = actions;
        }
    }

    return {
        summary,
        kpis: metrics.kpis,
        chart: metrics.chart,
        pie: metrics.pie,
        table: metrics.table,
        actions: parsedActions,
    };
}
