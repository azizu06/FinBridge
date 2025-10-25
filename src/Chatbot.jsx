
import { useRef, useState } from "react";

function Chatbot(){

    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! How can I assist you today?' }
    ]);

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const listRef = useRef(null);

    const toGeminiHistory = () =>
        messages
            .filter(m => m.role === 'user' || m.role === 'model')
            .map(m => ({
                role: m.role,
                parts: [{text: m.text}]
    }));

    const send = async () => {
        const trimmed = input.trim();
        if(!trimmed || loading) return;

        const next = [...messages, {role: 'user', text: trimmed}];
        setMessages(next);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    history: toGeminiHistory(),
                    message: trimmed
                })
            });

            const data = await res.json();
            if (data.reply){
                setMessages(m => [...m, {role: 'model', text: data.reply}]);
            } else {
                setMessages(m => [...m, {role: 'model', text: 'Hmm, something went wrong :('}]);
            }
        } catch (e) {
            setMessages(m => [...m, {role: 'model', text: 'Error: ' + e.message}]);
        } finally {
            setLoading(false); 
            setTimeout(() => listRef.current?.scrollTo({top: listRef.current.scrollHeight, behavior: 'smooth'}), 0);
        }

        const onKeyDown = (e) => {
            if(e.key === 'Enter' && !e.shiftKey){
                send();
            }
        }
    }

    return (
        <div className="flex flex-col h-full max-w-md border rounded shadow">
            <header className="flex items-center justify-center p-4 bg-gray-200 font-semibold">
                <div className="size-3 rounded-full bg-black m-3 p-2">
                <h2>FinBridge Friend</h2>
                <span classname="text-xs text-white">{loading? 'thinking' : 'ready'}</span>
                </div>
            </header>

            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`max-w-[85%] rounded-2xl px-4 py-2 leading-relaxed shadow
                        ${m.role === 'user' ? 'ml-auto bg-blue-50' : 'bg-gray-50'}`}
                    >
                        <div className="text-xs mb-1 text-gray-50">{m.role === 'user' ? 'You' : 'Friend'}</div>
                        <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                </div>
                ))}
            </div>

            <div className="pt-3 border-t flex gap-2">
                <textarea
                    className="flex-1 resize-none border rounded-xl px-3 py-2 outline-none focus:ring-2"
                    rows={2}
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                />
                <button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    className="px-4 py-2 bg-black text-white rounded-xl disabled:opacity-50"
                > Send </button>
            </div>
        </div>
    );
}

export default Chatbot;