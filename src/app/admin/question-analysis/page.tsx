'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuestionStat {
    questionId: number;
    questionText: string;
    totalAttempts: number;
    correctAttempts: number;
    incorrectAttempts: number;
    successRate: number;
    category: string;
}

interface CategoryStat {
    category: string;
    totalAttempts: number;
    correctAttempts: number;
    successRate: number;
}

interface AnalysisData {
    overview: {
        totalQuestions: number;
        totalAttempts: number;
        totalCorrect: number;
        totalIncorrect: number;
        overallSuccessRate: number;
        totalSubmissions: number;
    };
    hardestQuestions: QuestionStat[];
    easiestQuestions: QuestionStat[];
    mostAttempted: QuestionStat[];
    categoryStats: CategoryStat[];
    allQuestions: QuestionStat[];
}

export default function QuestionAnalysisPage() {
    const router = useRouter();
    const [data, setData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'hardest' | 'easiest' | 'most-attempted' | 'all'>('hardest');

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const fetchAnalysis = async () => {
        try {
            const response = await fetch('/api/admin/question-analysis');
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading analysis...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-600">No data available</p>
            </div>
        );
    }

    const getSuccessRateColor = (rate: number) => {
        if (rate >= 80) return 'text-green-600 bg-green-50';
        if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
        if (rate >= 40) return 'text-orange-600 bg-orange-50';
        return 'text-red-600 bg-red-50';
    };

    const getSuccessRateBadge = (rate: number) => {
        if (rate >= 80) return '✅ Easy';
        if (rate >= 60) return '⚠️ Moderate';
        if (rate >= 40) return '🔶 Challenging';
        return '❌ Hard';
    };

    const renderQuestionList = (questions: QuestionStat[], title: string) => (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
            <div className="space-y-3">
                {questions.map((q, idx) => (
                    <div key={q.questionId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-gray-500">#{idx + 1}</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                        {q.category}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSuccessRateColor(q.successRate)}`}>
                                        {getSuccessRateBadge(q.successRate)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-800 font-medium">{q.questionText}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Attempts:</span>
                                <span className="text-sm font-bold text-gray-900">{q.totalAttempts}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Correct:</span>
                                <span className="text-sm font-bold text-green-600">{q.correctAttempts}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Wrong:</span>
                                <span className="text-sm font-bold text-red-600">{q.incorrectAttempts}</span>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-xs text-gray-500">Success Rate:</span>
                                <span className={`text-lg font-black ${getSuccessRateColor(q.successRate)}`}>
                                    {q.successRate}%
                                </span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${q.successRate >= 60 ? 'bg-green-500' : q.successRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${q.successRate}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/admin')}
                        className="mb-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                    >
                        ← Back to Admin
                    </button>
                    <h1 className="text-3xl font-black text-gray-900">📊 Question Analysis Dashboard</h1>
                    <p className="text-gray-600 mt-1">Detailed insights into question performance and difficulty</p>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <p className="text-xs text-gray-500 mb-1">Total Questions</p>
                        <p className="text-2xl font-black text-gray-900">{data.overview.totalQuestions}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <p className="text-xs text-gray-500 mb-1">Total Attempts</p>
                        <p className="text-2xl font-black text-blue-600">{data.overview.totalAttempts}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <p className="text-xs text-gray-500 mb-1">Correct Answers</p>
                        <p className="text-2xl font-black text-green-600">{data.overview.totalCorrect}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <p className="text-xs text-gray-500 mb-1">Wrong Answers</p>
                        <p className="text-2xl font-black text-red-600">{data.overview.totalIncorrect}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                        <p className="text-2xl font-black text-purple-600">{data.overview.overallSuccessRate}%</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <p className="text-xs text-gray-500 mb-1">Submissions</p>
                        <p className="text-2xl font-black text-gray-900">{data.overview.totalSubmissions}</p>
                    </div>
                </div>

                {/* Category Stats */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">📚 Category-wise Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {data.categoryStats.map(cat => (
                            <div key={cat.category} className="border border-gray-200 rounded-lg p-4">
                                <p className="text-sm font-bold text-gray-900 mb-2">{cat.category}</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Attempts:</span>
                                        <span className="font-bold">{cat.totalAttempts}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Correct:</span>
                                        <span className="font-bold text-green-600">{cat.correctAttempts}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Success:</span>
                                        <span className={`font-bold ${getSuccessRateColor(cat.successRate)}`}>
                                            {cat.successRate}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('hardest')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'hardest'
                                ? 'bg-red-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        ❌ Hardest Questions ({data.hardestQuestions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('easiest')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'easiest'
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        ✅ Easiest Questions ({data.easiestQuestions.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('most-attempted')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'most-attempted'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        🔥 Most Attempted ({data.mostAttempted.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${activeTab === 'all'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        📋 All Questions ({data.allQuestions.length})
                    </button>
                </div>

                {/* Question Lists */}
                {activeTab === 'hardest' && renderQuestionList(data.hardestQuestions, '❌ Top 10 Hardest Questions')}
                {activeTab === 'easiest' && renderQuestionList(data.easiestQuestions, '✅ Top 10 Easiest Questions')}
                {activeTab === 'most-attempted' && renderQuestionList(data.mostAttempted, '🔥 Top 10 Most Attempted Questions')}
                {activeTab === 'all' && renderQuestionList(data.allQuestions, '📋 All Questions (Sorted by Attempts)')}
            </div>
        </div>
    );
}
