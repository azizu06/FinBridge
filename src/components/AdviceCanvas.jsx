import SummaryCard from './SummaryCard.jsx';
import KpiStrip from './KpiStrip.jsx';
import ExpenseBarChart from './ExpenseBarChart.jsx';
import TransactionTable from './TransactionTable.jsx';
import ActionChips from './ActionChips.jsx';
import ExpensePieChart from './ExpensePieChart.jsx';

const DEFAULT_STRINGS = {
    title: 'Dashboard insights',
    subtitle:
        'FinBridge turns your conversation into visuals, tables, and next steps tailored to you.',
    loading: 'Loading personalized insights…',
    error: 'Unable to load dashboard insights.',
    empty: 'Ask FinBridge a question in the chat to populate your dashboard.',
};

export default function AdviceCanvas({
    insights,
    loading,
    error,
    onActionSelect,
    strings = DEFAULT_STRINGS,
}) {
    const hasInsights = Boolean(insights);
    const labels = { ...DEFAULT_STRINGS, ...strings };

    return (
        <section className="flex flex-col gap-4">
            <header>
                <h2 className="text-2xl font-semibold text-neutral-900">
                    {labels.title}
                </h2>
                <p className="text-sm text-neutral-500">
                    {labels.subtitle}
                </p>
            </header>

            {loading && (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                    {labels.loading}
                </div>
            )}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error || labels.error}
                </div>
            )}

            {!loading && !error && !hasInsights && (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-6 text-center text-sm text-neutral-500">
                    {labels.empty}
                </div>
            )}

            {hasInsights ? (
                <>
                    {insights.summary && <SummaryCard summary={insights.summary} />}
                    {insights.kpis && <KpiStrip kpis={insights.kpis} />}
                    {insights.chart && <ExpenseBarChart chart={insights.chart} />}
                    {insights.pie && <ExpensePieChart data={insights.pie} />}
                    {insights.table && <TransactionTable table={insights.table} />}
                    {insights.actions?.length ? (
                        <ActionChips actions={insights.actions} onSelect={onActionSelect} />
                    ) : null}
                </>
            ) : null}
        </section>
    );
}
