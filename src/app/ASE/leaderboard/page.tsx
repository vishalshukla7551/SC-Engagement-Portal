'use client';

import { useState, useEffect } from 'react';
import { clientLogout } from '@/lib/clientLogout';

interface ASELeaderboardEntry {
  rank: number;
  aseId: string;
  aseName: string;
  phone: string;
  zseName: string | null;
  region: string | null;
  storeCount: number;
  activeStoreCount: number;
  totalSales: number;
  totalIncentive: string;
  totalIncentiveRaw: number;
  adldUnits: number;
  comboUnits: number;
  adldRevenue: string;
  comboRevenue: string;
}

interface LeaderboardData {
  ases: ASELeaderboardEntry[];
  period: string;
  totalASEs: number;
  totalSalesReports: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

const CURRENT_YEAR_SHORT = new Date().getFullYear().toString().slice(-2);
const MONTH_OPTIONS = MONTHS.map((month) => `${month} ${CURRENT_YEAR_SHORT}`);

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    MONTH_OPTIONS[new Date().getMonth()] ?? `December ${CURRENT_YEAR_SHORT}`
  );

  const fetchLeaderboard = async (monthStr: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Parse month string like "December 24" to get month and year
      const parts = monthStr.split(' ');
      const monthName = parts[0];
      const yearShort = parts[1];
      const monthIndex = MONTHS.indexOf(monthName as typeof MONTHS[number]) + 1; // 1-indexed
      const year = 2000 + parseInt(yearShort);
      
      console.log(`Fetching leaderboard for month: ${monthIndex}, year: ${year}`);
      const res = await fetch(`/api/ase/ase-leaderboard?month=${monthIndex}&year=${year}&limit=20`);
      const result = await res.json();
      
      if (result.success) {
        setLeaderboardData(result.data);
      } else {
        setError('Failed to load leaderboard data');
      }
    } catch (err) {
      setError('Error fetching leaderboard data');
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(selectedMonth);
  }, [selectedMonth]);

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '-';
  };

  const getRankChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  // Get top 3 for podium
  const podiumData = leaderboardData?.ases.slice(0, 3) || [];
  const reorderedPodium = podiumData.length >= 3 
    ? [podiumData[1], podiumData[0], podiumData[2]]
    : podiumData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-6 py-6">
      {/* Header with buttons */}
      <div className="flex justify-between items-center mb-8">
        <a
          href="/ASE"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-medium">Back</span>
        </a>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLeaderboard(selectedMonth)}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium border border-white/20 disabled:opacity-50 hover:bg-white/20 transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => clientLogout('/login/role')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Trophy Icon */}
      <div className="flex justify-center pb-4">
        <div className="w-20 h-20 flex items-center justify-center">
          <span className="text-6xl">🏆</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-3">
        <h1 className="text-3xl font-bold text-white">ASE Ka Mahasangram</h1>
      </div>

      {/* Subtitle */}
      <div className="text-center mb-4">
        <p className="text-neutral-300 text-sm">
          Compete with other ASEs based on your stores&apos; performance
        </p>
      </div>

      {/* Month selector */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm">
          <span className="text-xs uppercase tracking-wide text-gray-300">Month</span>
          <select
            className="bg-transparent text-white text-sm pr-4 cursor-pointer appearance-none focus:outline-none focus:ring-0 focus:border-none border-none outline-none"
            style={{ outline: 'none', boxShadow: 'none' }}
            value={selectedMonth}
            onChange={(e) => {
              console.log('Month changed to:', e.target.value);
              setSelectedMonth(e.target.value);
            }}
          >
            {MONTH_OPTIONS.map((label) => (
              <option key={label} value={label} className="bg-gray-900 text-white">
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center text-white py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading leaderboard...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center text-red-400 py-12">
          <p>{error}</p>
          <button 
            onClick={() => fetchLeaderboard(selectedMonth)}
            className="mt-4 px-4 py-2 bg-red-500/20 rounded-lg hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && leaderboardData && (
        <>
          {/* Podium */}
          {reorderedPodium.length > 0 && (
            <div className="flex justify-center items-end gap-4 mb-8 max-w-5xl mx-auto">
              {reorderedPodium.map((ase, idx) => {
                const isChampion = ase.rank === 1;
                const bgGradient = ase.rank === 1 
                  ? 'from-yellow-400 to-yellow-600' 
                  : ase.rank === 2 
                    ? 'from-gray-400 to-gray-500' 
                    : 'from-orange-400 to-orange-600';
                const height = isChampion ? 'h-52' : ase.rank === 2 ? 'h-44' : 'h-40';
                
                return (
                  <div key={ase.aseId} className="relative">
                    {/* Crown for champion with bounce animation */}
                    {isChampion && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                        <span className="text-4xl">👑</span>
                      </div>
                    )}
                    
                    <div className={`w-64 ${height} rounded-2xl bg-gradient-to-br ${bgGradient} shadow-xl p-5 flex flex-col justify-between`}>
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                          <span className="text-2xl">
                            {ase.rank === 1 ? '🏆' : ase.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold mb-0.5 truncate">
                          {ase.aseName}
                        </p>
                        <p className="text-white/80 text-xs mb-2">
                          {ase.storeCount} stores • {ase.region || 'N/A'}
                        </p>
                        <div className="text-white text-xl font-bold">{ase.totalIncentive}</div>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-white/20 rounded-lg px-2.5 py-0.5">
                        <span className="text-white text-xs font-bold">
                          {isChampion ? 'CHAMPION' : `#${ase.rank}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {leaderboardData.ases.length === 0 && (
            <div className="max-w-5xl mx-auto mb-6 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 p-6">
              <div className="flex flex-col items-center gap-3">
                <div className="text-4xl">📊</div>
                <h2 className="text-white text-xl font-bold">No Data Yet!</h2>
                <p className="text-neutral-300 text-sm">
                  Sales data will appear here once campaigns are active.
                </p>
              </div>
            </div>
          )}

          {/* All ASEs Ranking Table */}
          {leaderboardData.ases.length > 0 && (
            <div className="max-w-5xl mx-auto">
              <div className="rounded-2xl bg-purple-600 overflow-hidden">
                {/* Header */}
                <div className="px-5 py-3">
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-xl">🔥</span>
                    <h2 className="text-lg font-bold">All ASE Rankings</h2>
                  </div>
                  <p className="text-purple-100 text-xs mt-1">
                    Complete leaderboard by total store incentives earned
                  </p>
                </div>

                {/* Table */}
                <div className="bg-gray-900 rounded-t-2xl overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left px-4 py-3 text-neutral-400 text-xs font-medium">Rank</th>
                        <th className="text-left px-4 py-3 text-neutral-400 text-xs font-medium">ASE Name</th>
                        <th className="text-center px-4 py-3 text-neutral-400 text-xs font-medium">Stores</th>
                        <th className="text-right px-4 py-3 text-neutral-400 text-xs font-medium">ADLD</th>
                        <th className="text-right px-4 py-3 text-neutral-400 text-xs font-medium">Combo</th>
                        <th className="text-right px-4 py-3 text-neutral-400 text-xs font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.ases.map((ase) => (
                        <tr
                          key={ase.aseId}
                          className={`border-b border-gray-800 ${
                            ase.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {ase.rank <= 3 && (
                                <span className="text-xl">
                                  {ase.rank === 1 ? '👑' : ase.rank === 2 ? '🥈' : '🥉'}
                                </span>
                              )}
                              {ase.rank > 3 && (
                                <span className="text-white font-semibold text-sm">#{ase.rank}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-white text-sm font-medium">{ase.aseName}</div>
                              <div className="text-neutral-400 text-xs">{ase.region || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-white text-sm">{ase.storeCount}</span>
                          </td>
                          <td className="text-right px-4 py-3">
                            <div className="text-white text-sm">{ase.adldUnits}</div>
                            <div className="text-neutral-400 text-xs">{ase.adldRevenue}</div>
                          </td>
                          <td className="text-right px-4 py-3">
                            <div className="text-white text-sm">{ase.comboUnits}</div>
                            <div className="text-neutral-400 text-xs">{ase.comboRevenue}</div>
                          </td>
                          <td className="text-right px-4 py-3">
                            <div className="text-green-500 font-bold text-base">{ase.totalIncentive}</div>
                            <div className="text-neutral-400 text-xs">{ase.totalSales} sales</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bottom motivational section */}
      <div className="mt-6 mb-4 text-center">
        <div className="text-3xl mb-2 animate-bounce">🚀</div>
        <h3 className="text-white text-lg font-bold mb-1">Keep Pushing Higher!</h3>
        <p className="text-neutral-400 text-xs">
          Every sale from your stores brings you closer to the top!
        </p>
      </div>
    </div>
  );
}
