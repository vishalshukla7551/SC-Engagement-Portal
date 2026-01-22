'use client';

import { useState, useEffect } from 'react';
import { clientLogout } from '@/lib/clientLogout';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const CURRENT_YEAR_SHORT = new Date().getFullYear().toString().slice(-2);
const MONTH_OPTIONS = MONTHS.map((month) => `${month} ${CURRENT_YEAR_SHORT}`);

interface LeaderboardStore {
  rank: number;
  storeId: string;
  storeName: string;
  city: string | null;
  totalSales: number;
  totalIncentive: string;
}

interface LeaderboardData {
  stores: LeaderboardStore[];
  devices: any[];
  plans: any[];
  period: string;
  activeCampaignsCount: number;
  totalSalesReports: number;
}

export default function LeaderboardPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    MONTH_OPTIONS[new Date().getMonth()] ?? `December ${CURRENT_YEAR_SHORT}`,
  );
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      
      const res = await fetch(`/api/zopper-administrator/leaderboard?month=${monthIndex}&year=${year}&limit=20`);
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

  const podiumData = leaderboardData?.stores.slice(0, 3).map((store, idx) => ({
    rank: store.rank,
    store: store.storeName,
    city: store.city || 'N/A',
    incentives: store.totalIncentive,
    sales: `${store.totalSales} sales`,
    bg: idx === 0 ? 'from-[#FACC15] to-[#F97316]' : idx === 1 ? 'from-[#4B5563] to-[#1F2933]' : 'from-[#F97316] to-[#FB923C]',
    highlight: idx === 0,
  })) || [];

  // Reorder podium to show 2nd, 1st, 3rd
  const reorderedPodium = podiumData.length >= 3 
    ? [podiumData[1], podiumData[0], podiumData[2]]
    : podiumData;

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchLeaderboard(selectedMonth)}
            disabled={loading}
            className="px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium border border-white/20 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={() => clientLogout('/login/role', false)}
            className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center text-white mb-5">
        <div className="mb-2 flex justify-center">
          <span className="text-4xl">🏆</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">
          Sales Champion Leaderboard
        </h1>
        <p className="text-sm text-gray-200 mb-4">
          Top stores by total incentives
        </p>

        {/* Month selector */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm mb-3">
          <span className="text-xs uppercase tracking-wide text-gray-300">Month</span>
          <select
            className="bg-transparent text-white text-sm pr-4 cursor-pointer appearance-none focus:outline-none focus:ring-0 focus:border-none border-none outline-none"
            style={{ outline: 'none', boxShadow: 'none' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {MONTH_OPTIONS.map((label) => (
              <option
                key={label}
                value={label}
                className="bg-[#020617] text-white"
              >
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="text-center text-white py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading leaderboard...</p>
        </div>
      )}

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
          {/* Podium - 3 cards side by side, aligned at bottom */}
          {reorderedPodium.length > 0 && (
            <section className="mb-6 flex gap-3 sm:gap-4 justify-center items-end pb-1">
              {reorderedPodium.map((card) => (
                <div key={card.rank} className="relative">
                  {/* Crown ABOVE the card with bounce animation */}
                  {card.highlight && (
                    <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                      <span className="text-2xl sm:text-4xl">👑</span>
                    </div>
                  )}
                  
                  {/* The card - responsive sizing, champion taller */}
                  <div
                    className={`w-[105px] sm:w-[180px] lg:w-[220px] ${card.highlight ? 'h-[140px] sm:h-[200px] lg:h-[220px]' : 'h-[130px] sm:h-[180px] lg:h-[200px]'} rounded-2xl sm:rounded-3xl bg-gradient-to-b ${card.bg} text-white p-2 sm:p-4 lg:p-5 shadow-lg flex flex-col items-center justify-between overflow-hidden`}
                  >
                    {/* Icon */}
                    <div className="flex justify-center shrink-0">
                      <span className="text-xl sm:text-3xl lg:text-4xl">{card.rank === 1 ? '🏆' : card.rank === 2 ? '🥈' : '🥉'}</span>
                    </div>
                    
                    {/* Store name */}
                    <div className="text-center px-1 w-full flex-shrink min-h-0">
                      <p className="text-[9px] sm:text-xs lg:text-sm font-semibold leading-tight line-clamp-2 break-words">
                        {card.store}
                      </p>
                      <p className="text-[7px] sm:text-[10px] lg:text-xs text-white/90 mt-0.5 truncate">{card.city}</p>
                    </div>
                    
                    {/* Amount */}
                    <p className="text-sm sm:text-2xl lg:text-3xl font-bold shrink-0">{card.incentives}</p>
                    
                    {/* Bottom badge */}
                    {card.highlight ? (
                      <div className="w-full py-0.5 sm:py-1 lg:py-1.5 rounded-full bg-black/20 text-[7px] sm:text-[10px] lg:text-xs font-bold text-center shrink-0">
                        CHAMPION
                      </div>
                    ) : (
                      <p className="text-xs sm:text-lg lg:text-xl font-bold shrink-0">#{card.rank}</p>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* All Stores Ranking Section */}
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl bg-purple-600 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-3">
                <div className="flex items-center gap-2 text-white">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 3V5M15 3V5M9 19V21M15 19V21M5 9H3M5 15H3M21 9H19M21 15H19M7 19H17C18.1046 19 19 18.1046 19 17V7C19 5.89543 18.1046 5 17 5H7C5.89543 5 5 5.89543 5 7V17C5 18.1046 5.89543 19 7 19Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h2 className="text-lg font-bold">All Stores Ranking</h2>
                </div>
                <p className="text-purple-100 text-xs mt-1">
                  Complete leaderboard by total incentives earned
                </p>
              </div>

              {/* Table */}
              <div className="bg-gray-900 rounded-t-2xl">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left px-4 py-3 text-neutral-400 text-xs font-medium">
                        Rank 👑
                      </th>
                      <th className="text-left px-4 py-3 text-neutral-400 text-xs font-medium">
                        Store
                      </th>
                      <th className="text-right px-4 py-3 text-neutral-400 text-xs font-medium">
                        Total Incentive
                      </th>
                      <th className="text-right px-4 py-3 text-neutral-400 text-xs font-medium">
                        Total Sales
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.stores.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-4 text-center text-neutral-300 text-sm">
                          No sales reported yet.
                        </td>
                      </tr>
                    )}
                    {leaderboardData.stores.map((store, index) => (
                      <tr
                        key={store.storeId}
                        className={`border-b border-gray-800 ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {store.rank <= 3 && (
                              <span className="text-xl">
                                {store.rank === 1 ? '👑' : store.rank === 2 ? '🥈' : '🥉'}
                              </span>
                            )}
                            {store.rank > 3 && (
                              <span className="text-white font-semibold text-sm">#{store.rank}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-white text-sm font-medium">{store.storeName}</div>
                            <div className="text-neutral-400 text-xs">{store.city || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="text-right px-4 py-3 text-white text-sm">{store.totalIncentive}</td>
                        <td className="text-right px-4 py-3 text-white text-sm">
                          {store.totalSales} sale{store.totalSales === 1 ? '' : 's'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bottom motivational section with rocket animation */}
          <div className="text-center py-4">
            <div className="text-3xl mb-2 animate-bounce">🚀</div>
            <h3 className="text-white text-lg font-bold mb-1">Keep Pushing Higher!</h3>
            <p className="text-gray-400 text-xs">
              Every sale brings you closer to the top!
            </p>
          </div>
        </>
      )}
    </div>
  );
}
