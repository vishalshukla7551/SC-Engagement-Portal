'use client';

import { useState, useEffect } from 'react';
import SECHeader from '../SECHeader.jsx';
import SECFooter from '../SECFooter.jsx';
import { downloadReport } from './downloadReport';

// Filter options
const monthlyFilters = ['Today', 'Yesterday', 'All'] as const;

type FilterType = (typeof monthlyFilters)[number];

type MonthlySale = {
  date: string;
  adld: string;
  combo: string;
  units: number;
};

type MonthlyTxn = {
  month: string;
  units: number;
  incentive: string;
  status: string;
  paymentDate: string;
};

type SpotVoucher = {
  date: string;
  deviceName: string;
  planName: string;
  incentive: string;
  voucherCode: string;
};

type PassbookData = {
  salesSummary: MonthlySale[];
  monthlyIncentive: {
    transactions: MonthlyTxn[];
  };
  spotIncentive: {
    transactions: SpotVoucher[];
  };
  fyStats: Record<string, {
    units: string;
    totalEarned: string;
    paid: string;
    net: string;
  }>;
};

const statsCardsConfig = [
  { id: 'units', label: 'Total Units Sold', key: 'units', gradient: 'from-[#176CF3] to-[#3056FF]' },
  { id: 'total-earned', label: 'Total Earned Incentive', key: 'totalEarned', gradient: 'from-[#16A34A] to-[#22C55E]' },
  { id: 'paid', label: 'Paid Incentive', key: 'paid', gradient: 'from-[#9333EA] to-[#EC4899]' },
  { id: 'net', label: 'Net Balance', key: 'net', gradient: 'from-[#2563EB] to-[#4F46E5]' },
] as const;

const parseDate = (ddmmyyyy: string) => {
  const [dd, mm, yyyy] = ddmmyyyy.split('-').map(Number);
  return new Date(yyyy, (mm || 1) - 1, dd || 1);
};

const formatMonthYear = (dateStr: string) => {
  const d = parseDate(dateStr);
  const monthName = d.toLocaleDateString('en-IN', { month: 'long' });
  const yearShort = d.getFullYear().toString().slice(-2);
  return `${monthName} ${yearShort}`;
};

export default function IncentivePassbookPage() {
  const [activeTab, setActiveTab] = useState<'monthly' | 'spot'>('monthly');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('All');
  const [selectedFY, setSelectedFY] = useState<string>('FY-25');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  
  // API data state
  const [passbookData, setPassbookData] = useState<PassbookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [selectedIncentiveData, setSelectedIncentiveData] = useState<any>(null);

  // Fetch passbook data from API
  useEffect(() => {
    async function fetchPassbookData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/sec/passbook');
        
        if (!res.ok) {
          if (res.status === 401) {
            setError('Unauthorized. Please login again.');
            return;
          }
          const errorData = await res.json().catch(() => ({ error: 'Failed to fetch data' }));
          setError(errorData.error || 'Failed to fetch passbook data');
          return;
        }

        const result = await res.json();
        if (result.success && result.data) {
          setPassbookData(result.data);
        } else {
          setError('Invalid response from server');
        }
      } catch (err) {
        console.error('Error fetching passbook data:', err);
        setError('Failed to load passbook data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchPassbookData();
  }, []);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Get sales summary data or empty array
  const salesSummaryData = passbookData?.salesSummary || [];
  
  // Get unique months from sales summary
  const allMonths = Array.from(
    new Set(salesSummaryData.map((r) => formatMonthYear(r.date)))
  );

  // Get available FYs from API data or default
  const allFYs = passbookData?.fyStats ? Object.keys(passbookData.fyStats) : ['FY-25', 'FY-24', 'FY-23', 'FY-22', 'FY-21'];

  const filteredMonthlySales = salesSummaryData
    .filter((row) => {
      const d = parseDate(row.date);
      if (activeFilter === 'Today') {
        return (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      }
      if (activeFilter === 'Yesterday') {
        return (
          d.getDate() === yesterday.getDate() &&
          d.getMonth() === yesterday.getMonth() &&
          d.getFullYear() === yesterday.getFullYear()
        );
      }
      return true;
    })
    .filter((row) =>
      selectedMonth === 'All' ? true : formatMonthYear(row.date) === selectedMonth
    )
    .filter((row) => {
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return (
        row.date.toLowerCase().includes(term) ||
        row.adld.toLowerCase().includes(term) ||
        row.combo.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const da = parseDate(a.date).getTime();
      const db = parseDate(b.date).getTime();
      return sortAsc ? da - db : db - da;
    });

  // Get FY stats from API data
  const fyStats = passbookData?.fyStats?.[selectedFY] || {
    units: '0',
    totalEarned: '₹0',
    paid: '₹0',
    net: '₹0',
  };

  // Get monthly transactions
  const monthlyTransactions = passbookData?.monthlyIncentive.transactions || [];

  // Get spot incentive transactions
  const spotTransactions = passbookData?.spotIncentive.transactions || [];

  if (loading) {
    return (
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        <SECHeader />
        <main className="flex-1 overflow-y-auto pb-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading passbook data...</p>
          </div>
        </main>
        <SECFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen bg-white flex flex-col overflow-hidden">
        <SECHeader />
        <main className="flex-1 overflow-y-auto pb-32 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </main>
        <SECFooter />
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <SECHeader />

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="px-4 pt-4">
          {/* Top Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('monthly')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                activeTab === 'monthly'
                  ? 'bg-[#176CF3] text-white border-transparent shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              Monthly Incentive
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('spot')}
              className={`flex-1 ml-2 py-2 rounded-lg text-sm font-medium border ${
                activeTab === 'spot'
                  ? 'bg-[#176CF3] text-white border-transparent shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              Spot Incentive
            </button>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 mb-4">
            {monthlyFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  activeFilter === filter
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search (e.g., 15-10-2025)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sort & Download buttons */}
          <div className="flex flex-col gap-3 mb-5">
            <button
              type="button"
              onClick={() => setSortAsc((prev) => !prev)}
              className="w-full bg-black text-white text-sm font-semibold py-2.5 rounded-xl"
            >
              Sort by Date {sortAsc ? '(Oldest first)' : '(Newest first)'}
            </button>
            <button
              type="button"
              onClick={() => downloadReport(filteredMonthlySales)}
              className="w-full bg-gradient-to-r from-[#0EA5E9] via-[#2563EB] to-[#4F46E5] text-white text-sm font-semibold py-2.5 rounded-xl shadow"
            >
              Download Report
            </button>
          </div>

          {activeTab === 'monthly' ? (
            <MonthlyIncentiveSection
              rows={filteredMonthlySales}
              transactions={monthlyTransactions}
              allMonths={allMonths}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedFY={selectedFY}
              setSelectedFY={setSelectedFY}
              allFYs={allFYs}
              setSelectedIncentiveData={setSelectedIncentiveData}
              setShowIncentiveModal={setShowIncentiveModal}
            />
          ) : (
            <SpotIncentiveSection
              rows={filteredMonthlySales}
              transactions={spotTransactions}
              allMonths={allMonths}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedFY={selectedFY}
              setSelectedFY={setSelectedFY}
              allFYs={allFYs}
            />
          )}

          {/* Stats cards (common) */}
          <div className="mt-5 mb-4 space-y-3">
            {statsCardsConfig.map((card) => (
              <div
                key={card.id}
                className={`bg-gradient-to-r ${card.gradient} rounded-2xl px-4 py-4 text-white`}
              >
                <p className="text-xs mb-1">{card.label}</p>
                <p className="text-xl font-semibold">{fyStats[card.key as keyof typeof fyStats]}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SECFooter />

      {/* Incentive Details Modal */}
      {showIncentiveModal && selectedIncentiveData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Incentive Details</h3>
              <button
                onClick={() => setShowIncentiveModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-4">
              <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-3">Incentive Breakdown - {selectedIncentiveData.month}</h4>
                
                {/* Detailed Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-2 font-semibold text-gray-700">Details</th>
                        <th className="text-right p-2 font-semibold text-gray-700">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-2 text-gray-600">Store Name</td>
                        <td className="p-2 text-right font-medium">Croma - A284 Agra SRK Mall</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-gray-600">Number Of SECs</td>
                        <td className="p-2 text-right font-medium">3</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-gray-600">Total Units Sold [25 Dec]</td>
                        <td className="p-2 text-right font-medium">{selectedIncentiveData.units}</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-gray-600">Fold 7 Sold</td>
                        <td className="p-2 text-right font-medium">0</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-gray-600">S25 Series Sold</td>
                        <td className="p-2 text-right font-medium">1</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-gray-600">Attachment Kicker Considered [25 Dec]</td>
                        <td className="p-2 text-right font-medium">Yes</td>
                      </tr>
                      <tr>
                        <td className="p-2 text-gray-600">Volume Kicker Applicable</td>
                        <td className="p-2 text-right font-medium">8 x 3 = 24</td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="p-2 font-semibold text-blue-900">Total Incentive Earned</td>
                        <td className="p-2 text-right font-bold text-blue-900">{selectedIncentiveData.incentive}</td>
                      </tr>
                      <tr className="bg-orange-50">
                        <td className="p-2 font-semibold text-orange-800">Payment Status</td>
                        <td className="p-2 text-right">
                          <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                            {selectedIncentiveData.status}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Date-wise Breakdown Table */}
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-3">Daily Sales Breakdown</h5>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="text-left p-2 font-semibold text-gray-700 min-w-[60px]">Date</th>
                            <th className="text-center p-2 font-semibold text-gray-700 min-w-[50px]">Units Sold</th>
                            <th className="text-center p-2 font-semibold text-gray-700 min-w-[60px]">Base Incentive</th>
                            <th className="text-center p-2 font-semibold text-gray-700 min-w-[60px]">Volume Incentive</th>
                            <th className="text-center p-2 font-semibold text-gray-700 min-w-[50px]">Units Fold 7</th>
                            <th className="text-center p-2 font-semibold text-gray-700 min-w-[50px]">Units S25</th>
                            <th className="text-center p-2 font-semibold text-gray-700 min-w-[60px]">Attach Incentive</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="p-2 text-gray-800 font-medium">1 Dec</td>
                            <td className="p-2 text-center text-gray-800">0</td>
                            <td className="p-2 text-center text-gray-800">₹0</td>
                            <td className="p-2 text-center text-gray-800">₹0</td>
                            <td className="p-2 text-center text-gray-800">0</td>
                            <td className="p-2 text-center text-gray-800">0</td>
                            <td className="p-2 text-center text-gray-800">₹0</td>
                          </tr>
                          <tr>
                            <td className="p-2 text-gray-800 font-medium">2 Dec</td>
                            <td className="p-2 text-center text-gray-800">0</td>
                            <td className="p-2 text-center text-gray-800">₹0</td>
                            <td className="p-2 text-center text-gray-800">₹0</td>
                            <td className="p-2 text-center text-gray-800">0</td>
                            <td className="p-2 text-center text-gray-800">0</td>
                            <td className="p-2 text-center text-gray-800">₹0</td>
                          </tr>
                          <tr>
                            <td className="p-2 text-gray-800 font-medium">3 Dec</td>
                            <td className="p-2 text-center text-gray-800">0</td>
                            <td className="p-2 text-center text-gray-800">₹0</td>
                            <td className="p-2 text-center text-gray-800">₹0</td>
                            <td className="p-2 text-center text-gray-800">0</td>
                            <td className="p-2 text-center text-gray-800">0</td>
                            <td className="p-2 text-center text-gray-800">₹0</td>
                          </tr>
                          <tr className="bg-green-50">
                            <td className="p-2 text-gray-800 font-medium">25 Dec</td>
                            <td className="p-2 text-center text-green-800 font-semibold">1</td>
                            <td className="p-2 text-center text-green-800 font-semibold">₹2,200</td>
                            <td className="p-2 text-center text-green-800 font-semibold">₹0</td>
                            <td className="p-2 text-center text-green-800">0</td>
                            <td className="p-2 text-center text-green-800 font-semibold">1</td>
                            <td className="p-2 text-center text-green-800 font-semibold">₹550</td>
                          </tr>
                          <tr className="bg-blue-50 font-semibold">
                            <td className="p-2 text-blue-900">Total</td>
                            <td className="p-2 text-center text-blue-900">1</td>
                            <td className="p-2 text-center text-blue-900">₹2,200</td>
                            <td className="p-2 text-center text-blue-900">₹0</td>
                            <td className="p-2 text-center text-blue-900">0</td>
                            <td className="p-2 text-center text-blue-900">1</td>
                            <td className="p-2 text-center text-blue-900">₹550</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-yellow-800">Note</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        This is estimated data and final confirmation will be from Samsung.
                      </p>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6 pt-4">
              <button
                onClick={() => setShowIncentiveModal(false)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MonthlyIncentiveSection({
  rows,
  transactions,
  allMonths,
  selectedMonth,
  setSelectedMonth,
  selectedFY,
  setSelectedFY,
  allFYs,
  setSelectedIncentiveData,
  setShowIncentiveModal,
}: {
  rows: MonthlySale[];
  transactions: MonthlyTxn[];
  allMonths: string[];
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedFY: string;
  setSelectedFY: (fy: string) => void;
  allFYs: string[];
  setSelectedIncentiveData: (data: any) => void;
  setShowIncentiveModal: (show: boolean) => void;
}) {
  return (
    <>
      {/* Sales Summary */}
      <section className="mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Sales Summary</h2>
        <p className="text-[11px] text-gray-500 mb-2">Your recorded monthly sales</p>

        <div className="flex justify-end mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-600">Month</span>
            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 bg-white"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="All">All Months</option>
              {allMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden text-xs bg-white">
          <div className="grid grid-cols-4 gap-2 bg-gray-50 px-3 py-3 font-semibold text-gray-700">
            <span className="text-left">Date</span>
            <span className="text-center">ADLD</span>
            <span className="text-center">Combo</span>
            <span className="text-center">Units</span>
          </div>
          {rows.map((row, idx) => (
            <div
              key={row.date + idx}
              className="grid grid-cols-4 gap-2 px-3 py-3 border-t border-gray-100 text-gray-800 items-center"
            >
              <span className="text-left font-medium">{row.date}</span>
              <span className="text-center">{row.adld}</span>
              <span className="text-center">{row.combo}</span>
              <span className="text-center font-semibold">{row.units}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Previous Transactions */}
      <section className="mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Previous Transactions</h2>
        <p className="text-[11px] text-gray-500 mb-2">Your recent incentive payments</p>

        <div className="border border-gray-200 rounded-xl overflow-hidden text-xs bg-white">
          <div className="grid grid-cols-4 gap-2 bg-gray-50 px-3 py-3 font-semibold text-gray-700">
            <span className="text-left">Month</span>
            <span className="text-center">Incentive</span>
            <span className="text-center">Status</span>
            <span className="text-center">Date of Payment</span>
          </div>
          {transactions.length === 0 ? (
            <div className="px-3 py-4 text-center text-gray-500 text-xs">
              No transactions found
            </div>
          ) : (
            transactions.map((row) => (
            <div
              key={row.month}
              className="grid grid-cols-4 gap-2 px-3 py-3 border-t border-gray-100 text-gray-800 items-center"
            >
              <span className="text-left font-medium">{row.month}</span>
              <div className="text-center flex items-center justify-center gap-1">
                <span className="font-semibold text-gray-900">{row.incentive}</span>
                <button
                  type="button"
                  className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold hover:bg-blue-200 transition-colors"
                  title="View incentive calculation details"
                  onClick={() => {
                    setSelectedIncentiveData({
                      month: row.month,
                      incentive: row.incentive,
                      units: row.units,
                      status: row.status
                    });
                    setShowIncentiveModal(true);
                  }}
                >
                  i
                </button>
              </div>
              <span className="text-center">
                <span className="text-[10px] font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                  Accumulated
                </span>
              </span>
              <span className="text-center text-[11px] text-gray-600">
                {row.paymentDate || '--'}
              </span>
            </div>
            ))
          )}
        </div>
      </section>

      {/* FY Dropdown */}
      <section className="mb-3">
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-600">Financial Year</span>
            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 bg-white"
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
            >
              {allFYs.map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </>
  );
}

function SpotIncentiveSection({
  rows,
  transactions,
  allMonths,
  selectedMonth,
  setSelectedMonth,
  selectedFY,
  setSelectedFY,
  allFYs,
}: {
  rows: MonthlySale[];
  transactions: SpotVoucher[];
  allMonths: string[];
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedFY: string;
  setSelectedFY: (fy: string) => void;
  allFYs: string[];
}) {
  return (
    <>
      {/* Sales Summary (same table as monthly top) */}
      <section className="mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Sales Summary</h2>
        <p className="text-[11px] text-gray-500 mb-2">Your recorded monthly sales</p>

        <div className="flex justify-end mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-600">Month</span>
            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 bg-white"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="All">All Months</option>
              {allMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden text-xs bg-white">
          <div className="grid grid-cols-4 gap-2 bg-gray-50 px-3 py-3 font-semibold text-gray-700">
            <span className="text-left">Date</span>
            <span className="text-center">ADLD</span>
            <span className="text-center">Combo</span>
            <span className="text-center">Units</span>
          </div>
          {rows.map((row, idx) => (
            <div
              key={row.date + idx}
              className="grid grid-cols-4 gap-2 px-3 py-3 border-t border-gray-100 text-gray-800 items-center"
            >
              <span className="text-left font-medium">{row.date}</span>
              <span className="text-center">{row.adld}</span>
              <span className="text-center">{row.combo}</span>
              <span className="text-center font-semibold">{row.units}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Spot Incentive Voucher Codes */}
      <section className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-[9px]">
            ₹
          </span>
          <h2 className="text-sm font-semibold text-gray-900">
            Spot Incentive Voucher Codes
          </h2>
        </div>
        <p className="text-[11px] text-gray-500 mb-2">Your redeemed incentive vouchers</p>

        <div className="border border-gray-200 rounded-xl overflow-hidden text-xs bg-white">
          <div className="grid grid-cols-5 bg-gray-50 px-3 py-2 font-semibold text-gray-700">
            <span>Date</span>
            <span className="text-center">Device Name</span>
            <span className="text-center">Plan Name</span>
            <span className="text-center">Incentive Earned</span>
            <span className="text-center">Voucher Code</span>
          </div>
          {transactions.length === 0 ? (
            <div className="px-3 py-4 text-center text-gray-500 text-xs">
              No spot incentive transactions found
            </div>
          ) : (
            transactions.map((row, idx) => (
            <div
              key={row.date + idx}
              className="grid grid-cols-5 px-3 py-2 border-t border-gray-100 text-gray-800 items-center"
            >
              <span>{row.date}</span>
              <span className="text-center">{row.deviceName}</span>
              <span className="text-center">{row.planName}</span>
              <span className="text-center text-green-600 font-semibold">{row.incentive}</span>
              <span className="text-center">
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg bg-blue-50 text-[11px] text-blue-700 border border-blue-200"
                >
                  {row.voucherCode}
                </button>
              </span>
            </div>
            ))
          )}
        </div>
      </section>

      {/* FY Dropdown */}
      <section className="mb-3">
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-600">Financial Year</span>
            <select
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 bg-white"
              value={selectedFY}
              onChange={(e) => setSelectedFY(e.target.value)}
            >
              {allFYs.map((fy: string) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </>
  );
}
