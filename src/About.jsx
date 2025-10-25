import { useTranslation } from "react-i18next";

function About() {
    const { t } = useTranslation('about');

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Page Header */}
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold mb-7">{t("aboutUsTitle")}</h1>
                    <p className="text-xl text-white p-6 rounded-lg bg-green-500 shadow-md">
                        {t("welcomeMessage")}
                    </p>
                </header>

                {/* Platform Description */}
                <section className="mb-12 text-center">
                    <p className="text-xl text-gray-700 leading-relaxed">{t("platformDescription")}</p>
                </section>

                {/* Key Features */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("keyFeaturesTitle")}</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center m-x-auto">
                        <li className="bg-green-500 text-white shadow-md rounded-lg p-6 flex items-center justify-center">
                            <span className="font-bold italic">{t("personalizedAdvice")}</span>
                        </li>
                        <li className="bg-green-500 text-white shadow-md rounded-lg p-6 flex items-center justify-center">
                            <span className="font-bold italic">{t("chatbotAssistance")}</span>
                        </li>
                        <li className="bg-green-500 text-white shadow-md rounded-lg p-6 flex items-center justify-center">
                            <span className="font-bold italic">{t("documentAnalysis")}</span>
                        </li>
                        <li className="bg-green-500 text-white shadow-md rounded-lg p-6 flex items-center justify-center">
                            <span className="font-bold italic">{t("multilingualSupport")}</span>
                        </li>
                    </ul>
                </section>

                {/* Commitment Message */}
                <section className="mb-12">
                    <p className="text-xl text-gray-700 leading-relaxed">{t("commitmentMessage")}</p>
                </section>

                {/* Call to Action */}
                <section className="text-center">
                    <p className="text-xl font-semibold text-gray-800 mb-6">{t("callToAction")}</p>
                    <button className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600">
                        {t("callToAction")}
                    </button>
                </section>
            </div>
        </div>
    );
}

export default About;