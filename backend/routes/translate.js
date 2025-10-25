import express from "express";
import { translateText } from "../services/translateService.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        const translated = await translateText(text, targetLang);
        res.json({translated});
    } catch(error) {
        console.error("Translation route error:", error);
        res.status(500).json({ error: "Translation failed" });
    }
});

export default router;