export default function ActionChips({ actions = [], onSelect }) {
    if (!actions.length) {
        return null;
    }

    const intentStyles = {
        save: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        plan: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        learn: 'border-amber-200 bg-amber-50 text-amber-700',
    };

    const buttonClasses =
        'rounded-full border px-3 py-1 text-sm font-medium transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1';

    return (
        <div className="my-3 flex flex-wrap gap-2">
            {actions.map((action, index) => (
                <button
                    key={`${action.label}-${index}`}
                    type="button"
                    onClick={() => onSelect?.(action)}
                    className={`${buttonClasses} ${
                        intentStyles[action.intent] || intentStyles.plan
                    }`}
                >
                    {action.label}
                </button>
            ))}
        </div>
    );
}

