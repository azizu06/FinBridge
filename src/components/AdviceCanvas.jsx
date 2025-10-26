import { useEffect, useState } from 'react';
import SummaryCard from './SummaryCard.jsx';
import KpiStrip from './KpiStrip.jsx';
import ExpenseBarChart from './ExpenseBarChart.jsx';
import TransactionTable from './TransactionTable.jsx';
import ActionChips from './ActionChips.jsx';
import GeneratedImage from './GeneratedImage.jsx';

const API_BASE_URL =
    (import.meta.env.VITE_BACKEND_URL &&
        import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')) ||
    'http://localhost:5001/api';

function useIllustration(prompt) {
    const [state, setState] = useState({
        url: '',
        loading: false,
        error: '',
    });

    useEffect(() => {
        if (!prompt) {
            setState({ url: '', loading: false, error: '' });
            return;
        }

        let cancelled = false;
        setState({ url: '', loading: true, error: '' });

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
                    setState({
                        url: data?.imageUrl || '',
                        loading: false,
                        error: '',
                    });
                }
            } catch (err) {
                if (!cancelled) {
                    setState({
                        url: '',
                        loading: false,
                        error:
                            err?.message || 'Unable to create illustration right now.',
                    });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [prompt]);

    return state;
}

export default function AdviceCanvas({
    insights,
    loading,
    error,
    onActionSelect,
}) {
    const hasInsights = Boolean(insights);
    const imageState = useIllustration(insights?.imagePrompt);

    return (
        <section className="flex flex-col gap-4">
            <header>
                <h2 className="text-2xl font-semibold text-neutral-900">
                    Dashboard insights
                </h2>
                <p className="text-sm text-neutral-500">
                    FinBridge turns your conversation into visuals, tables, and next
                    steps tailored to you.
                </p>
            </header>

            {loading && (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                    Loading personalized insights…
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && !hasInsights && (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-6 text-center text-sm text-neutral-500">
                    Ask FinBridge a question in the chat to populate your dashboard.
                </div>
            )}

            {hasInsights ? (
                <>
                    {insights.summary && <SummaryCard summary={insights.summary} />}
                    {insights.kpis && <KpiStrip kpis={insights.kpis} />}
                    {insights.chart && <ExpenseBarChart chart={insights.chart} />}
                    {insights.table && <TransactionTable table={insights.table} />}
                    {insights.actions?.length ? (
                        <ActionChips actions={insights.actions} onSelect={onActionSelect} />
                    ) : null}
                    {insights.imagePrompt ? (
                        <GeneratedImage
                            prompt={insights.imagePrompt}
                            url={imageState.url}
                            loading={imageState.loading}
                            error={imageState.error}
                        />
                    ) : null}
                </>
            ) : null}
        </section>
    );
}

