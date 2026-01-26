'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaSignOutAlt, FaSpinner, FaCheckDouble, FaTrashAlt, FaCheckSquare, FaSquare, FaUpload, FaTimes } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { clientLogout } from '@/lib/clientLogout';

interface SpotIncentiveReport {
  id: string;
  createdAt: string;
  submittedAt: string;
  imei: string;
  planPrice: number;
  incentiveEarned: number;
  isPaid: boolean;
  paidAt?: string;
  voucherCode: string;
  isCompaignActive: boolean;
  secUser: {
    secId: string;
    phone: string;
    name: string;
  };
  store: {
    id: string;
    storeName: string;
    city: string;
  };
  samsungSKU: {
    id: string;
    Category: string;
    ModelName: string;
  };
  plan: {
    id: string;
    planType: string;
    price: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: {
    reports: SpotIncentiveReport[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    summary: {
      totalReports: number;
      activeStores: number;
      activeSECs: number;
      totalIncentiveEarned: number;
      totalIncentivePaid: number;
      totalIncentivePending: number;
    };
    filters: {
      stores: Array<{ id: string; name: string; city: string }>;
      planTypes: string[];
    };
  };
}

function formatDateWithTime(ts: string) {
  const [date, time] = ts.split(' ');
  const [y, m, d] = date.split('-');
  return { date: `${d}-${m}-${y}`, time };
}

function StatCard({ title, value }: { title: string; value: string }) {
  const gradientMap: Record<string, string> = {
    'Active Stores': 'from-indigo-600 to-purple-600 shadow-[0_10px_40px_rgba(79,70,229,0.4)]',
    'SECs Active': 'from-emerald-600 to-teal-600 shadow-[0_10px_40px_rgba(16,185,129,0.4)]',
    'Reports Submitted': 'from-blue-600 to-cyan-600 shadow-[0_10px_40px_rgba(37,99,235,0.4)]',
    'Incentive Earned': 'from-amber-500 to-orange-600 shadow-[0_10px_40px_rgba(245,158,11,0.4)]',
    'Incentive Paid': 'from-rose-600 to-pink-600 shadow-[0_10px_40px_rgba(244,63,94,0.4)]',
  };

  const gradient = gradientMap[title] || 'from-slate-700 to-slate-900 shadow-[0_10px_40px_rgba(15,23,42,0.5)]';

  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 md:p-6 text-white transition-transform hover:translate-y-[-1px]`}
    >
      <div className="text-xs md:text-sm text-slate-100/80 mb-1">{title}</div>
      <div className="text-2xl md:text-3xl font-bold leading-tight">{value}</div>
    </div>
  );
}

export default function SpotIncentiveReport() {
  const [query, setQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [startDate, setStartDate] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // API state
  const [data, setData] = useState<ApiResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Import State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const toggleSelectAll = () => {
    // Only select unpaid reports
    const unpaidReports = reports.filter(r => !r.isPaid);

    if (selectedIds.size === unpaidReports.length && unpaidReports.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(unpaidReports.map(r => r.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkAction = async (action: 'approve' | 'discard') => {
    if (selectedIds.size === 0) return;

    // For approve action, filter out already paid reports
    let idsToProcess = Array.from(selectedIds);
    let alreadyPaidCount = 0;

    if (action === 'approve') {
      const unpaidIds: string[] = [];
      selectedIds.forEach(id => {
        const report = reports.find(r => r.id === id);
        if (report) {
          if (report.isPaid) {
            alreadyPaidCount++;
          } else {
            unpaidIds.push(id);
          }
        }
      });
      idsToProcess = unpaidIds;

      if (unpaidIds.length === 0) {
        alert('All selected reports are already approved/paid. No action needed.');
        return;
      }

      if (alreadyPaidCount > 0) {
        if (!confirm(`${alreadyPaidCount} report(s) are already paid and will be skipped.\n\nDo you want to approve the remaining ${unpaidIds.length} unpaid report(s)?`)) {
          return;
        }
      } else {
        if (!confirm(`Are you sure you want to approve ${unpaidIds.length} selected report(s)?`)) {
          return;
        }
      }
    } else {
      // For discard action, confirm normally
      if (!confirm(`Are you sure you want to discard/delete ${idsToProcess.length} selected reports?`)) {
        return;
      }
    }

    try {
      setBulkActionLoading(true);
      const response = await fetch('/api/zopper-administrator/spot-incentive-report/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: idsToProcess,
          action
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        let message = result.message;
        if (action === 'approve' && alreadyPaidCount > 0) {
          message += `\n\n${alreadyPaidCount} already-paid report(s) were skipped.`;
        }
        alert(message);
        setSelectedIds(new Set()); // Clear selection
        fetchData(); // Refresh data
      } else {
        alert(result.error || `Failed to ${action} reports`);
      }
    } catch (error) {
      console.error(`Error processing bulk ${action}:`, error);
      alert(`Error processing bulk ${action}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle Mark Paid action
  const handleMarkPaid = async (reportId: string) => {
    try {
      const response = await fetch(`/api/zopper-administrator/spot-incentive-report/${reportId}/mark-paid`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh data after successful action
        fetchData();
      } else {
        alert('Failed to mark as paid');
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Error marking as paid');
    }
  };

  // Handle Discard action
  const handleDiscard = async (reportId: string) => {
    if (confirm('Are you sure you want to discard this report?')) {
      try {
        const response = await fetch(`/api/zopper-administrator/spot-incentive-report/${reportId}/discard`, {
          method: 'POST',
        });

        if (response.ok) {
          // Refresh data after successful action
          fetchData();
        } else {
          alert('Failed to discard report');
        }
      } catch (error) {
        console.error('Error discarding report:', error);
        alert('Error discarding report');
      }
    }
  };

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });

      if (query) params.append('search', query);
      if (storeFilter) params.append('storeId', storeFilter);
      if (planFilter) params.append('planType', planFilter);
      if (paymentFilter !== 'all') params.append('paymentStatus', paymentFilter);
      if (startDate) {
        params.append('startDate', startDate);
        params.append('endDate', startDate);
      }

      const response = await fetch(`/api/zopper-administrator/spot-incentive-report?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.details || errorData.error || `Failed to fetch data (${response.status})`);
      }

      const result: ApiResponse = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error('API returned error');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [page, query, storeFilter, planFilter, paymentFilter, startDate]);

  // Reset page and selection when filters change
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [query, storeFilter, planFilter, paymentFilter, startDate]);

  const reports = data?.reports || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, hasNext: false, hasPrev: false };
  const summary = data?.summary || { activeStores: 0, activeSECs: 0, totalReports: 0, totalIncentiveEarned: 0, totalIncentivePaid: 0 };
  const filters = data?.filters || { stores: [], planTypes: [] };

  const exportExcel = async () => {
    try {
      // Show loading state
      setLoading(true);

      // Build params with current filters but fetch ALL data (no pagination limit)
      const params = new URLSearchParams({
        page: '1',
        limit: '999999', // Large number to get all records
      });

      if (query) params.append('search', query);
      if (storeFilter) params.append('storeId', storeFilter);
      if (planFilter) params.append('planType', planFilter);
      if (paymentFilter !== 'all') params.append('paymentStatus', paymentFilter);
      if (startDate) {
        params.append('startDate', startDate);
        params.append('endDate', startDate);
      }

      // Fetch all data
      const response = await fetch(`/api/zopper-administrator/spot-incentive-report?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch data for export');
      }

      const result: ApiResponse = await response.json();

      if (!result.success || !result.data.reports) {
        throw new Error('No data available for export');
      }

      const allReports = result.data.reports;

      // Transform data for Excel
      const exportData = allReports.map(report => ({
        'Report ID': report.id,
        'SEC ID': report.secUser.secId || 'Not Set',
        'SEC Phone': report.secUser.phone,
        'SEC Name': report.secUser.name || 'Not Set',
        'Store Name': report.store.storeName,
        'Store City': report.store.city,
        'Device Category': report.samsungSKU.Category,
        'Device Model': report.samsungSKU.ModelName,
        'Plan Type': report.plan.planType.replace(/_/g, ' '),
        'Plan Price': `₹${report.planPrice}`,
        'IMEI': report.imei,
        'Incentive Earned': `₹${report.incentiveEarned}`,
        'Payment Status': report.isPaid ? 'Paid' : 'Pending',
        'Submitted Date': formatDateWithTime(report.submittedAt).date,
        'Submitted Time': formatDateWithTime(report.submittedAt).time,
        'Voucher Code': report.voucherCode || '',
        'Campaign Active': report.isCompaignActive ? 'Yes' : 'No',
        'Paid Date': report.paidAt ? formatDateWithTime(report.paidAt).date : '',
        'Action Required': report.isPaid ? 'None' : 'Mark Paid Available',
        'Approved': report.isPaid ? 'Already Approved' : '' // Show status for already approved sales
      }));

      // Create and download Excel file
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Spot Incentive Report');
      XLSX.writeFile(wb, `spot-incentive-report-${new Date().toISOString().split('T')[0]}.xlsx`);

      alert(`Successfully exported ${allReports.length} reports!`);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportLoading(true);
      setImportResult(null);
      setImportModalOpen(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/zopper-administrator/spot-incentive-report/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setImportResult(result);
        // Refresh data after successful import
        fetchData();
      } else {
        setImportResult({
          success: false,
          error: result.error || 'Failed to import file'
        });
      }
    } catch (error) {
      console.error('Error importing file:', error);
      setImportResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setImportLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
      <div className="w-full space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-3">Spot Incentive Report</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-sm text-neutral-400">
                Paid: {reports.filter(r => r.isPaid).length} | Unpaid: {
                  reports.filter(r => !r.isPaid).length
                }
              </p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => clientLogout('/login/role', false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-lg"
          >
            <FaSignOutAlt size={12} />
            Logout
          </button>
        </header>

        {/* Key metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Active Stores" value={summary.activeStores.toString()} />
          <StatCard title="SECs Active" value={summary.activeSECs.toString()} />
          <StatCard title="Reports Submitted" value={summary.totalReports.toString()} />
          <StatCard title="Incentive Earned" value={`₹${summary.totalIncentiveEarned.toLocaleString('en-IN')}`} />
          <StatCard title="Incentive Paid" value={`₹${summary.totalIncentivePaid.toLocaleString('en-IN')}`} />
        </section>

        {/* Filters */}
        <section className="flex flex-wrap items-center gap-3">
          <input
            className="flex-1 min-w-[220px] px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search SEC / Store / Device / IMEI"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            type="date"
            className="px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            placeholder="Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <select
            className="appearance-none bg-neutral-900 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-neutral-800"
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
          >
            <option value="">All Stores</option>
            {filters.stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name} - {store.city}
              </option>
            ))}
          </select>
          <select
            className="appearance-none bg-neutral-900 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-neutral-800"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="">All Plans</option>
            {filters.planTypes.map((planType) => (
              <option key={planType} value={planType}>
                {planType.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select
            className="appearance-none bg-neutral-900 border border-neutral-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-neutral-800"
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(e.target.value as 'all' | 'paid' | 'unpaid')
            }
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <button
            onClick={exportExcel}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-[0_10px_30px_rgba(16,185,129,0.4)]"
          >
            <FaDownload size={14} />
            Export
          </button>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-[0_10px_30px_rgba(37,99,235,0.4)] cursor-pointer">
            <FaUpload size={14} />
            Import
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </section>

        {/* Bulk Actions Bar - Only visible when items selected */}
        {selectedIds.size > 0 && (
          <div className="bg-indigo-900/40 border border-indigo-500/30 rounded-lg p-3 flex items-center justify-between mb-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {selectedIds.size} Selected
              </span>
              <span className="text-sm text-indigo-200">
                rows selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('approve')}
                disabled={bulkActionLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors"
              >
                {bulkActionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckDouble />}
                Approve Selected
              </button>
              <button
                onClick={() => handleBulkAction('discard')}
                disabled={bulkActionLoading}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors"
              >
                {bulkActionLoading ? <FaSpinner className="animate-spin" /> : <FaTrashAlt />}
                Discard Selected
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr className="text-left">
                  <th className="p-2 md:p-3 w-[40px]">
                    <button
                      onClick={toggleSelectAll}
                      className="text-neutral-500 hover:text-indigo-600 transition-colors"
                      title={
                        reports.filter(r => !r.isPaid).length === 0
                          ? "No unpaid reports to select"
                          : selectedIds.size === reports.filter(r => !r.isPaid).length
                            ? "Deselect All Unpaid"
                            : "Select All Unpaid"
                      }
                    >
                      {reports.filter(r => !r.isPaid).length > 0 && selectedIds.size === reports.filter(r => !r.isPaid).length ? (
                        <FaCheckSquare size={16} className="text-indigo-600" />
                      ) : (
                        <FaSquare size={16} />
                      )}
                    </button>
                  </th>
                  <th className="p-2 md:p-3 text-neutral-600 text-xs font-medium uppercase tracking-wider w-[120px]">
                    Timestamp
                  </th>
                  <th className="p-2 md:p-3 text-neutral-600 text-xs font-medium uppercase tracking-wider w-[160px]">
                    Date of Sale
                  </th>
                  <th className="p-2 md:p-3 text-neutral-600 text-xs font-medium uppercase tracking-wider w-[100px]">
                    SEC Name
                  </th>
                  <th className="p-2 md:p-3 text-neutral-600 text-xs font-medium uppercase tracking-wider">
                    Device Name
                  </th>
                  <th className="p-2 md:p-3 text-neutral-600 text-xs font-medium uppercase tracking-wider w-[120px]">
                    Plan Type
                  </th>
                  <th className="p-2 md:p-3 text-neutral-600 text-xs font-medium uppercase tracking-wider w-[140px]">
                    IMEI
                  </th>
                  <th className="p-2 md:p-3 text-neutral-600 text-xs font-medium uppercase tracking-wider w-[100px]">
                    Incentive
                  </th>
                  <th className="p-2 md:p-3 text-neutral-600 text-xs font-medium uppercase tracking-wider w-[80px]">
                    Status
                  </th>
                  <th className="p-2 md:p-3 text-neutral-600 text-xs font-medium uppercase tracking-wider w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-neutral-500">
                      <FaSpinner className="animate-spin mx-auto mb-2" size={20} />
                      Loading reports...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-neutral-500">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((r: SpotIncentiveReport) => (
                    <tr key={r.id} className="hover:bg-neutral-50 transition">
                      <td className="p-2 md:p-3">
                        <button
                          onClick={() => toggleSelectRow(r.id)}
                          disabled={r.isPaid}
                          className={`transition-colors block ${r.isPaid
                            ? 'text-neutral-300 cursor-not-allowed'
                            : 'text-neutral-400 hover:text-indigo-600'
                            }`}
                          title={r.isPaid ? 'Already approved - cannot select' : 'Select this report'}
                        >
                          {selectedIds.has(r.id) ? (
                            <FaCheckSquare size={16} className="text-indigo-600" />
                          ) : (
                            <FaSquare size={16} />
                          )}
                        </button>
                      </td>
                      <td className="p-2 md:p-3 text-neutral-900 text-sm">
                        <div className="text-xs">{formatDateWithTime(r.createdAt).date}</div>
                        <div className="text-neutral-500 text-xs">
                          {formatDateWithTime(r.createdAt).time}
                        </div>
                      </td>
                      <td className="p-2 md:p-3 text-neutral-700 text-sm whitespace-nowrap">
                        <div className="text-xs">{formatDateWithTime(r.submittedAt).date}</div>
                        <div className="text-neutral-500 text-xs">
                          {formatDateWithTime(r.submittedAt).time}
                        </div>
                      </td>
                      <td className="p-2 md:p-3 text-neutral-900 text-sm font-medium">
                        <div className="truncate">{r.secUser.name || 'Not Set'}</div>
                        <div className="text-neutral-500 text-xs">{r.store.storeName}</div>
                        <div className="text-neutral-500 text-xs">{r.secUser.phone}</div>
                      </td>
                      <td className="p-2 md:p-3 text-neutral-700 text-sm">
                        <div className="truncate">{r.samsungSKU.ModelName}</div>
                      </td>
                      <td className="p-2 md:p-3 text-neutral-700 text-xs">
                        <div className="truncate">{r.plan.planType.replace(/_/g, ' ')}</div>
                        <div className="text-neutral-500 text-xs">₹{r.plan.price}</div>
                      </td>
                      <td className="p-2 md:p-3 text-neutral-500 text-xs font-mono">
                        <div className="truncate">{r.imei}</div>
                      </td>
                      <td className="p-2 md:p-3 text-emerald-600 text-sm font-semibold">
                        ₹{r.incentiveEarned}
                      </td>
                      <td className="p-2 md:p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${r.isPaid
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                            }`}
                        >
                          {r.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-2 md:p-3">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMarkPaid(r.id)}
                            disabled={r.isPaid}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${r.isPaid
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDiscard(r.id)}
                            className="px-2 py-1 rounded text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4 text-sm text-neutral-200">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
              className="px-3 py-1 border border-neutral-700 rounded-lg disabled:opacity-40 text-neutral-100 bg-neutral-900 hover:bg-neutral-800"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasNext}
              className="px-3 py-1 border border-neutral-700 rounded-lg disabled:opacity-40 text-neutral-100 bg-neutral-900 hover:bg-neutral-800"
            >
              Next
            </button>
          </div>
        )}

        {/* Import Modal */}
        {importModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-900">Import Results</h2>
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6">
                {importLoading ? (
                  <div className="text-center py-12">
                    <FaSpinner className="animate-spin mx-auto mb-4 text-blue-600" size={40} />
                    <p className="text-neutral-600">Processing Excel file...</p>
                  </div>
                ) : importResult ? (
                  <div>
                    {importResult.success ? (
                      <div>
                        {/* Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-xs text-blue-600 font-medium mb-1">Total Rows</div>
                            <div className="text-2xl font-bold text-blue-900">{importResult.summary.total}</div>
                          </div>
                          <div className="bg-emerald-50 rounded-lg p-4">
                            <div className="text-xs text-emerald-600 font-medium mb-1">Approved</div>
                            <div className="text-2xl font-bold text-emerald-900">{importResult.summary.approved}</div>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4">
                            <div className="text-xs text-amber-600 font-medium mb-1">Skipped</div>
                            <div className="text-2xl font-bold text-amber-900">{importResult.summary.skipped}</div>
                          </div>
                          <div className="bg-red-50 rounded-lg p-4">
                            <div className="text-xs text-red-600 font-medium mb-1">Errors</div>
                            <div className="text-2xl font-bold text-red-900">{importResult.summary.errors + importResult.summary.notFound}</div>
                          </div>
                        </div>

                        {/* Details */}
                        {importResult.details && importResult.details.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-neutral-900 mb-3">Processing Details</h3>
                            <div className="max-h-96 overflow-y-auto border border-neutral-200 rounded-lg">
                              <table className="w-full">
                                <thead className="bg-neutral-50 sticky top-0">
                                  <tr>
                                    <th className="text-left p-3 text-xs font-medium text-neutral-600">Report ID</th>
                                    <th className="text-left p-3 text-xs font-medium text-neutral-600">Status</th>
                                    <th className="text-left p-3 text-xs font-medium text-neutral-600">Message</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                  {importResult.details.map((detail: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-neutral-50">
                                      <td className="p-3 text-sm text-neutral-900 font-mono">{detail.reportId}</td>
                                      <td className="p-3">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${detail.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                          detail.status === 'skipped' ? 'bg-amber-100 text-amber-700' :
                                            detail.status === 'not_found' ? 'bg-orange-100 text-orange-700' :
                                              'bg-red-100 text-red-700'
                                          }`}>
                                          {detail.status.replace('_', ' ')}
                                        </span>
                                      </td>
                                      <td className="p-3 text-sm text-neutral-600">{detail.message}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                          <FaTimes className="text-red-600" size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Import Failed</h3>
                        <p className="text-neutral-600">{importResult.error}</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 p-6">
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="w-full px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
