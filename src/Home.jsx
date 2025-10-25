import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // initialize from current i18n language
  const initial = i18n.language?.startsWith("es") ? "es" : "en";
  const [lang, setLang] = useState(initial);

  // whenever the dropdown changes, update i18n (no redirect)
    useEffect(() => {
    if ((i18n.language?.startsWith("es") ? "es" : "en") !== lang) {
        i18n.changeLanguage(lang);
    }
    }, [lang, i18n]);

    return (
    <main className="p-8 space-y-6 max-w-3xl">
        <h1 className="text-3xl font-bold">{t("hero.title")}</h1>
        <p className="text-gray-700">{t("hero.subtitle")}</p>

        <div className="flex items-center gap-4">
        <label className="text-sm">
            {t("home.choose_language")}:
            <select
            className="ml-2 border rounded px-3 py-2"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            >
            <option value="en">{t("switcher.en")}</option>
            <option value="es">{t("switcher.es")}</option>
            </select>
        </label>

        <button
            className="px-4 py-2 rounded bg-black text-white"
            onClick={() => navigate("/dashboard")}
        >
            {t("home.go_dashboard")}
        </button>
        </div>
    </main>
    );
}
