import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import KpiStrip from './components/KpiStrip.jsx';
import ExpenseBarChart from './components/ExpenseBarChart.jsx';
import TransactionTable from './components/TransactionTable.jsx';
import ActionChips from './components/ActionChips.jsx';
import GeneratedImage from './components/GeneratedImage.jsx';
import SummaryCard from './components/SummaryCard.jsx';

const API_BASE_URL =
    (import.meta.env.VITE_BACKEND_URL &&
        import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')) ||
    'http://localhost:5001/api';

const CULTURE_OPTIONS = [
    'American',
    'Spanish',
    'Uzbek',
    'Indian',
    'Haitian',
    'Chinese',
    'Nigerian',
    'Japanese',
];

const SUPPORTED_LANGUAGES = new Set(['en', 'es']);

const normalizeLanguage = (value) => {
    if (!value) return undefined;
    const base = value.split('-')[0];
    return SUPPORTED_LANGUAGES.has(base) ? base : undefined;
};

function Chatbot() {
    const { t, i18n } = useTranslation('chatbot');
    const [messages, setMessages] = useState([
        { role: 'model', text: t('initialMessage') },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [language, setLanguage] = useState(
        normalizeLanguage(i18n.language) || 'en'
    );
    const [culture, setCulture] = useState('American');
    const [insights, setInsights] = useState(null);
    const [imageState, setImageState] = useState({
        url: '',
        loading: false,
        error: '',
    });
    const listRef = useRef(null);

    useEffect(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        const current = normalizeLanguage(i18n.language);
        if (current && current !== language) {
            setLanguage(current);
        }
    }, [i18n.language, language]);

    const send = async (overrideText) => {
        const trimmed = input.trim();
        const outbound = overrideText?.trim?.() || trimmed;
        if (!outbound || loading) return;

        const pending = [
            ...messages,
            { role: 'user', text: outbound },
            { role: 'model', text: t('loadingMessage') },
        ];
        setMessages(pending);
        if (!overrideText) {
            setInput('');
        }
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/advice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: outbound,
                    language,
                    culture,
                }),
            });

            if (!res.ok) {
                const payload = await res.json().catch(() => ({}));
                throw new Error(payload?.error || `Request failed (${res.status})`);
            }

            const data = await res.json();
            const reply = data?.reply || t('fallbackModelReply');

            setMessages((prev) => [
                ...prev.slice(0, prev.length - 1),
                { role: 'model', text: reply },
            ]);
            if (data?.ui) {
            setInsights(data.ui);
            const nextPrompt = data?.ui?.imagePrompt || '';
            if (!nextPrompt) {
                setImageState({ url: '', loading: false, error: '' });
            }
        }
        } catch (err) {
            console.error('Advice fetch failed:', err);
            setError(err.message || 'Unable to reach FinBridge right now.');
            setMessages((prev) => [
                ...prev.slice(0, prev.length - 1),
                { role: 'model', text: t('errorMessage') },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            send();
        }
    };

    const handleActionChip = (action) => {
        if (!action?.label) return;
        setInput(action.label);
        send(action.label);
    };

    useEffect(() => {
        const prompt = insights?.imagePrompt;
        if (!prompt) {
            setImageState({ url: '', loading: false, error: '' });
            return;
        }

        let cancelled = false;
        setImageState({ url: '', loading: true, error: '' });

        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/image`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt }),
                });

                if (!res.ok) {
                    const payload = await res.json().catch(() => ({}));
                    throw new Error(
                        payload?.error || `Image request failed (${res.status})`
                    );
                }

                const data = await res.json();
                if (!cancelled) {
                    setImageState({
                        url: data?.imageUrl || '',
                        loading: false,
                        error: '',
                    });
                }
            } catch (err) {
                if (!cancelled) {
                    setImageState({
                        url: '',
                        loading: false,
                        error: err.message || 'Unable to create illustration.',
                    });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [insights?.imagePrompt]);

    return (
        <div>
            <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-96 bg-white shadow-lg border-l border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-neutral-900">
                        {t('title')}
                    </h2>
                    <p className="text-sm text-neutral-500">{t('subtitle')}</p>
                    <div className="mt-3 flex gap-2">
                        <select
                            className="flex-1 border rounded px-2 py-1 text-sm"
                            value={language}
                            onChange={(e) => {
                                const next = e.target.value;
                                setLanguage(next);
                                if (next && next !== i18n.language) {
                                    i18n.changeLanguage(next);
                                }
                            }}
                        >
                            <option value="en">{t('language.english')}</option>
                            <option value="es">{t('language.spanish')}</option>
                        </select>
                        <select
                            className="flex-1 border rounded px-2 py-1 text-sm"
                            value={culture}
                            onChange={(e) => setCulture(e.target.value)}
                        >
                            {CULTURE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {t(`culture.${option.toLowerCase()}`, option)}
                                </option>
                            ))}
                        </select>
                    </div>
                    {error && (
                        <p className="mt-2 text-xs text-red-600">{error}</p>
                    )}
                </div>
                {insights?.summary && (
                    <div className="border-b border-gray-200 px-4 pb-1">
                        <SummaryCard summary={insights.summary} />
                    </div>
                )}
                {insights?.kpis && (
                    <div className="border-b border-gray-200 px-4 pb-1">
                        <KpiStrip kpis={insights.kpis} />
                    </div>
                )}
                {insights?.chart && (
                    <div className="border-b border-gray-200 px-4 pb-1">
                        <ExpenseBarChart chart={insights.chart} />
                    </div>
                )}
                {insights?.table && (
                    <div className="border-b border-gray-200 px-4 pb-1">
                        <TransactionTable table={insights.table} />
                    </div>
                )}
                {insights?.actions?.length ? (
                    <div className="border-b border-gray-200 px-4 pb-1">
                        <ActionChips
                            actions={insights.actions}
                            onSelect={handleActionChip}
                        />
                    </div>
                ) : null}
                {insights?.imagePrompt ? (
                    <div className="border-b border-gray-200 px-4 pb-3">
                        <GeneratedImage
                            prompt={insights.imagePrompt}
                            url={imageState.url}
                            loading={imageState.loading}
                            error={imageState.error}
                        />
                    </div>
                ) : null}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={listRef}>
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
                <div className="p-4 border-t border-gray-200">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        rows={2}
                        className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring focus:ring-green-200"
                        placeholder={t('placeholder')}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={send}
                        disabled={loading || !input.trim()}
                        className="mt-2 w-full rounded bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                    >
                        {loading ? t('sending') : t('send')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chatbot;
