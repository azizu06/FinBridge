import { Bar } from 'react-chartjs-2';
import {
    Chart,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const DEFAULT_COLOR = 'rgba(37, 99, 235, 0.7)';

export default function ExpenseBarChart({ chart }) {
    if (!chart?.labels?.length || !chart?.values?.length) {
        return null;
    }

    const data = {
        labels: chart.labels,
        datasets: [
            {
                label: 'Expenses',
                data: chart.values,
                backgroundColor: DEFAULT_COLOR,
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                labels: {
                    font: { size: 12 },
                },
            },
            tooltip: {
                callbacks: {
                    label: (context) =>
                        `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
            },
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(209, 213, 219, 0.4)' },
                ticks: {
                    callback: (value) => value.toLocaleString(),
                },
            },
        },
    };

    return (
        <div className="my-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
            <h3 className="text-sm font-medium text-neutral-500">
                Spending by category
            </h3>
            <div className="mt-3 h-56">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}

