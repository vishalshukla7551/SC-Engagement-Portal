'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import ValentineHeader from '@/components/ValentineHeader';
// import RepublicHeader from '@/components/RepublicHeader';
// import FestiveHeader from '@/components/FestiveHeader';
import SECHeader from '@/app/SEC/SECHeader';
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
    resolvedAt?: string;
}

const CATEGORIES = [
    'TECHNICAL_ISSUE',
    'ACCOUNT_PROBLEM',
    'PAYMENT_INQUIRY',
    'TRAINING_SUPPORT',
    'GENERAL_INQUIRY',
    'BUG_REPORT',
    'FEATURE_REQUEST',
    'OTHER'
];

export default function SupportPage() {
    const [user, setUser] = useState<any>(null);
    const [activeQuery, setActiveQuery] = useState<Query | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [previousQueries, setPreviousQueries] = useState<Query[]>([]);

    // Form State
    const [selectedCategory, setSelectedCategory] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Chat State
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log('Support Page: Loaded User', parsedUser);
                setUser(parsedUser);

                // Use secId (MongoDB ObjectId) instead of id (phone number)
                if (parsedUser.secId) {
                    fetchActiveQuery(parsedUser.secId);
                    fetchQueryHistory(parsedUser.secId);
                } else {
                    console.error('Support Page: User secId is missing in localStorage');
                    setIsLoading(false);
                }
            } catch (e) {
                console.error('Support Page: Failed to parse user', e);
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeQuery) {
            scrollToBottom();
        }
    }, [activeQuery?.messages]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchActiveQuery = async (userId: string) => {
        try {
            console.log('fetchActiveQuery called with userId:', userId, 'Type:', typeof userId, 'Length:', userId?.length);

            // Validate userId before making the request
            if (!userId) {
                console.error('Cannot fetch active query: userId is missing');
                setActiveQuery(null);
                setIsLoading(false);
                return;
            }

            // Validate MongoDB ObjectId format (24-character hex string)
            const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
            if (!isValidObjectId) {
                console.error('Cannot fetch active query: Invalid ObjectId format', {
                    userId,
                    length: userId.length,
                    expected: '24-character hexadecimal string'
                });
                setActiveQuery(null);
                setIsLoading(false);
                // Don't show error to user on initial load, just log it
                return;
            }

            const res = await fetch('/api/sec/support/my-query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secId: userId })
            });

            console.log('fetchActiveQuery response status:', res.status);

            if (res.status === 400) {
                const errData = await res.json();
                console.error('Validation Error in my-query:', {
                    status: res.status,
                    errorData: errData,
                    sentUserId: userId,
                    userIdType: typeof userId,
                    userIdLength: userId?.length
                });
                // Don't toast on load, just log
                setActiveQuery(null);
                return;
            }

            if (!res.ok) {
                console.error('Failed to fetch active query:', res.status, res.statusText);
                setActiveQuery(null);
                return;
            }

            const data = await res.json();
            if (data && data.id) {
                setActiveQuery(data);
            } else {
                setActiveQuery(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchQueryHistory = async (userId: string) => {
        try {
            if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
                return;
            }

            const res = await fetch('/api/sec/support/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secId: userId })
            });

            if (res.ok) {
                const data = await res.json();
                setPreviousQueries(data.queries || []);
            }
        } catch (error) {
            console.error('Error fetching query history:', error);
        }
    };

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || !user.secId) {
            toast.error('Session expired. Please log out and log in again.');
            return;
        }

        if (!selectedCategory || !description) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/sec/support/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secId: user.secId,
                    category: selectedCategory,
                    description
                })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Ticket created successfully!');
                fetchActiveQuery(user.secId);
            } else {
                toast.error(data.error || 'Failed to create ticket');
                if (data.error && data.error.includes('log out')) {
                    // Optional: redirect to logout?
                }
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeQuery) return;

        setIsSending(true);
        try {
            const res = await fetch('/api/support/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    queryId: activeQuery.id,
                    message: newMessage,
                    isFromAdmin: false
                })
            });

            if (res.ok) {
                setNewMessage('');
                // Refresh messages
                if (user?.secId) fetchActiveQuery(user.secId);
            } else {
                toast.error('Failed to send message');
            }
        } catch (error) {
            toast.error('Network error');
        } finally {
            setIsSending(false);
        }
    };

    const handleCloseTicket = async () => {
        // Removed confirmation dialog - close ticket directly
        console.log('Closing ticket:', {
            activeQueryId: activeQuery?.id,
            type: typeof activeQuery?.id,
            length: activeQuery?.id?.length
        });

        try {
            const res = await fetch('/api/sec/support/close', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ queryId: activeQuery?.id })
            });

            console.log('Close ticket response:', { status: res.status, ok: res.ok });

            if (res.ok) {
                toast.success('Ticket closed successfully!');
                setActiveQuery(null);
                setSelectedCategory('');
                setDescription('');
            } else {
                const errorData = await res.json();
                console.error('Failed to close ticket:', { status: res.status, errorData });
                toast.error(errorData.error || 'Failed to close ticket');
            }
        } catch (error) {
            console.error('Error closing ticket:', error);
            toast.error('Network error');
        }
    };

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">Loading...</div>;

    // Check if user has secId (valid session for support)
    if (user && !user.secId) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans pb-20">
                {/* <ValentineHeader userName={user?.fullName || 'User'} /> */}
                {/* <ValentineHeader userName={user?.fullName || 'User'} /> */}
                {/* <FestiveHeader userName={user?.fullName || 'User'} /> */}
                {/* <RepublicHeader userName={user?.fullName || 'User'} /> */}
                <SECHeader />
                <Toaster position="top-right" />
                <main className="max-w-4xl mx-auto px-4 -mt-6 relative z-40">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-white/50">
                        <div className="text-6xl mb-6">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Session Update Required</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            We've updated our support system. To create tickets, please update your session by logging out and logging back in.
                        </p>
                        <button
                            onClick={() => {
                                localStorage.removeItem('authUser');
                                window.location.href = '/login/sec';
                            }}
                            className="px-8 py-3 bg-black text-white rounded-xl font-bold shadow-lg shadow-black/30 hover:bg-gray-800 transition-all transform hover:-translate-y-1"
                        >
                            Log Out & Update
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* <ValentineHeader userName={user?.fullName || 'User'} /> */}
            {/* <FestiveHeader userName={user?.fullName || 'User'} /> */}
            {/* <RepublicHeader userName={user?.fullName || 'User'} /> */}
            <SECHeader />
            <Toaster position="top-right" />

            <main className="max-w-4xl mx-auto px-4 -mt-6 relative z-40">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50">

                    {!activeQuery ? (
                        // CREATE TICKET VIEW
                        <div className="p-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">Need Help?</h1>
                                <p className="text-gray-500 mb-8">Submit a query and our team will get back to you shortly.</p>

                                <form onSubmit={handleCreateTicket} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
                                        <div className="relative">
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all appearance-none"
                                            >
                                                <option value="">Select an issue...</option>
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={5}
                                            placeholder="Please describe your problem in detail..."
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg shadow-lg shadow-black/30 hover:shadow-black/50 transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    ) : (
                        // ACTIVE QUERY CHAT VIEW
                        <div className="flex flex-col h-[600px]">
                            {/* Chat Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold tracking-wider">
                                            {activeQuery.queryNumber}
                                        </span>
                                        <span className="text-sm text-gray-500 font-medium">
                                            {activeQuery.category.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Started on {new Date(activeQuery.submittedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseTicket}
                                    className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium border border-red-100"
                                >
                                    Close Ticket
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                                {/* Original Description as First Message */}
                                <div className="flex justify-end">
                                    <div className="max-w-[80%] bg-black text-white rounded-2xl rounded-tr-sm p-4 shadow-md">
                                        <p className="text-sm">{activeQuery.description}</p>
                                        <p className="text-[10px] text-white/70 mt-2 text-right">
                                            {new Date(activeQuery.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                {activeQuery.messages.slice(1).map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.isFromAdmin ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.isFromAdmin
                                            ? 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'
                                            : 'bg-black text-white rounded-tr-sm'
                                            }`}>
                                            {msg.isFromAdmin && (
                                                <p className="text-xs font-bold text-gray-600 mb-1">
                                                    Support Team
                                                </p>
                                            )}
                                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                            <p className={`text-[10px] mt-2 text-right ${msg.isFromAdmin ? 'text-gray-400' : 'text-white/70'}`}>
                                                {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-gray-100">
                                <div className="flex gap-4">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        placeholder="Type your reply..."
                                        rows={1}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-black focus:ring-2 focus:ring-gray-200 outline-none transition-all resize-none"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isSending || !newMessage.trim()}
                                        className="px-6 bg-black text-white rounded-xl font-bold shadow-lg shadow-black/30 hover:bg-gray-800 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[60px]"
                                    >
                                        {isSending ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            '➤'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Previous Queries Section */}
                {!activeQuery && previousQueries.length > 0 && (
                    <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Previous Queries</h2>
                        <div className="space-y-4">
                            {previousQueries.map((query) => (
                                <motion.div
                                    key={query.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-gray-400 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold tracking-wider">
                                                {query.queryNumber}
                                            </span>
                                            <span className="text-sm text-gray-500 font-medium">
                                                {query.category.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold">
                                            RESOLVED
                                        </span>
                                    </div>
                                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                                        {query.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span>Submitted: {new Date(query.submittedAt).toLocaleDateString()}</span>
                                        {query.resolvedAt && (
                                            <span>Resolved: {new Date(query.resolvedAt).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
