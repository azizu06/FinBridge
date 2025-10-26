import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useLocale } from "./context/LocaleContext.jsx";
import { LANGUAGE_OPTIONS } from "./config/options.js";

export default function Home() {
    const { t } = useTranslation();
    const { language, setLanguage } = useLocale();
    const navigate = useNavigate();

    
    const heroImg = "/assets/article-1.webp";
    const a1 = "/assets/article-2.jpg";
    const a2 = "/assets/article-3.jpg";
    const a3 = "/assets/hero-family.jpg";

    const translatedArticles = t("home.articles", { returnObjects: true });
    const articles = Array.isArray(translatedArticles) ? translatedArticles : [];

    

    return (
        <main className="bg-gray-50 font-serif">
            <style>{`
                :root{ --accent: #692475; }
                @media print { header, nav, .no-print { display: none !important; } main { padding-top: 0 !important; } img { max-width: 100% !important; } }
                .accent{background-color:var(--accent);} .accent-text{color:var(--accent);} .accent-border{border-color:var(--accent);} 
            `}</style>
            {/* HERO */}
            <section className="mx-auto max-w-6xl px-6 sm:px-8 pt-12 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="mb-6">
                            <label className="block text-lg font-semibold text-neutral-700 mb-2">{t("home.choose_language", { defaultValue: "Choose your language" })}</label>
                            <select
                                className="rounded border px-3 py-2 text-base"
                                value={lang}
                                onChange={(e) => setLang(e.target.value)}
                            >
                                <option value="en">{t("switcher.en", { defaultValue: "English" })}</option>
                                <option value="es">{t("switcher.es", { defaultValue: "Español" })}</option>
                            </select>
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-neutral-900 leading-tight">
                            {t("hero.title", { defaultValue: "Understand your finances with no confusion." })}
                        </h1>
                        <p className="mt-4 text-lg text-neutral-700 max-w-prose">{t("hero.subtitle", { defaultValue: "Simple, culturally aware guidance—translated for you." })}</p>

                        <div className="mt-6 flex flex-wrap gap-3 items-center">
                            <button
                                className="px-5 py-2 rounded-md accent text-white font-medium transition"
                                onClick={() => navigate("/dashboard")}
                            >
                                {t("home.login_plaid", { defaultValue: "Log in to Plaid" })}
                            </button>

                            <button
                                className="px-4 py-2 rounded-md border accent-border accent-text bg-white text-sm hover:bg-neutral-50 transition"
                                onClick={() => document.getElementById("articles-section")?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                {t("home.learn_more", { defaultValue: "Learn more" })}
                            </button>
                        </div>

                        <p className="mt-4 text-sm text-neutral-500">{t("home.trust_line", { defaultValue: "Trusted, secure, and privacy-first." })}</p>
                    </div>

                    <div>
                        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                            <img src={heroImg} alt={t("hero.image_alt", { defaultValue: "People learning together" })} className="w-full h-[360px] object-cover" loading="eager" />
                        </div>
                    </div>
                </div>
            </section>

            

            {/* ARTICLES */}
            <section id="articles-section" className="mx-auto max-w-6xl px-6 sm:px-8 pb-8">
                <h2 className="text-2xl font-semibold text-neutral-900 mb-6">{t("home.learn_heading", { defaultValue: "Learn more about personal finance" })}</h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((a, idx) => {
                        const imgs = [a1, a2, a3];
                        const imgSrc = a.img || imgs[idx] || "";
                        const key = a.href || a.title || idx;
                        return (
                            <a
                                key={key}
                                href={a.href || "#"}
                                target={a.href ? "_blank" : undefined}
                                rel={a.href ? "noreferrer" : undefined}
                                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition transform hover:-translate-y-1"
                            >
                                {imgSrc ? (
                                    <img src={imgSrc} alt={a.title || ""} className="h-40 w-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="h-40 w-full bg-neutral-100" />
                                )}
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg text-neutral-900">{a.title}</h3>
                                    <p className="mt-1 text-sm text-neutral-600">{a.blurb}</p>
                                    <div className="mt-3 inline-flex items-center accent-text text-sm font-medium">
                                        {t("cta.secondary", { defaultValue: "Learn more" })} →
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </section>

            
            {/* CTA BAND (prominent accent) */}
            <section className="accent">
                <div className="mx-auto max-w-6xl px-6 sm:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <p className="text-white text-lg font-medium">{t("home.cta_text", { defaultValue: "Translating and understanding your finances doesn’t have to be hard." })}</p>
                        <p className="text-sm text-indigo-100">{t("home.cta_subtext", { defaultValue: "Explore guides, tools, and culturally aware advice." })}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            className="px-6 py-3 rounded-md bg-white accent-text font-semibold hover:opacity-95 transition"
                            onClick={() => navigate("/dashboard")}
                        >
                            {t("home.cta_button", { defaultValue: "Get started" })}
                        </button>
                        <button
                            className="px-4 py-2 rounded-md border border-white/30 text-white bg-transparent hover:bg-white/10 transition"
                            onClick={() => document.getElementById("articles-section")?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            {t("home.learn_more", { defaultValue: "Learn more" })}
                        </button>
                    </div>
                </div>
            </section>

        </main>
    );
}

function Feature({ title, desc }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-5">
            <div className="h-10 w-10 rounded-full bg-yellow-400/80 mb-3" />
            <h3 className="font-semibold text-black">{title}</h3>
            <p className="mt-1 text-sm text-neutral-700">{desc}</p>
        </div>
    );
}