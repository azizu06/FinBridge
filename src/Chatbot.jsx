import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

function Chatbot() {
    const {t} = useTranslation('chatbot');
    const [messages, setMessages] = useState([
        { role: 'model', text: t('initialMessage') }
    ]);

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const listRef = useRef(null);

    const toGeminiHistory = () =>
        messages
            .filter((m) => m.role === 'user' || m.role === 'model')
            .map((m) => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

    const send = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        const next = [...messages, { role: 'user', text: trimmed }];
        setMessages(next);
        setInput('');
        setLoading(true);

        // Simulate a response
        setTimeout(() => {
            setMessages((m) => [
                ...m,
                { role: 'model', text: 'This is a simulated response.' }
            ]);
            setLoading(false);
        }, 1000);
    };

    const onKeyDown = (event) => {
        if (event.key === 'Enter') {
            send(); // Call the send function when Enter is pressed
        }
    };

    return (
        <div >
            <div
                className="fixed top-4rem right-0 h-[calc(100vh-4rem)] w-80 bg-gradient-to-t from-[#F2F2F2] to-white-500 shadow-lg border-l border-gray-300 flex flex-col"
            >
                <div className="flex-1 overflow-y-auto p-4" ref={listRef}>
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`mb-2 ${message.role === 'user' ? 'text-right' : ''}`}
                        >
                            <span
                                className={`inline-block p-2 rounded ${
                                    message.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-300 text-black'
                                }`}
                            >
                                {message.text}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-300">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        className="border rounded p-2 w-full"
                        placeholder={t('placeholder')}
                    />
                </div>
            </div>
        </div>
    );
}

export default Chatbot;