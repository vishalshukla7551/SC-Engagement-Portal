'use client';

import { useState } from 'react';
import { FaFileUpload, FaInfo, FaCheckCircle, FaTrash, FaSpinner, FaBook, FaPuzzlePiece } from 'react-icons/fa';

export default function InsertQuestionsPage() {
  const [activeTab, setActiveTab] = useState<'questions' | 'training'>('questions');
  const [testType, setTestType] = useState('CERTIFICATION');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Question Bank PDF State
  const [questionPdf, setQuestionPdf] = useState<File | null>(null);

  // Training Documents State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docBankId, setDocBankId] = useState('');

  const handleSyncPdfQuestions = async () => {
    if (!questionPdf) return;
    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', questionPdf);
    formData.append('testType', testType);

    try {
      const response = await fetch('/api/admin/questions/upload-pdf', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        setStatus({ type: 'success', message: `Successfully synced ${result.count} questions from PDF!` });
        setQuestionPdf(null);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Failed to process PDF' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!pdfFile || !docTitle) return;
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/admin/training/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: docTitle,
          testType: docBankId,
          size: `${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus({ type: 'success', message: 'Training document uploaded and quiz test created!' });
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
    <>
      <div className="min-h-screen bg-[#0a0a0b] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight mb-2">Question Bank</h1>
              <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Manage Assessment Content & Documents</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-[#151518] p-2 rounded-[32px] flex gap-2 mb-10 w-fit">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'questions' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-gray-500 hover:text-white'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaPuzzlePiece className="text-lg" />
                <span>Test Questions</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className={`px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'training' ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-gray-500 hover:text-white'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FaBook className="text-lg" />
                <span>Training Docs</span>
              </div>
            </button>
          </div>

          <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-gray-100">
            {activeTab === 'questions' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sync Question Bank</h2>
                    <p className="text-gray-400 text-xs font-bold mt-1">Upload a PDF file to update the SEC certification test questions.</p>
                  </div>
                  <div className="bg-blue-50 px-4 py-2 rounded-xl">
                    <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest">Format: Assessment PDF</span>
                  </div>
                </div>

                <div className="p-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="bg-blue-50/50 rounded-3xl p-8 border-2 border-dashed border-blue-100">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                            <FaInfo size={14} />
                          </div>
                          <h3 className="font-black text-xs uppercase tracking-widest text-blue-900">Sync Instructions</h3>
                        </div>
                        <ul className="space-y-4">
                          {[
                            'Format: .pdf only',
                            'Sections: [SECTION A], [SECTION B]...',
                            'Question: 1. Your question text',
                            'Options: A) Option B) Option...',
                            'Answer: Answer: C'
                          ].map((text, i) => (
                            <li key={i} className="flex items-center gap-3 text-blue-700/70 font-bold text-xs">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                              {text}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gray-50 rounded-3xl p-8 border-2 border-transparent focus-within:border-blue-600 transition-all">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Target Bank ID</label>
                        <input
                          type="text"
                          value={testType}
                          onChange={(e) => setTestType(e.target.value.toUpperCase())}
                          placeholder="e.g. CERTIFICATION"
                          className="w-full px-6 py-4 bg-white rounded-2xl shadow-sm border-2 border-transparent focus:border-blue-600 transition-all text-sm font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div className="relative group">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setQuestionPdf(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`h-full min-h-[300px] rounded-[40px] border-4 border-dashed transition-all flex flex-col items-center justify-center p-10 bg-gray-50/50 group-hover:bg-blue-50/30 ${questionPdf ? 'border-green-400 bg-green-50/30' : 'border-gray-200 group-hover:border-blue-400'
                        }`}>
                        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 transition-all ${questionPdf ? 'bg-green-100 text-green-600 scale-110 shadow-xl' : 'bg-white text-gray-300 group-hover:text-blue-500 group-hover:scale-110 shadow-lg'
                          }`}>
                          <FaFileUpload size={40} />
                        </div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                          {questionPdf ? questionPdf.name : 'Select PDF File'}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">or drag and drop here</p>
                      </div>
                    </div>
                  </div>

                  {status && (
                    <div className={`mt-8 p-6 rounded-[32px] flex items-center gap-4 animate-in fade-in slide-in-from-top-4 ${status.type === 'success' ? 'bg-green-50 text-green-700 border-2 border-green-100' : 'bg-red-50 text-red-700 border-2 border-red-100'
                      }`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                        {status.type === 'success' ? <FaCheckCircle size={20} /> : <FaTrash size={20} />}
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{status.type === 'success' ? 'Sync Successful' : 'Sync Error'}</p>
                        <p className="text-sm font-bold opacity-80">{status.message}</p>
                      </div>
                    </div>
                  )}

                  {questionPdf && (
                    <button
                      onClick={handleSyncPdfQuestions}
                      disabled={loading}
                      className="w-full mt-10 bg-blue-600 text-white py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin text-xl" />
                          <span>Processing PDF...</span>
                        </>
                      ) : (
                        <>
                          <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                            <FaFileUpload className="text-lg" />
                          </div>
                          <span>Sync PDF Question Bank</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'training' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 border-b border-gray-100">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Upload Training Materials</h2>
                  <p className="text-gray-400 text-xs font-bold mt-1">Add new PDF guides for SEC self-learning.</p>
                </div>

                <div className="p-10 max-w-2xl">
                  <div className="space-y-8">
                    <div className="flex flex-col gap-6">
                      <div className="bg-gray-50 rounded-3xl p-8 border-2 border-transparent focus-within:border-blue-600 transition-all">
                        <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-4 ml-1">Document Title</label>
                        <input
                          type="text"
                          value={docTitle}
                          onChange={(e) => setDocTitle(e.target.value)}
                          placeholder="e.g., Samsung Galaxy S24 Ultra Guide"
                          className="w-full px-6 py-4 bg-white rounded-2xl shadow-sm border-2 border-transparent focus:border-blue-600 transition-all text-sm font-bold outline-none text-black placeholder:text-gray-500"
                        />
                      </div>

                      <div className="bg-gray-50 rounded-3xl p-8 border-2 border-transparent focus-within:border-blue-600 transition-all">
                        <label className="block text-[10px] font-black text-black uppercase tracking-widest mb-4 ml-1">Link to Bank ID (For Quiz)</label>
                        <input
                          type="text"
                          value={docBankId}
                          onChange={(e) => setDocBankId(e.target.value.toUpperCase())}
                          placeholder="e.g. CERTIFICATION"
                          className="w-full px-6 py-4 bg-white rounded-2xl shadow-sm border-2 border-transparent focus:border-blue-600 transition-all text-sm font-bold outline-none text-black placeholder:text-gray-500"
                        />
                      </div>

                      <div className="relative group">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className={`p-10 rounded-[40px] border-4 border-dashed transition-all flex flex-col items-center justify-center bg-gray-50/50 group-hover:bg-blue-50/30 ${pdfFile ? 'border-green-400 bg-green-50/30' : 'border-gray-200 group-hover:border-blue-400'
                          }`}>
                          <FaFileUpload size={32} className={pdfFile ? 'text-green-500' : 'text-gray-300'} />
                          <p className="mt-4 text-[10px] font-black text-gray-900 uppercase tracking-widest">
                            {pdfFile ? pdfFile.name : 'Select PDF Document'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {status && activeTab === 'training' && (
                      <div className={`p-6 rounded-[32px] flex items-center gap-4 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                          {status.type === 'success' ? <FaCheckCircle size={20} /> : <FaTrash size={20} />}
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{status.type === 'success' ? 'Upload Successful' : 'Upload Error'}</p>
                          <p className="text-sm font-bold opacity-80">{status.message}</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleUploadDocument}
                      disabled={loading || !pdfFile || !docTitle}
                      className="w-full bg-black text-white py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:translate-y-[-4px] transition-all shadow-2xl disabled:opacity-50"
                    >
                      {loading ? <FaSpinner className="animate-spin" /> : 'Upload Training Document'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
