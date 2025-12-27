'use client';

import * as XLSX from 'xlsx';

const mockReferrals = [
  { id: '1', referrerPhone: '9876543210', refereePhone: '9876543211', status: 'joined', createdAt: '2025-01-15T10:30:00Z' },
  { id: '2', referrerPhone: '9876543212', refereePhone: '9876543213', status: 'report_submitted', createdAt: '2025-01-14T14:20:00Z', referrerVoucher: 'VOUCH123', refereeVoucher: 'VOUCH124' }
];

export default function ViewReferralsPage() {
  const exportExcel = () => {
    const data = mockReferrals.map(r => ({
      'Referrer Phone': r.referrerPhone,
      'Referee Phone': r.refereePhone,
      'Status': r.status,
      'Created At': new Date(r.createdAt).toLocaleString(),
      'Referrer Voucher': r.referrerVoucher || '',
      'Referee Voucher': r.refereeVoucher || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Referrals');
    XLSX.writeFile(wb, `referrals-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={exportExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Export to Excel
        </button>
      </div>
      <div className="bg-white border rounded-xl overflow-x-auto shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left font-bold text-black">Referrer Phone</th>
              <th className="p-3 text-left font-bold text-black">Referee Phone</th>
              <th className="p-3 text-left font-bold text-black">Status</th>
              <th className="p-3 text-left font-bold text-black">Vouchers</th>
              <th className="p-3 text-left font-bold text-black">Created</th>
            </tr>
          </thead>
          <tbody>
            {mockReferrals.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono font-bold text-black">{r.referrerPhone}</td>
                <td className="p-3 font-mono font-bold text-black">{r.refereePhone}</td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                    {r.status}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs font-bold text-black">{r.referrerVoucher || '—'} / {r.refereeVoucher || '—'}</td>
                <td className="p-3 text-black font-bold">{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
