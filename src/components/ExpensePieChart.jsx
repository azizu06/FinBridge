import { Pie } from 'react-chartjs-2';
import {
    Chart,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

const COLORS = [
    '#2563eb',
    '#16a34a',
    '#f97316',
    '#9333ea',
    '#facc15',
    '#ef4444',
];

export default function ExpensePieChart({ data }) {
    if (!data?.labels?.length || !data?.values?.length) {
        return null;
    }

    const dataset = {
        labels: data.labels,
        datasets: [
            {
                data: data.values,
                backgroundColor: COLORS.slice(0, data.values.length),
                borderWidth: 1,
                borderColor: '#ffffff',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 16,
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value.toLocaleString()}`;
                    },
                },
            },
        },
    };

    return (
        <div className="my-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-500">
                Expense distribution
            </h3>
            <div className="mt-3 h-64">
                <Pie data={dataset} options={options} />
            </div>
        </div>
    );
}

