import express from "express";
import {
    translateText,
    translateTexts,
} from "../services/translateService.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { text, texts, targetLang } = req.body || {};

        if (!targetLang) {
            return res
                .status(400)
                .json({ error: "targetLang is required for translation" });
        }

        if (Array.isArray(texts)) {
            const translated = await translateTexts(texts, targetLang);
            return res.json({ translated });
        }

        if (typeof text === "string") {
            const translated = await translateText(text, targetLang);
            return res.json({ translated });
        }

        return res
            .status(400)
            .json({ error: "Provide either text or texts for translation" });
    } catch (error) {
        console.error("Translation route error:", error);
        res.status(500).json({ error: "Translation failed" });
    }
});

export default router;
