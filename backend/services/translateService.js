import axios from "axios";

export async function translateText(text, targetLang) {
    try {
        const response = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_KEY}`,
        {
            q: text,
            target: targetLang
        }
    );

    const translatedText = response.data.data.translations[0].translatedText;
    return translatedText;
    } catch(error) {
        console.error("Translation API error::", error.response?.data || error.message);

        return "Error: Unable to translate text right now.";
    }
}