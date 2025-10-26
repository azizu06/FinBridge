import express from "express";
import {
    translateText,
    translateTexts,
} from "../services/translateService.js";
import { getFinancialAdvice } from "../services/geminiService.js";
import {
    LANGUAGE_CONFIG,
    DEFAULT_LANGUAGE,
} from "../config/languages.js";

const router = express.Router();

function cloneUi(ui) {
    return typeof structuredClone === "function"
        ? structuredClone(ui)
        : JSON.parse(JSON.stringify(ui));
}

async function localizeUi(ui, languageConfig) {
    if (!ui) return ui;
    const translatorCode = languageConfig.translatorCode || "en";
    if (translatorCode === "en") {
        return { ...ui };
    }

    const localized = cloneUi(ui);
    const targets = [];
    const setters = [];

    const enqueue = (text, setter) => {
        if (typeof text !== "string" || !text.trim()) return;
        targets.push(text);
        setters.push(setter);
    };

    enqueue(localized.summary, (value) => {
        localized.summary = value;
    });

    if (Array.isArray(localized.actions)) {
        localized.actions.forEach((action, index) => {
            enqueue(action.label, (value) => {
                localized.actions[index].label = value;
            });
        });
    }

    if (localized.table?.columns) {
        localized.table.columns.forEach((column, columnIndex) => {
            enqueue(column, (value) => {
                localized.table.columns[columnIndex] = value;
            });
        });
    }

    if (localized.table?.rows) {
        localized.table.rows.forEach((row, rowIndex) => {
            if (Array.isArray(row) && row[1]) {
                enqueue(row[1], (value) => {
                    localized.table.rows[rowIndex][1] = value;
                });
            }
            if (Array.isArray(row) && row[2]) {
                enqueue(row[2], (value) => {
                    localized.table.rows[rowIndex][2] = value;
                });
            }
        });
    }

    if (localized.chart?.labels) {
        localized.chart.labels.forEach((label, labelIndex) => {
            enqueue(label, (value) => {
                localized.chart.labels[labelIndex] = value;
            });
        });
    }

    if (!targets.length) return localized;

    const translations = await translateTexts(targets, translatorCode);
    translations.forEach((value, idx) => {
        setters[idx](value);
    });

    if (localized.pie?.labels && localized.chart?.labels) {
        localized.pie.labels = [...localized.chart.labels];
    }

    return localized;
}

router.post("/", async (req, res) => {
    try {
        const { message, language, culture, userId } = req.body;

        const languageConfig =
            LANGUAGE_CONFIG?.[language] || LANGUAGE_CONFIG[DEFAULT_LANGUAGE];

        let userMessageInEnglish = message;
        if (languageConfig.translatorCode !== "en") {
            userMessageInEnglish = await translateText(message, "en");
        }

        const uiAdvice = await getFinancialAdvice({
            userId: userId || "default",
            message: userMessageInEnglish,
            languageCode: languageConfig.code,
            locale: languageConfig.locale,
            culture,
        });

        const localizedUi = await localizeUi(uiAdvice, languageConfig);

        let finalReply = localizedUi.summary;

        res.json({
            reply: finalReply,
            ui: {
                ...localizedUi,
                summary: finalReply,
            },
        });
    } catch (error) {
        console.error("Advice route error:", error);
        res.status(500).json({ error: "Error generating advice" });
    }
});

export default router;
