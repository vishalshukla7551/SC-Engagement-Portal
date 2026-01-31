'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface QuestionStats {
    id: number | string;
    text: string;
    category: string;
    correctAnswer: string;
    attempts: number;
    correct: number;
    incorrect: number;
    accuracy: number;
}

export default function QuestionAnalysisPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ allQuestions: QuestionStats[], top5Hardest: QuestionStats[] } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/question-analysis');
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        if (!data?.allQuestions) return;

        const exportData = data.allQuestions.map(q => ({
            'Question ID': q.id,
            'Category': q.category || 'General',
            'Question Text': q.text,
            'Attempts': q.attempts,
            'Correct Answers': q.correct,
            'Incorrect Answers': q.incorrect,
            'Accuracy (%)': `${q.accuracy}%`,
            'Difficulty': q.accuracy < 60 ? 'Hard' : q.accuracy < 80 ? 'Medium' : 'Easy'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Question Analysis');
        XLSX.writeFile(wb, `Question_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500">Failed to load analysis data.</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => router.push('/Zopper-Administrator/test-results')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors uppercase font-bold text-sm tracking-widest"
                    >
                        <ArrowLeft size={18} /> Back to Results
                    </button>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchData}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-wide"
                        >
                            Refresh ↻
                        </button>
                        <button
                            onClick={exportToExcel}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-200 uppercase tracking-wide"
                        >
                            Export Excel 📊
                        </button>
                    </div>
                </div>

                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Question Analysis</h1>
                    <p className="text-gray-500">Deep dive into question performance and difficulty levels.</p>
                </div>

                {/* Top 5 Hardest Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">🔥 Top 5 Hardest Questions</h2>
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold uppercase">Low Accuracy</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {data.top5Hardest.length > 0 ? (
                            data.top5Hardest.map((q, idx) => (
                                <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 opacity-10 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Rank #{idx + 1}</div>
                                        <div className="text-3xl font-black text-red-500 mb-1">{q.accuracy}%</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Accuracy</div>
                                        <p className="text-sm font-medium text-gray-800 line-clamp-3 leading-relaxed" title={q.text}>{q.text}</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs">
                                        <span className="text-gray-500 font-bold">{q.attempts} Attempts</span>
                                        <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded-full">{q.incorrect} Incorrect</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300">
                                <p className="text-gray-400">Not enough data to determine hardest questions.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* All Questions Table */}
                <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">All Questions Performance</h2>
                        <div className="text-sm text-gray-500 font-medium">Total Questions: {data.allQuestions.length}</div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider font-bold">
                                    <th className="px-6 py-4 w-16">#ID</th>
                                    <th className="px-6 py-4">Question</th>
                                    <th className="px-6 py-4 text-center">Attempts</th>
                                    <th className="px-6 py-4 text-center">Correct</th>
                                    <th className="px-6 py-4 text-center">Incorrect</th>
                                    <th className="px-6 py-4 text-center">Accuracy</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.allQuestions.map((q) => (
                                    <tr key={q.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-400 group-hover:text-blue-500 font-bold">{q.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-800 max-w-lg truncate" title={q.text}>{q.text}</div>
                                            <div className="text-xs text-gray-400 mt-1">{q.category}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-700">{q.attempts}</td>
                                        <td className="px-6 py-4 text-center text-green-600 font-bold bg-green-50/50 rounded-lg">{q.correct}</td>
                                        <td className="px-6 py-4 text-center text-red-500 font-bold bg-red-50/50 rounded-lg">{q.incorrect}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${q.accuracy >= 80 ? 'bg-green-500' : q.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{ width: `${q.accuracy}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold">{q.accuracy}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${q.accuracy >= 80 ? 'bg-green-100 text-green-700' :
                                                    q.accuracy >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {q.accuracy >= 80 ? 'Easy' : q.accuracy >= 60 ? 'Medium' : 'Hard'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </div>
    );
}
