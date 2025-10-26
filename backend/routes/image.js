import express from "express";
import crypto from "crypto";

const router = express.Router();

const MAX_PROMPT_LENGTH = 180;

const clampPrompt = (prompt = "") => {
    const trimmed = prompt.trim();
    if (trimmed.length <= MAX_PROMPT_LENGTH) return trimmed;
    return `${trimmed.slice(0, MAX_PROMPT_LENGTH - 3)}...`;
};

const colorFromPrompt = (prompt) => {
    const hash = crypto.createHash("md5").update(prompt).digest("hex");
    const hue = parseInt(hash.slice(0, 2), 16) % 360;
    return `hsl(${hue}, 65%, 70%)`;
};

router.post("/", async (req, res) => {
    try {
        const { prompt } = req.body || {};
        if (!prompt || typeof prompt !== "string") {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const displayPrompt = clampPrompt(prompt);
        const background = colorFromPrompt(prompt);
        const accent = colorFromPrompt(`${prompt}:accent`);

        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
    <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${background}" />
            <stop offset="100%" stop-color="${accent}" />
        </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)" rx="24" ry="24" />
    <text
        x="50%"
        y="50%"
        font-family="Helvetica, Arial, sans-serif"
        font-size="28"
        fill="#0f172a"
        text-anchor="middle"
        dominant-baseline="middle"
        opacity="0.85"
        xml:space="preserve"
    >
        ${displayPrompt.replace(/&/g, "&amp;").replace(/</g, "&lt;")}
    </text>
</svg>`.trim();

        const imageUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString(
            "base64"
        )}`;

        res.json({ imageUrl });
    } catch (error) {
        console.error("Image route error:", error);
        res.status(500).json({ error: "Unable to create image" });
    }
});

export default router;

