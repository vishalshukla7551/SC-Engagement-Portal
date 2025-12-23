'use client';

import { useState } from 'react';
import { FaFileUpload, FaFileExcel, FaFilePdf, FaTrash } from 'react-icons/fa';

type UploadTab = 'questions' | 'documents';

export default function InsertQuestions() {
  const [activeTab, setActiveTab] = useState<UploadTab>('questions');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('General');

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExcelFile(e.target.files?.[0] || null);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfFile(e.target.files?.[0] || null);
  };

  const handleUploadQuestions = () => {
    if (!excelFile) return;
    alert(`Mock: Processing Excel file "${excelFile.name}" and replacing question bank...`);
    setExcelFile(null);
  };

  const handleUploadDocument = () => {
    if (!pdfFile || !docTitle) {
      alert('Please provide both a document title and a PDF file.');
      return;
    }
    alert(`Mock: Uploading document "${docTitle}" as PDF: ${pdfFile.name}`);
    setPdfFile(null);
    setDocTitle('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
          {/* Tab Switcher */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex-1 py-6 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'questions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaFileExcel className="text-lg" />
                <span>Test Questions</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 py-6 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'documents'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaFilePdf className="text-lg" />
                <span>Training Docs</span>
              </div>
            </button>
          </div>

          <div className="p-8 sm:p-10">
            {activeTab === 'questions' ? (
              <div className="animate-in fade-in duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Sync Question Bank</h2>
                  <p className="text-gray-500 font-medium italic">Upload an Excel file to update the SEC certification test questions.</p>
                </div>

                <div className="bg-blue-50/10 border-2 border-dashed border-blue-100 rounded-[1.5rem] p-6 mb-8">
                  <h3 className="font-black text-blue-900 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                    Instructions
                  </h3>
                  <ul className="text-xs text-blue-800 font-bold space-y-2">
                    <li className="flex items-center gap-2"> Format: .xlsx or .xls</li>
                    <li className="flex items-center gap-2"> Required columns: questionId, question, option1-4, correctAnswer, category</li>
                  </ul>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center transition-all hover:border-blue-400 hover:bg-blue-50/10 group">
                  <FaFileExcel className="text-5xl text-gray-200 mx-auto mb-6 group-hover:text-blue-600 transition-colors" />

                  {excelFile ? (
                    <div className="space-y-4">
                      <p className="font-bold text-gray-900 truncate max-w-xs mx-auto">{excelFile.name}</p>
                      <button onClick={() => setExcelFile(null)} className="text-red-500 font-black text-[10px] uppercase">Remove</button>
                    </div>
                  ) : (
                    <label className="cursor-pointer inline-block bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-blue-700 transition-all">
                      Select Excel File
                      <input type="file" accept=".xlsx,.xls" onChange={handleExcelChange} className="hidden" />
                    </label>
                  )}
                </div>

                {excelFile && (
                  <button onClick={handleUploadQuestions} className="w-full mt-8 bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em]">
                    Upload and Sync
                  </button>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Upload PDFs</h2>
                  <p className="text-gray-500 font-medium italic">Add training guides for SEC users.</p>
                </div>

                <div className="space-y-6 mb-8">
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Document Title"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white transition-all text-sm font-bold outline-none"
                  />
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white transition-all text-sm font-bold outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Product">Product Details</option>
                    <option value="Sales">Sales Scripts</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center transition-all hover:border-red-400 hover:bg-red-50/10 group">
                  <FaFilePdf className="text-5xl text-gray-200 mx-auto mb-6 group-hover:text-red-600 transition-colors" />

                  {pdfFile ? (
                    <div className="space-y-4">
                      <p className="font-bold text-gray-900 truncate max-w-xs mx-auto">{pdfFile.name}</p>
                      <button onClick={() => setPdfFile(null)} className="text-gray-400 hover:text-red-700 font-black text-[10px] uppercase">Replace</button>
                    </div>
                  ) : (
                    <label className="cursor-pointer inline-block bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-red-700 transition-all">
                      Select PDF File
                      <input type="file" accept=".pdf" onChange={handlePdfChange} className="hidden" />
                    </label>
                  )}
                </div>

                {pdfFile && (
                  <button onClick={handleUploadDocument} className="w-full mt-8 bg-red-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em]">
                    Upload PDF
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
