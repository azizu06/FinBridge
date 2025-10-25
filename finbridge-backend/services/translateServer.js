import axios from "axios";

export async function translateText(text, targetLang) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_KEY}`;
  const res = await axios.post(url, {
    q: text,
    target: targetLang,
  });
  return res.data.data.translations[0].translatedText;
}
