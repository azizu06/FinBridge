import { useTranslation } from "react-i18next";

function About() {
    const { t } = useTranslation();

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{t("aboutUsTitle")}</h1>
            <p className="mb-4">{t("welcomeMessage")}</p>
            <p className="mb-4">{t("platformDescription")}</p>
            <p className="mb-4">{t("keyFeaturesTitle")}</p>
            <ul className="list-disc list-inside mb-4">
                <li><span className="font-bold italic">{t("personalizedAdvice")}</span></li>
                <li><span className="font-bold italic">{t("chatbotAssistance")}</span></li>
                <li><span className="font-bold italic">{t("documentAnalysis")}</span></li>
                <li><span className="font-bold italic">{t("multilingualSupport")}</span></li>
            </ul>
            <p className="mb-4">{t("commitmentMessage")}</p>
            <p>{t("callToAction")}</p>
        </div>
    );
}

export default About;