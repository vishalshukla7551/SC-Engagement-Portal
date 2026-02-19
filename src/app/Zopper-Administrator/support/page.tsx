'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';

interface Message {
    id: string;
    message: string;
    isFromAdmin: boolean;
    adminName?: string;
    sentAt: string;
}

interface Query {
    id: string;
    queryNumber: string;
    category: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
    messages: Message[];
    submittedAt: string;
    lastUpdatedAt?: string;
    secUser: {
        fullName: string;
        phone: string;
        storeId?: string;
    };
}

export default function AdminSupportPage() {
    const [queries, setQueries] = useState<Query[]>([]);
    const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Auto-refresh interval
    const refreshInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchQueries();
        refreshInterval.current = setInterval(fetchQueries, 10000); // 10s polling
        return () => {
            if (refreshInterval.current) clearInterval(refreshInterval.current);
        };
    }, []);

    const fetchQueries = async () => {
        try {
            const res = await fetch('/api/zopper-admin/support/all-queries');
            const data = await res.json();
            if (Array.isArray(data)) {
                setQueries(data);
            }
        } catch (error) {
            console.error('Failed to fetch queries', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendReply = async () => {
        if (!reply.trim() || !selectedQueryId) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/support/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    queryId: selectedQueryId,
                    message: reply,
                    isFromAdmin: true,
                    adminName: 'Zopper Admin'
                })
            });

            if (res.ok) {
                setReply('');
                fetchQueries(); // Refresh immediately
                toast.success('Reply sent');
            } else {
                toast.error('Failed to send reply');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setIsSending(false);
        }
    };

    const activeQuery = queries.find(q => q.id === selectedQueryId);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading support portal...</div>;

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden font-sans">
            <Toaster />

            {/* Sidebar List */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col z-10">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900">Support Inbox</h1>
                    <div className="flex gap-2 mt-4 text-sm">
                        <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-medium">
                            Open ({queries.filter(q => q.status !== 'RESOLVED').length})
                        </span>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                            Resolved ({queries.filter(q => q.status === 'RESOLVED').length})
                        </span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {queries.map((query) => (
                        <div
                            key={query.id}
                            onClick={() => setSelectedQueryId(query.id)}
                            className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${selectedQueryId === query.id ? 'bg-rose-50 border-l-4 border-l-rose-500' : 'border-l-4 border-l-transparent'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-gray-900">{query.secUser?.fullName || 'Unknown User'}</span>
                                <span className="text-xs text-gray-400">
                                    {new Date(query.lastUpdatedAt || query.submittedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    {query.queryNumber}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${query.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {query.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{query.description}</p>
                        </div>
                    ))}
                    {queries.length === 0 && (
                        <div className="p-8 text-center text-gray-400">No queries found.</div>
                    )}
                </div>
            </div>

            {/* Chat Detail View */}
            <div className="flex-1 flex flex-col bg-slate-50 relative">
                {activeQuery ? (
                    <>
                        <div className="p-6 bg-white border-b border-gray-200 shadow-sm z-20">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                        {activeQuery.category.replace(/_/g, ' ')}
                                        <span className="text-sm px-3 py-1 bg-gray-100 rounded-full font-normal text-gray-500">
                                            {activeQuery.queryNumber}
                                        </span>
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        User: {activeQuery.secUser?.fullName} ({activeQuery.secUser?.phone})
                                    </p>
                                </div>
                                <div className={`px-4 py-2 rounded-lg font-bold text-sm ${activeQuery.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {activeQuery.status}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {/* Initial user message */}
                            <div className="flex justify-start">
                                <div className="max-w-[70%] bg-white p-5 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm">
                                    <p className="text-xs font-bold text-rose-500 mb-1">
                                        {activeQuery.secUser?.fullName}
                                    </p>
                                    <p className="text-gray-800 whitespace-pre-wrap">{activeQuery.description}</p>
                                    <p className="text-[10px] text-gray-400 mt-2">
                                        {new Date(activeQuery.submittedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {activeQuery.messages.slice(1).map((msg) => (
                                <div key={msg.id} className={`flex ${msg.isFromAdmin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${msg.isFromAdmin
                                        ? 'bg-rose-600 text-white rounded-tr-sm'
                                        : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                        <p className={`text-[10px] mt-2 text-right ${msg.isFromAdmin ? 'text-white/70' : 'text-gray-400'}`}>
                                            {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {activeQuery.status !== 'RESOLVED' && (
                            <div className="p-4 bg-white border-t border-gray-200">
                                <div className="flex gap-4">
                                    <textarea
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        placeholder="Type your reply..."
                                        rows={1}
                                        className="flex-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 outline-none"
                                    />
                                    <button
                                        onClick={handleSendReply}
                                        disabled={isSending || !reply.trim()}
                                        className="px-6 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 disabled:opacity-50"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-4">
                        <span className="text-4xl">💬</span>
                        <p>Select a ticket to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
