export default function KpiStrip({ kpis }) {
    if (!kpis) return null;

    const { income = 0, expenses = 0, savings = 0, currency = "USD" } = kpis;

    const format = (value) =>
        typeof value === "number"
            ? value.toLocaleString(undefined, {
                  maximumFractionDigits: value % 1 === 0 ? 0 : 2,
              })
            : value || 0;

    const cards = [
        { label: "Income", value: income },
        { label: "Expenses", value: expenses },
        { label: "Savings", value: savings },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
            {cards.map(({ label, value }) => (
                <div
                    key={label}
                    className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
                >
                    <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                        {label}
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-neutral-900">
                        {currency} {format(value)}
                    </div>
                </div>
            ))}
        </div>
    );
}

