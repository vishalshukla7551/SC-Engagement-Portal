'use client';

import { useState } from 'react';
import { FaUpload, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaRedo, FaFileExcel } from 'react-icons/fa';

interface ProcessResult {
  summary: {
    total: number;
    updated: number;
    skipped: number;
    notFound: number;
    failed: number;
  };
  details: {
    success: Array<{ imei: string; voucherCode: string }>;
    skipped: Array<{ imei: string; voucherCode: string; reason: string }>;
    notFound: Array<{ imei: string }>;
    failed: Array<{ imei: string; voucherCode: string; reason: string }>;
  };
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl p-5 flex flex-col gap-2 border ${color}`}>
      <div className="flex items-center gap-2 text-sm font-medium opacity-80">
        {icon}
        {label}
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

export default function ProcessVoucherExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/zopper-administrator/process-voucher-excel', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Process Voucher Excel</h1>
          <p className="text-neutral-400 text-sm">
            Bulk-assign voucher codes to spot incentive records via the exported Excel file.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-950/50 border border-blue-700/40 rounded-xl p-5">
          <h3 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
            <FaFileExcel className="text-green-400" />
            How it works
          </h3>
          <ol className="text-sm text-blue-200 space-y-2 list-decimal ml-5">
            <li>
              Go to{' '}
              <a
                href="/Zopper-Administrator/spot-incentive-report"
                className="underline text-blue-300 hover:text-white"
              >
                Spot Incentive Report
              </a>{' '}
              and click <strong>Export</strong> to download the Excel.
            </li>
            <li>
              Fill in the <strong>&quot;Voucher Code&quot;</strong> column for the pending records you
              want to pay out. Leave other rows blank.
            </li>
            <li>Upload the filled Excel here — the system will auto-update the database.</li>
          </ol>
        </div>

        {/* Upload area (hidden after results) */}
        {!result && (
          <div className="bg-neutral-900 border-2 border-dashed border-neutral-700 rounded-xl p-10 text-center space-y-5 hover:border-blue-500 transition-colors">
            <FaUpload className="mx-auto text-4xl text-neutral-500" />
            <p className="text-neutral-400 text-sm">Only .xlsx and .xls files are accepted</p>

            <label className="cursor-pointer inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-lg">
              Select Excel File
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {file && (
              <p className="text-sm text-emerald-400 font-medium">
                ✓ {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}

            {error && (
              <p className="text-sm text-red-400 bg-red-950/40 border border-red-700/40 rounded-lg px-4 py-2">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Submit button */}
        {file && !result && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-lg text-sm"
          >
            {loading ? 'Processing…' : `Process "${file.name}"`}
          </button>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                label="Total Rows"
                value={result.summary.total}
                color="bg-slate-800 border-slate-700 text-white"
                icon={<FaFileExcel />}
              />
              <StatCard
                label="Updated"
                value={result.summary.updated}
                color="bg-emerald-950/60 border-emerald-700/50 text-emerald-300"
                icon={<FaCheckCircle />}
              />
              <StatCard
                label="Not Found"
                value={result.summary.notFound}
                color="bg-amber-950/60 border-amber-700/50 text-amber-300"
                icon={<FaExclamationCircle />}
              />
              <StatCard
                label="Failed"
                value={result.summary.failed}
                color="bg-red-950/60 border-red-700/50 text-red-300"
                icon={<FaTimesCircle />}
              />
            </div>

            {/* Skipped note */}
            {result.summary.skipped > 0 && (
              <div className="text-sm text-neutral-400 bg-neutral-800/60 border border-neutral-700 rounded-lg px-4 py-2">
                ℹ️ <strong className="text-neutral-200">{result.summary.skipped}</strong> row(s)
                already had the same voucher code assigned — skipped (no change).
              </div>
            )}

            {/* ✅ Success table */}
            {result.details.success.length > 0 && (
              <div className="bg-white rounded-xl overflow-hidden shadow">
                <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-3 flex items-center gap-2">
                  <FaCheckCircle className="text-emerald-600" />
                  <h3 className="font-semibold text-emerald-800 text-sm">
                    Updated ({result.details.success.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">#</th>
                        <th className="px-4 py-2 text-left font-medium">IMEI</th>
                        <th className="px-4 py-2 text-left font-medium">Voucher Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {result.details.success.map((row, i) => (
                        <tr key={i} className="hover:bg-neutral-50">
                          <td className="px-4 py-2 text-neutral-400">{i + 1}</td>
                          <td className="px-4 py-2 font-mono text-neutral-700">{row.imei}</td>
                          <td className="px-4 py-2 font-mono text-emerald-700 font-semibold">
                            {row.voucherCode}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ⚠️ Not Found table */}
            {result.details.notFound.length > 0 && (
              <div className="bg-white rounded-xl overflow-hidden shadow">
                <div className="bg-amber-50 border-b border-amber-100 px-5 py-3 flex items-center gap-2">
                  <FaExclamationCircle className="text-amber-500" />
                  <h3 className="font-semibold text-amber-800 text-sm">
                    Not Found ({result.details.notFound.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">#</th>
                        <th className="px-4 py-2 text-left font-medium">IMEI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {result.details.notFound.map((row, i) => (
                        <tr key={i} className="hover:bg-neutral-50">
                          <td className="px-4 py-2 text-neutral-400">{i + 1}</td>
                          <td className="px-4 py-2 font-mono text-neutral-700">{row.imei}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ❌ Failed table */}
            {result.details.failed.length > 0 && (
              <div className="bg-white rounded-xl overflow-hidden shadow">
                <div className="bg-red-50 border-b border-red-100 px-5 py-3 flex items-center gap-2">
                  <FaTimesCircle className="text-red-500" />
                  <h3 className="font-semibold text-red-800 text-sm">
                    Failed ({result.details.failed.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">#</th>
                        <th className="px-4 py-2 text-left font-medium">IMEI</th>
                        <th className="px-4 py-2 text-left font-medium">Voucher Code</th>
                        <th className="px-4 py-2 text-left font-medium">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {result.details.failed.map((row, i) => (
                        <tr key={i} className="hover:bg-neutral-50">
                          <td className="px-4 py-2 text-neutral-400">{i + 1}</td>
                          <td className="px-4 py-2 font-mono text-neutral-700">{row.imei}</td>
                          <td className="px-4 py-2 font-mono text-neutral-600">{row.voucherCode || '—'}</td>
                          <td className="px-4 py-2 text-red-600">{row.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reset button */}
            <button
              onClick={reset}
              className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold rounded-xl transition-colors border border-neutral-700"
            >
              <FaRedo size={12} />
              Process Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
