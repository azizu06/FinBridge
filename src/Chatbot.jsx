import { useState, useRef } from 'react';

function Chatbot() {
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! How can I assist you today?' }
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
        <div className="p-4">
            <div className="border rounded p-4 h-96 overflow-y-auto" ref={listRef}>
                {messages.map((message, index) => (
                    <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : ''}`}>
                        <span className={`inline-block p-2 rounded ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                            {message.text}
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="border rounded p-2 w-full"
                    placeholder="Type your message..."
                />
            </div>
        </div>
    );
}

export default Chatbot;