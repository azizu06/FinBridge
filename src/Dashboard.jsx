import { useCallback, useState } from 'react';
import Chatbot from './Chatbot.jsx';
import AdviceCanvas from './components/AdviceCanvas.jsx';

const API_BASE_URL =
    (import.meta.env.VITE_BACKEND_URL &&
        import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '')) ||
    'http://localhost:5001/api';

function Dashboard() {
    const [insights, setInsights] = useState(null);
    const [canvasLoading, setCanvasLoading] = useState(false);
    const [canvasError, setCanvasError] = useState('');
    const [queuedPrompt, setQueuedPrompt] = useState('');

    const generateAdvice = useCallback(
        async ({ message, language, culture }) => {
            setCanvasLoading(true);
            setCanvasError('');

            try {
                const res = await fetch(`${API_BASE_URL}/advice`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, language, culture }),
                });

                if (!res.ok) {
                    const payload = await res.json().catch(() => ({}));
                    throw new Error(
                        payload?.error || `Request failed (${res.status})`
                    );
                }

                const data = await res.json();
                setInsights(data?.ui || null);
                return data;
            } catch (error) {
                setCanvasError(
                    error?.message || 'Unable to load dashboard insights.'
                );
                throw error;
            } finally {
                setCanvasLoading(false);
            }
        },
        []
    );

    const handleActionSelect = useCallback((action) => {
        if (!action?.label) return;
        setQueuedPrompt(action.label);
    }, []);

    const clearQueuedPrompt = useCallback(() => {
        setQueuedPrompt('');
    }, []);

    return (
        <div className="flex flex-col gap-6 p-4 lg:flex-row lg:items-start">
            <div className="flex-1">
                <AdviceCanvas
                    insights={insights}
                    loading={canvasLoading}
                    error={canvasError}
                    onActionSelect={handleActionSelect}
                />
            </div>
            <div className="w-full lg:w-[24rem]">
                <Chatbot
                    onGenerateAdvice={generateAdvice}
                    queuedPrompt={queuedPrompt}
                    onPromptConsumed={clearQueuedPrompt}
                    className="lg:sticky lg:top-16"
                />
            </div>
        </div>
    );
}

export default Dashboard;
