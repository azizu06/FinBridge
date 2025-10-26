import { useCallback, useEffect, useMemo, useState } from 'react';
import Chatbot from './Chatbot.jsx';
import AdviceCanvas from './components/AdviceCanvas.jsx';
import { useLocale } from './context/LocaleContext.jsx';
import { LANGUAGE_OPTIONS } from './config/options.js';

const API_BASE_URL =
    (import.meta.env.VITE_BACKEND_URL &&
        import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')) ||
    'http://localhost:5001/api';

const DEFAULT_STRINGS = {
    title: 'Dashboard insights',
    subtitle:
        'FinBridge turns your conversation into visuals, tables, and next steps tailored to you.',
    loading: 'Loading personalized insights…',
    error: 'Unable to load dashboard insights.',
    empty: 'Ask FinBridge a question in the chat to populate your dashboard.',
};

const STRING_KEYS = Object.keys(DEFAULT_STRINGS);

function Dashboard() {
    const [insights, setInsights] = useState(null);
    const [canvasLoading, setCanvasLoading] = useState(false);
    const [canvasError, setCanvasError] = useState('');
    const [queuedPrompt, setQueuedPrompt] = useState(null);
    const { language, culture, setLanguage, setCulture } = useLocale();
    const [uiStrings, setUiStrings] = useState(DEFAULT_STRINGS);
    const [stringsLoading, setStringsLoading] = useState(false);

    const translatorCode = useMemo(() => {
        const option = LANGUAGE_OPTIONS.find(
            (item) => item.code === language
        );
        return option?.translatorCode || language || 'en';
    }, [language]);

    useEffect(() => {
        if (!translatorCode || translatorCode === 'en') {
            setUiStrings(DEFAULT_STRINGS);
            setStringsLoading(false);
            return;
        }

        const controller = new AbortController();
        const translateStrings = async () => {
            try {
                setStringsLoading(true);
                const response = await fetch(`${API_BASE_URL}/translate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        texts: STRING_KEYS.map((key) => DEFAULT_STRINGS[key]),
                        targetLang: translatorCode,
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(
                        `Translation failed (${response.status})`
                    );
                }

                const data = await response.json();
                const translated = Array.isArray(data?.translated)
                    ? data.translated
                    : [];

                const mapped = STRING_KEYS.reduce((acc, key, index) => {
                    acc[key] = translated[index] || DEFAULT_STRINGS[key];
                    return acc;
                }, {});

                setUiStrings(mapped);
            } catch (err) {
                if (controller.signal.aborted) return;
                console.warn('Dashboard translation failed:', err);
                setUiStrings(DEFAULT_STRINGS);
            } finally {
                if (!controller.signal.aborted) {
                    setStringsLoading(false);
                }
            }
        };

        translateStrings();
        return () => controller.abort();
    }, [translatorCode]);

    const generateAdvice = useCallback(
        async ({ message, language: lang, culture: cultureValue }) => {
            setCanvasLoading(true);
            setCanvasError('');

            try {
                const res = await fetch(`${API_BASE_URL}/advice`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message,
                        language: lang ?? language,
                        culture: cultureValue ?? culture,
                    }),
                });

                if (!res.ok) {
                    const payload = await res.json().catch(() => ({}));
                    throw new Error(
                        payload?.error || `Request failed (${res.status})`
                    );
                }

                const data = await res.json();
                setInsights(data?.ui || null);
                return data;
            } catch (error) {
                setCanvasError(
                    error?.message || 'Unable to load dashboard insights.'
                );
                throw error;
            } finally {
                setCanvasLoading(false);
            }
        },
        [language, culture]
    );

    const handleActionSelect = useCallback((action) => {
        if (!action?.followUp) return;
        setQueuedPrompt({
            send: action.followUp,
            display: action.label || action.followUp,
        });
    }, []);

    const clearQueuedPrompt = useCallback(() => {
            setQueuedPrompt(null);
    }, []);

    return (
        <div className="flex flex-col gap-6 p-4">
            {stringsLoading && (
                <section className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-neutral-500">
                    Translating interface…
                </section>
            )}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="flex-1">
                    <AdviceCanvas
                        insights={insights}
                        loading={canvasLoading}
                        error={canvasError}
                        onActionSelect={handleActionSelect}
                        strings={uiStrings}
                    />
                </div>
                <div className="w-full lg:w-[24rem]">
                    <Chatbot
                        onGenerateAdvice={generateAdvice}
                        queuedPrompt={queuedPrompt}
                        onPromptConsumed={clearQueuedPrompt}
                        className="lg:sticky lg:top-16"
                    />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
