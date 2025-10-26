export default function SummaryCard({ summary }) {
    if (!summary) return null;

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Overview
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-800">
                {summary}
            </p>
        </div>
    );
}

