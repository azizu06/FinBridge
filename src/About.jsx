import { useTranslation } from "react-i18next";

function About() {
        const { t } = useTranslation('about');

        return (
                <main className="font-serif py-12">
                        <style>{` :root{ --accent: #692475 } .accent-text{color:var(--accent)} .accent{background-color:var(--accent)} `}</style>

                        <section className="mx-auto max-w-6xl px-6 sm:px-8 mb-10">
                                <h1 className="text-4xl font-extrabold mb-3">{t('about.aboutUsTitle', { defaultValue: 'About FinBridge' })}</h1>
                                <p className="text-lg text-neutral-700 max-w-3xl">{t('about.welcomeMessage', { defaultValue: 'We provide culturally aware, practical financial guidance — in the language you prefer.' })}</p>
                        </section>

                        <section className="mx-auto max-w-6xl px-6 sm:px-8 mb-12">
                                <div className="grid gap-8 md:grid-cols-2 items-start">
                                        <div>
                                                <h2 className="text-2xl font-semibold mb-3">{t('about.mission_title', { defaultValue: 'Our mission' })}</h2>
                                                <p className="text-neutral-700 mb-4">{t('about.mission', { defaultValue: 'Make financial information accessible and relevant across languages and cultures.' })}</p>

                                                <h3 className="text-xl font-semibold mb-2">{t('about.keyFeaturesTitle', { defaultValue: 'What we do' })}</h3>
                                                <ul className="space-y-2">
                                                        <li className="flex items-start gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-indigo-50 grid place-items-center text-indigo-600">✓</div>
                                                                <div>
                                                                        <div className="font-semibold">{t('about.personalizedAdvice', { defaultValue: 'Personalized, easy-to-follow advice' })}</div>
                                                                        <div className="text-sm text-neutral-600">{t('about.personalizedAdviceDetail', { defaultValue: 'Short, practical steps you can act on today.' })}</div>
                                                                </div>
                                                        </li>
                                                        <li className="flex items-start gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-indigo-50 grid place-items-center text-indigo-600">💬</div>
                                                                <div>
                                                                        <div className="font-semibold">{t('about.chatbotAssistance', { defaultValue: 'Conversational assistance' })}</div>
                                                                        <div className="text-sm text-neutral-600">{t('about.chatbotAssistanceDetail', { defaultValue: 'Ask questions in your language and get clear explanations.' })}</div>
                                                                </div>
                                                        </li>
                                                        <li className="flex items-start gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-indigo-50 grid place-items-center text-indigo-600">📄</div>
                                                                <div>
                                                                        <div className="font-semibold">{t('about.documentAnalysis', { defaultValue: 'Document analysis' })}</div>
                                                                        <div className="text-sm text-neutral-600">{t('about.documentAnalysisDetail', { defaultValue: 'Quick summaries of forms and statements.' })}</div>
                                                                </div>
                                                        </li>
                                                </ul>
                                        </div>

                                        <div>
                                                <div className="bg-white rounded-xl shadow-md p-6">
                                                        <h4 className="font-semibold mb-2">{t('about.commitmentTitle', { defaultValue: 'Privacy & security' })}</h4>
                                                        <p className="text-sm text-neutral-600 mb-4">{t('about.commitmentMessage', { defaultValue: 'We protect your data and partner with trusted organizations to improve outcomes.' })}</p>
                                                        
                                                </div>

                                                <div className="mt-6">
                                                        <h4 className="font-semibold mb-2">{t('about.contactTitle', { defaultValue: 'Get involved' })}</h4>
                                                        <p className="text-sm text-neutral-600 mb-3">{t('about.contactText', { defaultValue: 'Partner with us or try our tools — we welcome feedback from the community.' })}</p>
                                                        <button className="px-4 py-2 rounded-md bg-indigo-600 text-white" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{t('about.cta', { defaultValue: 'Contact us' })}</button>
                                                </div>
                                        </div>
                                </div>
                        </section>
                </main>
        );
}

export default About;