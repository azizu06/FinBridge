import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const heroImg = "/assets/hero-family.jpg";
    const a1 = "/assets/article-1.jpg";
    const a2 = "/assets/article-2.jpg";
    const a3 = "/assets/article-3.jpg";

    const initial = i18n.language?.startsWith("es") ? "es" : "en";
    const [lang, setLang] = useState(initial);

    useEffect(() => {
        const current = i18n.language?.startsWith("es") ? "es" : "en";
        if (current !== lang) i18n.changeLanguage(lang);
    }, [lang, i18n]);

    const articles = t("home.articles", { returnObjects: true }) || [];

    const [waitlistState, setWaitlistState] = useState({
        loading: false,
        ok: false,
        error: "",
    });

    const handleWaitlist = async (e) => {
        e.preventDefault();
        const email = new FormData(e.currentTarget).get("email");
        if (!email) return;

        try {
            setWaitlistState({ loading: true, ok: false, error: "" });

            const res = await fetch("https://formspree.io/f/REPLACE_WITH_YOUR_ID", {
                method: "POST",
                headers: { Accept: "application/json" },
                body: new FormData(e.currentTarget),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data?.error || "Request failed");
            }

            setWaitlistState({ loading: false, ok: true, error: "" });
            e.currentTarget.reset();
        } catch (err) {
            setWaitlistState({
                loading: false,
                ok: false,
                error: err?.message || "Error",
            });
        }
    };

    return (
        <main className="bg-gray-100">
            <section className="mx-auto max-w-6xl px-6 sm:px-8 pt-10 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black">
                            {t("hero.title")}
                        </h1>
                        <p className="mt-4 text-lg text-neutral-700 max-w-prose">{t("hero.subtitle")}</p>

                        <div className="mt-6 flex flex-wrap items-center gap-4">
                            <label className="text-sm">
                                {t("home.choose_language")}:
                                <select
                                    className="ml-2 rounded border px-3 py-2"
                                    value={lang}
                                    onChange={(e) => setLang(e.target.value)}
                                >
                                    <option value="en">{t("switcher.en")}</option>
                                    <option value="es">{t("switcher.es")}</option>
                                </select>
                            </label>

                            <button
                                className="px-4 py-2 rounded bg-green-700 text-white font-medium hover:opacity-90 transition"
                                onClick={() => navigate("/dashboard")}
                            >
                                {t("home.go_dashboard")}
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <img
                            src={heroImg}
                            alt={
                                lang === "es"
                                    ? "Personas aprendiendo sobre finanzas juntas"
                                    : "People learning about finances together"
                            }
                            className="w-full rounded-2xl shadow-lg object-cover h-[320px] md:h-[420px]"
                            loading="eager"
                        />
                        <div className="absolute -bottom-3 -right-3 h-16 w-16 rounded-full bg-yellow-400/90" />
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 sm:px-8 pb-8">
                <h2 className="text-2xl font-semibold text-black mb-4">{t("home.learn_heading")}</h2>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {(articles || []).map((a, idx) => {
                        const imgs = [a1, a2, a3];
                        const imgSrc = a.img || imgs[idx] || "";
                        const key = a.href || a.title || idx;
                        return (
                            <a
                                key={key}
                                href={a.href || "#"}
                                target={a.href ? "_blank" : undefined}
                                rel={a.href ? "noreferrer" : undefined}
                                className="bg-white rounded-xl shadow-md overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition transform"
                            >
                                {imgSrc ? (
                                    <img src={imgSrc} alt={a.title || ""} className="h-40 w-full object-cover" loading="lazy" />
                                ) : (
                                    <div className="h-40 w-full bg-neutral-200" />
                                )}
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg text-black">{a.title}</h3>
                                    <p className="mt-1 text-sm text-neutral-600">{a.blurb}</p>
                                    <div className="mt-3 inline-flex items-center text-green-700 text-sm font-medium">
                                        {t("cta.secondary")} →
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </section>

            <section className="mx-auto max-w-6xl px-6 sm:px-8 py-10">
                <h2 className="text-2xl font-semibold text-black mb-6">{t("home.features_heading")}</h2>

                <div className="grid gap-6 sm:grid-cols-3">
                    {(t("home.features", { returnObjects: true }) || []).map((f, i) => (
                        <Feature key={i} title={f.title} desc={f.desc} />
                    ))}
                </div>
            </section>

            <section className="bg-green-700">
                <div className="mx-auto max-w-6xl px-6 sm:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white text-lg font-medium">{t("home.cta_text")}</p>
                    <button
                        className="px-5 py-2 rounded bg-yellow-400 text-black font-semibold hover:opacity-90 transition"
                        onClick={() => navigate("/dashboard")}
                    >
                        {t("home.cta_button")}
                    </button>
                </div>
            </section>

            <section className="mx-auto max-w-3xl px-6 sm:px-8 py-10">
                <h2 className="text-2xl font-semibold text-black mb-3">{t("home.waitlist.title")}</h2>
                <p className="text-neutral-700 mb-4">{t("home.waitlist.description")}</p>

                <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder={t("home.waitlist.placeholder_email")}
                        className="w-full sm:flex-1 rounded border px-4 py-2"
                    />
                    <button
                        type="submit"
                        disabled={waitlistState.loading}
                        className="px-5 py-2 rounded bg-black text-white font-medium hover:opacity-90 transition disabled:opacity-60"
                    >
                        {waitlistState.loading ? t("home.waitlist.sending") : t("home.waitlist.join_list")}
                    </button>
                </form>

                {waitlistState.ok && <p className="mt-2 text-green-700 text-sm">{t("home.waitlist.success")}</p>}
                {waitlistState.error && <p className="mt-2 text-red-600 text-sm">{t("home.waitlist.error")}</p>}
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
