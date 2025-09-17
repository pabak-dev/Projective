import React, { useState } from 'react';
import axios from 'axios';
import { MessageSquare } from "lucide-react";

export default function ChatAssistant({ projectId }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const send = async () => {
    if (!input.trim() || !projectId) {
        console.error("Project ID is missing. Cannot send request.");
        return;
    }

    // 1. Get the token from where you store it after login
    // This is a common way to retrieve it from localStorage:
    const token = localStorage.getItem('auth_token'); // Or use your auth context

    if (!token) {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Please log in again.' }]);
        return;
    }

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        // It's good practice to get a fresh CSRF cookie for state-changing requests
        await axios.get('/sanctum/csrf-cookie');

        // 2. Make the POST request with the Authorization header
        const res = await axios.post('/api/assistant/query', {
            project_id: projectId,
            prompt: input,
        }, {
            headers: {
                'Authorization': `Bearer ${token}` // <-- THIS IS THE CRITICAL ADDITION
            }
        });

        const ai = {
            role: 'assistant',
            text: res.data.answer || 'No answer',
            tasks: res.data.tasks || [],
        };

        setMessages(prev => [...prev, ai]);
    } catch (err) {
        console.error(err);
        // 3. Provide a more helpful error message based on the response status
        let errorMessage = 'Failed to contact assistant.';
        if (err.response?.status === 401) {
            errorMessage = 'Please log in again.';
        } else if (err.response?.status === 405) {
            errorMessage = 'Method not allowed. Check your server setup.'; // This was your original error
        } else if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
        }
        setMessages(prev => [...prev, { role: 'assistant', text: errorMessage }]);
    } finally {
        setLoading(false);
    }
};

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-4 right-4 p-4 rounded-full bg-indigo-600 text-white shadow-lg z-50 hover:bg-indigo-700"
            >
                <MessageSquare size={24} />
            </button>
            {open && (
                <div className="fixed bottom-20 right-4 w-96 h-[60vh] bg-white rounded-lg shadow-xl flex flex-col z-50">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-bold">AI Assistant</h2>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {messages.length === 0 && (
                            <div className="flex items-center justify-center h-full text-gray-500 text-sm text-center">
                                {projectId ? (
                                    <p>Hello! How can I help you with your project?</p>
                                ) : (
                                    <p>Please select a project to start the chat assistant.</p>
                                )}
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
                                <div className={`p-2 rounded-lg text-sm max-w-[80%] ${m.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t flex gap-2">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={projectId ? "Ask e.g. What tasks do I have in progress?" : "Select a project first"}
                            className="flex-1 border rounded p-2 text-sm"
                            disabled={!projectId}
                        />
                        <button
                            onClick={send}
                            disabled={loading || !projectId}
                            className="px-3 py-1 bg-indigo-600 text-white rounded disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            {loading ? '...' : 'Send'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}