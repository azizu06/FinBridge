import express from "express";
import { translateText } from "../services/translateService.js";
import { getFinancialAdvice } from "../services/geminiService.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { message, language, culture, userId } = req.body;
        const userMessageInEnglish = await translateText(message, "en");

        const uiAdvice = await getFinancialAdvice({
            userId: userId || "default",
            message: userMessageInEnglish,
            language: "English",
            culture,
        });

        let finalReply = uiAdvice.summary;
        try {
            finalReply = await translateText(uiAdvice.summary, language);
        } catch (translateError) {
            console.warn("Advice translation fallback:", translateError);
        }

        res.json({
            reply: finalReply,
            ui: {
                ...uiAdvice,
                summary: finalReply,
            },
        });
    } catch (error) {
        console.error("Advice route error:", error);
        res.status(500).json({ error: "Error generating advice" });
    }
});

export default router;
