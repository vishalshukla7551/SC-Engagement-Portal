'use client';

import { useState } from 'react';
import { FaFileUpload, FaFileExcel, FaFilePdf, FaTrash, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import * as XLSX from 'xlsx';

type UploadTab = 'questions' | 'documents';

export default function InsertQuestionsPage() {
  const [activeTab, setActiveTab] = useState<UploadTab>('questions');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [testType, setTestType] = useState('CERTIFICATION');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExcelFile(e.target.files?.[0] || null);
    setStatus(null);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfFile(e.target.files?.[0] || null);
    setStatus(null);
  };

  const handleUploadQuestions = async () => {
    if (!excelFile) return;
    setLoading(true);
    setStatus(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        if (json.length === 0) {
          throw new Error('Excel sheet is empty');
        }

        // Validate structure
        const firstRow = json[0] as any;
        const required = ['questionId', 'question', 'correctAnswer'];
        const missing = required.filter(key => !(key in firstRow));

        if (missing.length > 0) {
          throw new Error(`Missing columns: ${missing.join(', ')}`);
        }

        const response = await fetch('/api/admin/questions/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questions: json, testType: testType })
        });

        const result = await response.json();
        if (result.success) {
          setStatus({ type: 'success', message: `Successfully synced ${result.count} questions!` });
          setExcelFile(null);
        } else {
          throw new Error(result.message);
        }
      } catch (err: any) {
        setStatus({ type: 'error', message: err.message || 'Failed to process file' });
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setStatus({ type: 'error', message: 'Failed to read file' });
      setLoading(false);
    };
    reader.readAsBinaryString(excelFile);
  };

  const handleUploadDocument = async () => {
    if (!pdfFile || !docTitle) {
      alert('Please provide both a document title and a PDF file.');
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch('/api/admin/training/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          testType: testType,
          size: `${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB`
        })
      });

      const result = await response.json();
      if (result.success) {
        setStatus({ type: 'success', message: `Document "${docTitle}" synced successfully!` });
        setPdfFile(null);
        setDocTitle('');
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to upload document' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
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

              <div className="bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-[1.5rem] p-6 mb-8 flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex-1">
                  <h3 className="font-black text-blue-900 text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">!</span>
                    Sync Instructions
                  </h3>
                  <ul className="grid grid-cols-1 gap-y-2">
                    <li className="text-xs text-blue-800 font-bold flex items-center gap-2">
                      <span className="text-blue-400">•</span> Format: .xlsx / .xls
                    </li>
                    <li className="text-xs text-blue-800 font-bold flex items-center gap-2">
                      <span className="text-blue-400">•</span> Sequential ID (1, 2, 3...)
                    </li>
                    <li className="text-xs text-blue-800 font-bold flex items-center gap-2">
                      <span className="text-blue-400">•</span> Columns: question, option1, option2...
                    </li>
                  </ul>
                </div>

                <div className="w-full sm:w-64 bg-white/50 p-4 rounded-2xl border border-blue-100">
                  <label className="block text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">Target Bank ID</label>
                  <input
                    type="text"
                    value={testType}
                    onChange={(e) => setTestType(e.target.value.toUpperCase())}
                    placeholder="e.g. CERTIFICATION"
                    className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:border-blue-600 transition-all text-xs font-black outline-none"
                  />
                </div>
              </div>

              {status && (
                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                  {status.type === 'success' ? <FaCheckCircle /> : <FaTrash />}
                  <p className="text-xs font-black uppercase tracking-widest">{status.message}</p>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center transition-all hover:border-blue-400 hover:bg-blue-50/10 group">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors">
                  <FaFileExcel className="text-4xl text-gray-300 group-hover:text-blue-600" />
                </div>

                {excelFile ? (
                  <div className="space-y-4">
                    <div className="inline-block px-4 py-2 bg-green-50 text-green-700 rounded-full font-black text-[10px] uppercase tracking-widest border border-green-100">
                      File Selected
                    </div>
                    <p className="font-bold text-gray-900 truncate max-w-xs mx-auto">{excelFile.name}</p>
                    <button
                      onClick={() => setExcelFile(null)}
                      className="text-red-500 hover:text-red-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mx-auto"
                    >
                      <FaTrash size={12} /> Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="cursor-pointer inline-block bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 mb-4">
                      Select Excel File
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleExcelChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">or drag and drop here</p>
                  </>
                )}
              </div>

              {excelFile && (
                <button
                  onClick={handleUploadQuestions}
                  disabled={loading}
                  className="w-full mt-8 bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gray-900 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaFileUpload className="text-lg" />}
                  {loading ? 'Processing...' : 'Sync Question Bank'}
                </button>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Upload Training Material</h2>
                <p className="text-gray-500 font-medium italic">Add new PDF guides, brochures, or manuals for SEC users.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Document Title</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. Q4 Sales Brochure"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white transition-all text-sm font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Link to Bank ID</label>
                  <input
                    type="text"
                    value={testType}
                    onChange={(e) => setTestType(e.target.value.toUpperCase())}
                    placeholder="e.g. CERTIFICATION"
                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white transition-all text-sm font-bold outline-none"
                  />
                </div>
              </div>

              {status && (
                <div className={`mb-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                  {status.type === 'success' ? <FaCheckCircle /> : <FaTrash />}
                  <p className="text-xs font-black uppercase tracking-widest">{status.message}</p>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center transition-all hover:border-red-400 hover:bg-red-50/10 group">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-100 transition-colors">
                  <FaFilePdf className="text-4xl text-gray-300 group-hover:text-red-600" />
                </div>

                {pdfFile ? (
                  <div className="space-y-4">
                    <div className="inline-block px-4 py-2 bg-red-50 text-red-700 rounded-full font-black text-[10px] uppercase tracking-widest border border-red-100">
                      PDF Selected
                    </div>
                    <p className="font-bold text-gray-900 truncate max-w-xs mx-auto">{pdfFile.name}</p>
                    <button
                      onClick={() => setPdfFile(null)}
                      className="text-gray-400 hover:text-red-700 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 mx-auto"
                    >
                      <FaTrash size={12} /> Replace File
                    </button>
                  </div>
                ) : (
                  <>
                    <label className="cursor-pointer inline-block bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-100 hover:bg-red-700 transition-all hover:scale-105 active:scale-95 mb-4">
                      Select PDF File
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Format: Portable Document Format (.pdf)</p>
                  </>
                )}
              </div>

              {pdfFile && (
                <button
                  onClick={handleUploadDocument}
                  disabled={loading}
                  className="w-full mt-8 bg-red-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-red-700 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaFileUpload className="text-lg" />}
                  {loading ? 'Processing...' : 'Sync Training Doc'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Resource Management Portal • v2.0</p>
      </div>
    </div>
  );
}
