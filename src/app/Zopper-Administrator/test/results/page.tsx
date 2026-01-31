'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { getTestSubmissions, getTestStatistics, TestSubmission } from '@/lib/testData';

// Fallback mock data
const MOCK_SUBMISSIONS: TestSubmission[] = [
  {
    id: '1',
    secId: '2345',
    secName: 'Rahul Kumar',
    phone: '2345',
    sessionToken: 'mock-session-1',
    responses: Array.from({ length: 10 }, (_, i) => ({
      questionId: i + 1,
      selectedAnswer: 'A',
      answeredAt: new Date().toISOString(),
      isCorrect: true,
      correctAnswer: 'A',
    })),
    score: 100,
    totalQuestions: 10,
    submittedAt: '2025-11-06T16:11:00.000Z',
    completionTime: 7 * 60 + 20,
    isProctoringFlagged: true,
    screenshotUrls: [
      'https://via.placeholder.com/48',
      'https://via.placeholder.com/48',
      'https://via.placeholder.com/48',
    ],
    storeId: 'store-1',
    storeName: 'teststore',
    storeCity: 'testcity',
  },
  {
    id: '2',
    secId: '1234',
    secName: 'Priya Singh',
    phone: '1234',
    sessionToken: 'mock-session-2',
    responses: Array.from({ length: 10 }, (_, i) => ({
      questionId: i + 1,
      selectedAnswer: 'B',
      answeredAt: new Date().toISOString(),
      isCorrect: i < 3,
      correctAnswer: 'A',
    })),
    score: 30,
    totalQuestions: 10,
    submittedAt: '2025-11-04T15:05:00.000Z',
    completionTime: 32,
    isProctoringFlagged: true,
    screenshotUrls: ['https://via.placeholder.com/48'],
    storeId: 'store-2',
    storeName: 'Croma- A001 - Mumbai',
    storeCity: 'Mumbai',
  },
];

const MOCK_STATS = {
  totalSubmissions: MOCK_SUBMISSIONS.length,
  averageScore: Math.round(
    MOCK_SUBMISSIONS.reduce((sum, s) => sum + s.score, 0) / MOCK_SUBMISSIONS.length,
  ),
  passRate: Math.round(
    (MOCK_SUBMISSIONS.filter((s) => s.score >= 80).length / MOCK_SUBMISSIONS.length) * 100,
  ),
  averageTime: Math.round(
    MOCK_SUBMISSIONS.reduce((sum, s) => sum + s.completionTime, 0) /
    MOCK_SUBMISSIONS.length,
  ),
};

export default function TestResultsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<TestSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<TestSubmission[]>([]);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    averageScore: 0,
    passRate: 0,
    averageTime: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'submittedAt' | 'secId'>('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterScore, setFilterScore] = useState<'all' | 'pass' | 'fail'>('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔄 Starting to fetch test data...');
        
        // Fetch data with timeout handling
        const [apiData, apiStats] = await Promise.allSettled([
          getTestSubmissions(),
          getTestStatistics()
        ]);

        let data: TestSubmission[] = [];
        let statistics = MOCK_STATS;

        // Handle submissions data
        if (apiData.status === 'fulfilled' && apiData.value && apiData.value.length > 0) {
          data = apiData.value;
          console.log('✅ Using API data:', data.length, 'submissions');
        } else {
          data = MOCK_SUBMISSIONS;
          console.log('⚠️ Using mock data:', data.length, 'submissions');
        }

        // Handle statistics data
        if (apiStats.status === 'fulfilled' && apiStats.value && apiStats.value.totalSubmissions) {
          statistics = apiStats.value as typeof stats;
          console.log('✅ Using API stats');
        } else {
          console.log('⚠️ Using mock stats');
        }

        setSubmissions(data);
        setFilteredSubmissions(data);
        setStats(statistics);
        
      } catch (err) {
        console.error('❌ Error in fetchData:', err);
        setError('Failed to load test results');
        // Fallback to mock data
        setSubmissions(MOCK_SUBMISSIONS);
        setFilteredSubmissions(MOCK_SUBMISSIONS);
        setStats(MOCK_STATS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...submissions];

    if (filterScore === 'pass') {
      filtered = filtered.filter((sub) => sub.score >= 80);
    } else if (filterScore === 'fail') {
      filtered = filtered.filter((sub) => sub.score < 80);
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'submittedAt':
          comparison =
            new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          break;
        case 'secId':
          comparison = a.secId.localeCompare(b.secId);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredSubmissions(filtered);
  }, [submissions, sortBy, sortOrder, filterScore]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const exportToExcel = () => {
    if (filteredSubmissions.length === 0) {
      alert('No data to export');
      return;
    }

    const exportData = filteredSubmissions.map((submission) => {
      const hasEnrichedData = submission.responses && submission.responses.length > 0;

      const correctCount = hasEnrichedData
        ? submission.responses.filter((r) => r.isCorrect).length
        : 'N/A';
      const wrongCount = hasEnrichedData
        ? submission.responses.filter((r) => !r.isCorrect).length
        : 'N/A';
      const answerDetails = hasEnrichedData
        ? submission.responses
          .map(
            (r, idx) =>
              `Q${idx + 1}: ${r.selectedAnswer} (${r.isCorrect ? 'CORRECT' : 'WRONG'})`,
          )
          .join(' | ')
        : 'Answer details not available';

      return {
        'SEC ID': submission.secId,
        'SEC Name': submission.secName || 'N/A',
        Store: submission.storeName
          ? `${submission.storeName}, ${submission.storeCity || ''}`
          : 'N/A',
        Score: `${submission.score}%`,
        'Correct Answers': correctCount,
        'Wrong Answers': wrongCount,
        'Total Questions': submission.totalQuestions,
        'Completion Time (min)': Math.round(submission.completionTime / 60),
        'Submitted At': new Date(submission.submittedAt).toLocaleString(),
        Status: submission.score >= 80 ? 'PASS' : 'FAIL',
        'Proctoring Flagged': submission.isProctoringFlagged ? 'YES' : 'NO',
        'Answer Details': answerDetails,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test Results');

    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }));
    (ws as any)['!cols'] = colWidths;

    XLSX.writeFile(
      wb,
      `SEC_Test_Results_${new Date().toISOString().split('T')[0]}.xlsx`,
    );
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-lg font-medium text-gray-700">Loading test results...</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-red-600">⚠️</div>
            <div className="text-red-800 font-medium">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="ml-auto px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && (
        <>
          <div className="flex justify-end">
            <button
              onClick={exportToExcel}
              disabled={filteredSubmissions.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              📊 Export to Excel
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSubmissions}</div>
              <div className="text-sm font-semibold text-gray-700">Total Submissions</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-green-600">{stats.averageScore}%</div>
              <div className="text-sm font-semibold text-gray-700">Average Score</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.passRate}%</div>
              <div className="text-sm font-semibold text-gray-700">Pass Rate (≥80%)</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-purple-600">
                {formatTime(stats.averageTime)}
              </div>
              <div className="text-sm font-semibold text-gray-700">Avg. Time Taken</div>
            </div>
            <div
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:bg-gray-50 transition-colors border-2 border-transparent hover:border-orange-400"
              onClick={() => router.push('/Zopper-Administrator/question-analysis')}
            >
              <div className="text-2xl font-bold text-orange-600">📊</div>
              <div className="text-sm font-semibold text-gray-700">Question Analysis</div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-bold text-gray-900">Filter:</label>
                <select
                  value={filterScore}
                  onChange={(e) => setFilterScore(e.target.value as typeof filterScore)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm font-semibold text-gray-900 bg-white"
                >
                  <option value="all">All Results</option>
                  <option value="pass">Pass (≥80%)</option>
                  <option value="fail">Fail (&lt;80%)</option>
                </select>
              </div>

              <div className="text-sm font-bold text-gray-900">
                Showing {filteredSubmissions.length} of {submissions.length} results
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium mb-2">No test submissions yet</h3>
                <p>Test results will appear here once SECs complete their assessments.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="w-[8%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('secId')}
                      >
                        SEC ID {sortBy === 'secId' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="w-[14%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        SEC Name
                      </th>
                      <th className="w-[16%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Store
                      </th>
                      <th
                        className="w-[8%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('score')}
                      >
                        Score {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="w-[10%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Time Taken
                      </th>
                      <th
                        className="w-[16%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('submittedAt')}
                      >
                        Submitted{' '}
                        {sortBy === 'submittedAt' && (sortOrder === 'desc' ? '↓' : '↑')}
                      </th>
                      <th className="w-[12%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="w-[8%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        SS
                      </th>
                      <th className="w-[8%] px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Answers
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubmissions.map((submission, i) => (
                      <tr
                        key={submission.id || `${submission.secId}-${submission.submittedAt}-${i}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-3 py-3 text-sm font-semibold text-gray-900 truncate">
                          {submission.secId}
                        </td>
                        <td className="px-3 py-3 text-sm font-medium text-gray-900 truncate">
                          {submission.secName || 'N/A'}
                        </td>
                        <td className="px-3 py-3 text-sm font-medium text-gray-900">
                          {submission.storeName ? (
                            <div className="truncate">
                              <div className="font-semibold truncate">{submission.storeName}</div>
                              <div className="text-gray-600 text-xs font-medium truncate">
                                {submission.storeCity}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 font-medium">N/A</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold inline-block ${getScoreColor(
                              submission.score,
                            )}`}
                          >
                            {submission.score}%
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm font-semibold text-gray-900">
                          {formatTime(submission.completionTime)}
                        </td>
                        <td className="px-3 py-3 text-xs font-medium text-gray-900">
                          {new Date(submission.submittedAt).toLocaleString('en-US', {
                            month: '2-digit',
                            day: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-2 py-1 text-xs font-bold rounded-full inline-block text-center ${submission.score >= 80
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}
                            >
                              {submission.score >= 80 ? 'PASS' : 'FAIL'}
                            </span>
                            {submission.isProctoringFlagged && (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/Zopper-Administrator/proctoring?phone=${encodeURIComponent(
                                      submission.phone || submission.secId,
                                    )}`,
                                  )
                                }
                                className="px-2 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer transition-colors"
                              >
                                ⚠️ FLAG
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {submission.screenshotUrls && submission.screenshotUrls.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <div className="flex -space-x-2">
                                {submission.screenshotUrls.slice(0, 3).map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt={`Screenshot ${idx + 1}`}
                                    className="w-8 h-8 rounded-full border-2 border-white object-cover cursor-pointer hover:scale-110 transition-transform"
                                    onClick={() =>
                                      router.push(
                                        `/Zopper-Administrator/screenshots?sessionToken=${encodeURIComponent(
                                          submission.sessionToken,
                                        )}&secId=${encodeURIComponent(submission.secId)}`,
                                      )
                                    }
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ))}
                              </div>
                              {submission.screenshotUrls.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{submission.screenshotUrls.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                router.push(
                                  `/Zopper-Administrator/screenshots?sessionToken=${encodeURIComponent(
                                    submission.sessionToken,
                                  )}&secId=${encodeURIComponent(submission.secId)}`,
                                )
                              }
                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors w-full"
                            >
                              📸 View
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() =>
                              router.push(
                                `/Zopper-Administrator/answer-details?id=${submission.id}`,
                              )
                            }
                            className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 transition-colors w-full flex items-center justify-center gap-1"
                          >
                            <span>📋</span>
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
