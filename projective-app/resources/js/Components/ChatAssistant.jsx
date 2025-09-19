import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, X, Send, Loader, Bot, User } from "lucide-react";

export default function ChatAssistant({ projectId, projectName = "Project", boardTasks }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const send = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput('');
        setLoading(true);

        // Prepare board data as a string for Gemini context
        let boardDataString = '';
        if (boardTasks) {
            // Flatten and format tasks for context
            const allTasks = Object.entries(boardTasks).flatMap(([status, tasks]) =>
                tasks.map(task => `- [${status}] ${task.title}${task.assignedUser ? ` (Assigned: ${task.assignedUser.name})` : ''}${task.due_date ? ` (Due: ${task.due_date})` : ''}`)
            );
            if (allTasks.length > 0) {
                boardDataString = `Board Tasks:\n${allTasks.join('\n')}`;
            }
        }

        try {
            const res = await axios.post('/assistant/query', {
                prompt: currentInput,
                boardData: boardDataString,
            });

            let answer = res.data.answer;
            // If answer is an object with error, show error message
            if (typeof answer === 'object' && answer !== null && answer.error) {
                let errorMsg = `Error: ${answer.message || 'Unknown error.'}`;
                if (answer.status) errorMsg += `\nStatus: ${answer.status}`;
                if (answer.body) errorMsg += `\nBody: ${answer.body}`;
                if (answer.url) errorMsg += `\nURL: ${answer.url}`;
                if (answer.model) errorMsg += `\nModel: ${answer.model}`;
                if (answer.apiKeyStartsWith) errorMsg += `\nAPI Key Starts With: ${answer.apiKeyStartsWith}`;
                if (answer.trace) errorMsg += `\nTrace: ${answer.trace}`;
                answer = errorMsg;
            }

            const assistantMsg = {
                role: 'assistant',
                text: answer || 'I apologize, but I could not process your request.'
            };
            setMessages(prev => [...prev, assistantMsg]);

        } catch (err) {
            console.error('Assistant API Error:', err);
            let errorMessage = 'I encountered an error. Please try again.';
            if (err.response?.status === 401) {
                errorMessage = 'Authentication expired. Please refresh the page and try again.';
            } else if (err.response?.status === 403) {
                errorMessage = 'You do not have access to this project.';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            setMessages(prev => [...prev, {
                role: 'assistant',
                text: errorMessage
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const clearChat = () => {
        setMessages([]);
    };

    const quickQuestions = [
        "What tasks do I have in progress?",
        "What do I have in QA?",
        "What's our project status?",
        "Are there any overdue tasks?",
        "Who is working on what?"
    ];

    const askQuickQuestion = (question) => {
        setInput(question);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-200 z-50"
                title="AI Assistant"
            >
                <MessageSquare size={24} />
            </button>

            {/* Chat Window */}
            {open && (
                <div className="fixed bottom-20 right-6 w-96 h-[70vh] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
                    
                    {/* Header */}
                    <div className="p-4 bg-indigo-600 text-white rounded-t-lg flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot size={20} />
                            <div>
                                <h3 className="font-semibold">AI Assistant</h3>
                                <p className="text-xs opacity-90">{projectName}</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={clearChat}
                                className="p-1 hover:bg-indigo-700 rounded text-xs"
                                title="Clear chat"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 hover:bg-indigo-700 rounded"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                        {/* Remove projectId check, always show chat */}
                        <>
                            {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Bot size={16} className="text-indigo-600" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed ${
                                                msg.role === 'user'
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white border border-gray-200 text-gray-800'
                                            }`}
                                        >
                                            <pre className="whitespace-pre-wrap font-sans">
                                                {msg.text}
                                            </pre>
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User size={16} className="text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                            ))}

                            {loading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <Loader size={16} className="text-indigo-600 animate-spin" />
                                    </div>
                                    <div className="bg-white border border-gray-200 p-3 rounded-lg text-sm text-gray-600">
                                        Thinking...
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </>
                    </div>

                    {/* Quick Questions */}
                    {messages.length <= 1 && (
                        <div className="p-3 border-t border-gray-200 bg-white">
                            <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
                            <div className="flex flex-wrap gap-1">
                                {quickQuestions.map((question, i) => (
                                    <button
                                        key={i}
                                        onClick={() => askQuickQuestion(question)}
                                        className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                        <div className="flex gap-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={projectId ? "Ask me about your project..." : "Select a project first"}
                                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                rows="1"
                                disabled={loading}
                                style={{ minHeight: '38px', maxHeight: '100px' }}
                            />
                            <button
                                onClick={send}
                                disabled={loading || !projectId || !input.trim()}
                                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                            >
                                {loading ? (
                                    <Loader size={16} className="animate-spin" />
                                ) : (
                                    <Send size={16} />
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Press Enter to send • AI responses may take a moment
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}