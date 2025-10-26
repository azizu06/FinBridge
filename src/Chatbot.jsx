import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from './context/LocaleContext.jsx';
import {
    LANGUAGE_OPTIONS,
    CULTURE_OPTIONS,
} from './config/options.js';

const API_BASE_URL =
    (import.meta.env.VITE_BACKEND_URL &&
        import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')) ||
    'http://localhost:5001/api';

function Chatbot({
    onGenerateAdvice,
    queuedPrompt,
    onPromptConsumed,
    className = '',
}) {
    const { language, setLanguage, culture, setCulture } = useLocale();
    const { t } = useTranslation('chatbot');
    const [messages, setMessages] = useState(() => [
        { role: 'model', text: t('initialMessage') },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const listRef = useRef(null);

    useEffect(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        const initialText = t('initialMessage');
        setMessages((prev) => {
            if (prev.length === 1 && prev[0]?.role === 'model') {
                return [{ role: 'model', text: initialText }];
            }
            return prev;
        });
    }, [t]);

    const cultureContextKey = useCallback(() => {
        const option = CULTURE_OPTIONS.find((item) => item.code === culture);
        return option?.contextKey || 'American';
    }, [culture]);

    const send = useCallback(
        async (overrideText, displayOverride) => {
            const outbound = (overrideText ?? input).trim();
            const display = (displayOverride ?? outbound).trim();
            if (!outbound || loading) return;

            setMessages((prev) => [
                ...prev,
                { role: 'user', text: display },
                { role: 'model', text: t('loadingMessage') },
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
                    culture: cultureContextKey(),
                });

                const reply = data?.reply || t('fallbackModelReply');

                setMessages((prev) => [
                    ...prev.slice(0, prev.length - 1),
                    { role: 'model', text: reply },
                ]);
            } catch (err) {
                console.error('Advice fetch failed:', err);
                setError(t('errorMessage'));
                setMessages((prev) => [
                    ...prev.slice(0, prev.length - 1),
                    { role: 'model', text: t('errorMessage') },
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
            cultureContextKey,
            t,
        ]
    );

    useEffect(() => {
        if (!queuedPrompt) return;
        const payload =
            typeof queuedPrompt === 'string'
                ? { send: queuedPrompt, display: queuedPrompt }
                : queuedPrompt;
        const sendText = payload?.send?.trim?.() ?? '';
        const displayText = payload?.display?.trim?.() ?? sendText;

        if (!sendText || loading) {
            onPromptConsumed?.();
            return;
        }

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
                    {t('title')}
                </h2>
                <p className="text-sm text-neutral-500">{t('subtitle')}</p>
                <div className="mt-3 flex gap-2">
                    <select
                        className="flex-1 rounded border px-2 py-1 text-sm"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
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
                        onChange={(e) => setCulture(e.target.value)}
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
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            send();
                        }
                    }}
                    rows={2}
                    className="w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-green-200"
                    placeholder={t('placeholder')}
                    disabled={loading}
                />
                <button
                    type="button"
                    onClick={() => send()}
                    disabled={loading || !input.trim()}
                    className="mt-2 w-full rounded bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                    {loading ? t('sending') : t('send')}
                </button>
            </div>
        </div>
    );
}

export default Chatbot;
