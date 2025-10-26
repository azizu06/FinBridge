import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    LANGUAGE_OPTIONS,
    CULTURE_OPTIONS,
    I18N_LANGUAGES,
} from './config/options.js';

const API_BASE_URL =
    (import.meta.env.VITE_BACKEND_URL &&
        import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')) ||
    'http://localhost:5001/api';

const LANGUAGE_SET = new Set(LANGUAGE_OPTIONS.map((item) => item.code));
const CULTURE_SET = new Set(CULTURE_OPTIONS.map((item) => item.code));

const normalizeLanguage = (value) => {
    if (!value) return undefined;
    const base = value.split('-')[0];
    return LANGUAGE_SET.has(base) ? base : undefined;
};

const EN_LABELS = {
    title: 'FinBridge Assistant',
    subtitle: 'Ask for culturally aware financial guidance.',
    initialMessage: 'Hello! How can I assist you today?',
    placeholder: 'Type your message...',
    loadingMessage: 'Thinking...',
    errorMessage: "I'm having trouble answering right now. Please try again later.",
    fallbackModelReply: 'Here is a quick budgeting reminder while I reconnect.',
    sending: 'Sending...',
    send: 'Send',
};

const LABEL_KEYS = Object.keys(EN_LABELS);

function Chatbot({
    language = 'en',
    onLanguageChange,
    culture = 'american',
    onCultureChange,
    onGenerateAdvice,
    queuedPrompt,
    onPromptConsumed,
    className = '',
}) {
    const { t, i18n } = useTranslation('chatbot');
    const [messages, setMessages] = useState(() => [
        { role: 'model', text: EN_LABELS.initialMessage },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [customLabels, setCustomLabels] = useState(null);
    const [translatingLabels, setTranslatingLabels] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages]);

    const languageOption = LANGUAGE_OPTIONS.find(
        (option) => option.code === language
    );
    const translatorCode =
        languageOption?.translatorCode || languageOption?.code || 'en';

    useEffect(() => {
        const normalized = normalizeLanguage(language) || 'en';

        if (I18N_LANGUAGES.has(normalized)) {
            if (i18n.language !== normalized) {
                i18n.changeLanguage(normalized);
            }
            setCustomLabels(null);
            setTranslatingLabels(false);
            return;
        }

        if (i18n.language !== 'en') {
            i18n.changeLanguage('en');
        }

        if (!translatorCode || translatorCode === 'en') {
            setCustomLabels(null);
            setTranslatingLabels(false);
            return;
        }

        const controller = new AbortController();
        const translateLabels = async () => {
            try {
                setTranslatingLabels(true);
                const response = await fetch(`${API_BASE_URL}/translate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        texts: LABEL_KEYS.map((key) => EN_LABELS[key]),
                        targetLang: translatorCode,
                    }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Translation failed (${response.status})`);
                }

                const data = await response.json();
                const translated = Array.isArray(data?.translated)
                    ? data.translated
                    : [];

                const mapped = LABEL_KEYS.reduce((acc, key, index) => {
                    acc[key] = translated[index] || EN_LABELS[key];
                    return acc;
                }, {});
                setCustomLabels(mapped);
            } catch (err) {
                if (controller.signal.aborted) return;
                console.warn('Label translation failed:', err);
                setCustomLabels(null);
            } finally {
                if (!controller.signal.aborted) {
                    setTranslatingLabels(false);
                }
            }
        };

        translateLabels();
        return () => controller.abort();
    }, [language, translatorCode, i18n]);

    const labels = LABEL_KEYS.reduce((acc, key) => {
        if (customLabels?.[key]) {
            acc[key] = customLabels[key];
        } else {
            acc[key] = t(key);
        }
        return acc;
    }, {});

    useEffect(() => {
        const initialText = customLabels?.initialMessage ?? labels.initialMessage;
        setMessages((prev) => {
            if (prev.length === 1 && prev[0]?.role === 'model') {
                return [{ role: 'model', text: initialText }];
            }
            return prev;
        });
    }, [customLabels?.initialMessage, labels.initialMessage]);

    const getCultureContextKey = useCallback(
        () =>
            CULTURE_OPTIONS.find((option) => option.code === culture)
                ?.contextKey || 'American',
        [culture]
    );

    const send = useCallback(
        async (overrideText, displayOverride) => {
            const outbound = (overrideText ?? input).trim();
            const display = (displayOverride ?? outbound).trim();
            if (!outbound || loading) return;

            const loadingMessage =
                customLabels?.loadingMessage ?? t('loadingMessage');

            setMessages((prev) => [
                ...prev,
                { role: 'user', text: display },
                { role: 'model', text: loadingMessage },
            ]);
            setInput('');
            setError('');
            setLoading(true);

            const fetchAdvice =
                onGenerateAdvice ||
                (async ({ message, language: lang, culture: cultureName }) => {
                    const res = await fetch(`${API_BASE_URL}/advice`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message,
                            language: lang,
                            culture: cultureName,
                        }),
                    });

                    if (!res.ok) {
                        const payload = await res.json().catch(() => ({}));
                        throw new Error(
                            payload?.error || `Request failed (${res.status})`
                        );
                    }

                    return res.json();
                });

            try {
                const data = await fetchAdvice({
                    message: outbound,
                    language,
                    culture: getCultureContextKey(),
                });

                const fallbackReply =
                    customLabels?.fallbackModelReply ?? t('fallbackModelReply');
                const reply = data?.reply || fallbackReply;

                setMessages((prev) => [
                    ...prev.slice(0, prev.length - 1),
                    { role: 'model', text: reply },
                ]);
            } catch (err) {
                console.error('Advice fetch failed:', err);
                const errorLabel =
                    customLabels?.errorMessage ?? t('errorMessage');
                setError(err.message || errorLabel);
                setMessages((prev) => [
                    ...prev.slice(0, prev.length - 1),
                    { role: 'model', text: errorLabel },
                ]);
            } finally {
                setLoading(false);
            }
        },
        [
            input,
            loading,
            onGenerateAdvice,
            language,
            getCultureContextKey,
            customLabels,
            t,
        ]
    );

    const onKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            send();
        }
    };

    useEffect(() => {
        if (!queuedPrompt) return;
        const payload =
            typeof queuedPrompt === 'string'
                ? { send: queuedPrompt, display: queuedPrompt }
                : queuedPrompt;
        const sendText = payload?.send?.trim?.() ?? '';
        const displayText = payload?.display?.trim?.() ?? sendText;

        if (!sendText) {
            onPromptConsumed?.();
            return;
        }
        if (loading) return;
        setInput(displayText);
        send(sendText, displayText);
        onPromptConsumed?.();
    }, [queuedPrompt, loading, send, onPromptConsumed]);

    return (
        <div
            className={`flex h-full max-h-[80vh] flex-col rounded-xl border border-gray-200 bg-white shadow-lg ${className}`}
        >
            <div className="border-b border-gray-200 px-4 py-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                    {labels.title}
                </h2>
                <p className="text-sm text-neutral-500">
                    {translatingLabels ? `${labels.subtitle} …` : labels.subtitle}
                </p>
                <div className="mt-3 flex gap-2">
                    <select
                        className="flex-1 rounded border px-2 py-1 text-sm"
                        value={language}
                        onChange={(e) => {
                            const next = e.target.value;
                            onLanguageChange?.(next);
                        }}
                    >
                        {LANGUAGE_OPTIONS.map((option) => (
                            <option key={option.code} value={option.code}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <select
                        className="flex-1 rounded border px-2 py-1 text-sm"
                        value={culture}
                        onChange={(e) => onCultureChange?.(e.target.value)}
                    >
                        {CULTURE_OPTIONS.map((option) => (
                            <option key={option.code} value={option.code}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                {error && (
                    <p className="mt-2 text-xs text-red-600">{error}</p>
                )}
            </div>
                <div
                    className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
                    ref={listRef}
                    style={{ maxHeight: '60vh' }}
                >
                    {messages.map((message, index) => (
                        <div
                            key={`${message.role}-${index}`}
                            className={`flex ${
                                message.role === 'user'
                                ? 'justify-end'
                                : 'justify-start'
                        }`}
                    >
                        <span
                            className={`inline-block max-w-[75%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                                message.role === 'user'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-neutral-900'
                            }`}
                        >
                            {message.text}
                        </span>
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-200 px-4 py-4">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={2}
                    className="w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-green-200"
                    placeholder={labels.placeholder}
                    disabled={loading}
                />
                <button
                    type="button"
                    onClick={() => send()}
                    disabled={loading || !input.trim()}
                    className="mt-2 w-full rounded bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                    {loading ? labels.sending : labels.send}
                </button>
            </div>
        </div>
    );
}

export default Chatbot;
