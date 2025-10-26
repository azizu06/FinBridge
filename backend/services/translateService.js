import axios from "axios";

const TRANSLATE_URL = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_KEY}`;

export async function translateTexts(texts, targetLang) {
    if (!Array.isArray(texts) || !texts.length) return [];
    try {
        const response = await axios.post(TRANSLATE_URL, {
            q: texts,
            target: targetLang,
        });
        return (
            response.data?.data?.translations?.map(
                (item) => item.translatedText
            ) || texts
        );
    } catch (error) {
        console.error(
            "Translation API error:",
            error.response?.data || error.message
        );
        return texts;
    }
}

export async function translateText(text, targetLang) {
    if (!text) return text;
    const [result] = await translateTexts([text], targetLang);
    return result;
}
