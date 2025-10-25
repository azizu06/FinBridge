import express from "express";
import { translateText } from "../services/translateService.js";
import { getFinancialAdvice } from "../services/geminiService.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { message, language, culture } = req.body;
        const userMessageInEnglish = await translateText(message, "en");

        const englishReplay = await getFinancialAdvice({
            message: userMessageInEnglish,
            language: "English",
            culture
        });

        const finalReply = await translateText(englishReplay, language);

        res.json({ reply: finalReply });
    }
    catch(error) {
        console.error("Advice route error:", error);
        res.status(500).json({ error: "Error generating advice" });
    }
});

export default router;