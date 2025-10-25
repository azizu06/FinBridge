import express from "express";
import { getFinancialAdvice } from "../services/geminiService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, language, culture } = req.body;
    const reply = await getFinancialAdvice({ message, language, culture });
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating advice" });
  }
});

export default router;
