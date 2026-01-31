'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, Download, Maximize2, ExternalLink } from 'lucide-react';

interface TestSubmission {
    id: string;
    secId: string;
    secName: string;
    sessionToken: string;
    screenshotUrls: string[];
    submittedAt: string;
    score: number;
}

function ScreenshotsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionToken = searchParams.get('sessionToken');
    const secId = searchParams.get('secId');

    const [submission, setSubmission] = useState<TestSubmission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubmission = async () => {
            if (!secId || !sessionToken) {
                setError('Missing required parameters');
                setLoading(false);
                return;
            }

            try {
                // Fetch submissions for this SEC
                const response = await fetch(`/api/admin/test-submissions?secId=${secId}&limit=50`);
                const result = await response.json();

                if (result.success && result.data) {
                    // Find the specific submission
                    const found = result.data.find((sub: any) => sub.sessionToken === sessionToken);

                    if (found) {
                        setSubmission(found);
                    } else {
                        setError('Submission not found');
                    }
                } else {
                    setError('Failed to fetch data');
                }
            } catch (err) {
                console.error('Error fetching submission:', err);
                setError('An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmission();
    }, [secId, sessionToken]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
                <p className="text-gray-600 mb-6">{error || 'Submission not found'}</p>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-blue-600 mb-4 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" /> Back to Results
                    </button>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Proctoring Screenshots</h1>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                <span className="font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">SEC: {submission.secName || submission.secId}</span>
                                <span className="font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Date: {new Date(submission.submittedAt).toLocaleString()}</span>
                                <span className={`font-medium px-3 py-1 rounded-full ${submission.score >= 80 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>Score: {submission.score}%</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <p className="text-blue-800 text-sm font-medium">
                                📸 {submission.screenshotUrls.length} Screenshots Captured
                            </p>
                        </div>
                    </div>
                </div>

                {/* Gallery */}
                {submission.screenshotUrls.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {submission.screenshotUrls.map((url, index) => (
                            <div
                                key={index}
                                className="group relative bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <div className="aspect-video relative overflow-hidden bg-gray-100 cursor-pointer" onClick={() => setSelectedImage(url)}>
                                    <img
                                        src={url}
                                        alt={`Screenshot ${index + 1}`}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Load+Error';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <Maximize2 className="text-white w-8 h-8 drop-shadow-lg" />
                                    </div>
                                </div>
                                <div className="p-3 bg-white border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Open <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">📷</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No Screenshots Found</h3>
                        <p>No proctoring screenshots were captured for this test session.</p>
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <Maximize2 className="w-8 h-8 rotate-45" /> {/* Use rotate to simulate close X if XIcon isn't available, or just standard icon */}
                    </button>

                    <img
                        src={selectedImage}
                        alt="Full size preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}

export default function ScreenshotsPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
            <ScreenshotsContent />
        </Suspense>
    );
}
