'use client';

import { useState } from 'react';
import { FaUpload } from 'react-icons/fa';

export default function ProcessVouchersPage() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📝 Instructions:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal ml-4">
          <li>Export Excel from View Referrals tab</li>
          <li>Add voucher codes in "Referrer Voucher" and "Referee Voucher" columns</li>
          <li>Upload the modified file here</li>
        </ol>
      </div>

      <div className="bg-white rounded-xl shadow p-8">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
          <label className="cursor-pointer inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Select Excel File
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={e => setFile(e.target.files?.[0] || null)} 
              className="hidden" 
            />
          </label>
          {file && (
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-medium">Selected: {file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        {file && (
          <button 
            onClick={() => alert('Mock: Processing referral vouchers')} 
            className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Process File
          </button>
        )}
      </div>
    </div>
  );
}
