'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import SECHeader from '@/app/SEC/SECHeader';
import SECFooter from '@/app/SEC/SECFooter';
import ValentineSuccessModal from '@/components/ValentineSuccessModal';

const RELIANCE_STORE_PREFIX = 'Reliance Digital';
const BOOSTER_THRESHOLD = 75000;

export default function SecIncentiveForm({ initialSecId = '' }) {
  const router = useRouter();

  // Auth state
  const [secPhone, setSecPhone] = useState('');
  const [secId, setSecId] = useState('');
  const [isSecIdEditable, setIsSecIdEditable] = useState(false);
  const [showSecAlert, setShowSecAlert] = useState(false);

  // Store state
  const [storeId, setStoreId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [isRelianceStore, setIsRelianceStore] = useState(false);

  // Profile state
  const [profileComplete, setProfileComplete] = useState(true);
  const [missingProfileFields, setMissingProfileFields] = useState([]);

  // Form fields
  const [dateOfSale, setDateOfSale] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [planId, setPlanId] = useState('');
  const [imeiNumber, setImeiNumber] = useState('');
  const dateInputRef = useRef(null);

  // Selfie state
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [selfieError, setSelfieError] = useState('');
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  const selfieInputRef = useRef(null);

  // IMEI state
  const [imeiError, setImeiError] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [imeiExists, setImeiExists] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [earnedIncentive, setEarnedIncentive] = useState(0);
  const [incentiveBreakdown, setIncentiveBreakdown] = useState(null);

  // Device / Plan data
  const [devices, setDevices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // ─── Load auth user from localStorage ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('authUser');
      if (!raw) { setShowSecAlert(true); return; }

      const auth = JSON.parse(raw);
      const phoneFromAuth = auth?.phone;
      const employeeIdFromAuth = auth?.employeeId || auth?.employId;
      const storeFromAuth = auth?.store?.id;
      const storeNameFromAuth = auth?.store?.name || '';

      if (phoneFromAuth) { setSecPhone(phoneFromAuth); setShowSecAlert(false); }
      else { setShowSecAlert(true); }

      if (employeeIdFromAuth) setSecId(employeeIdFromAuth);
      if (storeFromAuth) setStoreId(storeFromAuth);
      if (storeNameFromAuth) {
        setStoreName(storeNameFromAuth);
        setIsRelianceStore(storeNameFromAuth.startsWith(RELIANCE_STORE_PREFIX));
      }
    } catch { setShowSecAlert(true); }
  }, []);

  // ─── Fetch profile completeness for Reliance SECs ──────────────────────────
  useEffect(() => {
    if (!isRelianceStore || !secPhone) return;

    async function checkProfile() {
      try {
        const res = await fetch('/api/sec/profile');
        if (!res.ok) return;
        const data = await res.json();
        const profile = data?.data?.sec?.otherProfileInfo || {};
        const missing = [];
        if (!profile.photoUrl) missing.push('Profile Photo');
        if (!profile.birthday) missing.push('Date of Birth');
        if (profile.maritalStatus === undefined || profile.maritalStatus === null) missing.push('Marital Status');
        setMissingProfileFields(missing);
        setProfileComplete(missing.length === 0);
      } catch (e) {
        console.error('Profile check failed', e);
      }
    }
    checkProfile();
  }, [isRelianceStore, secPhone]);

  // ─── Fetch devices ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchDevices() {
      try {
        const res = await fetch('/api/sec/incentive-form/devices');
        if (res.ok) {
          const data = await res.json();
          const categoryPriority = { 'Luxury': 1, 'Super': 2, 'Premium': 3, 'High': 4, 'Mid': 5, 'Mass': 6 };
          const sorted = (data.devices || []).sort((a, b) => {
            const pA = categoryPriority[a.Category?.split(' ')[0]] || 999;
            const pB = categoryPriority[b.Category?.split(' ')[0]] || 999;
            return pA === pB ? (a.ModelName || '').localeCompare(b.ModelName || '') : pA - pB;
          });
          setDevices(sorted);
        }
      } catch (e) { console.error('Error fetching devices:', e); }
      finally { setLoadingDevices(false); }
    }
    fetchDevices();
  }, []);

  // ─── Fetch plans when device is selected ───────────────────────────────────
  useEffect(() => {
    if (!deviceId) { setPlans([]); setPlanId(''); return; }
    async function fetchPlans() {
      try {
        setLoadingPlans(true);
        const res = await fetch(`/api/sec/incentive-form/plans?deviceId=${deviceId}`);
        if (res.ok) { const data = await res.json(); setPlans(data.plans || []); }
        else setPlans([]);
      } catch { setPlans([]); }
      finally { setLoadingPlans(false); }
    }
    fetchPlans();
  }, [deviceId]);

  // ─── SEC ID edit/save ───────────────────────────────────────────────────────
  const handleToggleEdit = async () => {
    if (isSecIdEditable) {
      if (!secId.trim()) { alert('SEC ID cannot be empty'); return; }
      try {
        const res = await fetch('/api/sec/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: secId }),
        });
        if (res.ok) {
          try {
            const raw = window.localStorage.getItem('authUser');
            if (raw) {
              const auth = JSON.parse(raw);
              auth.employeeId = secId; auth.employId = secId;
              window.localStorage.setItem('authUser', JSON.stringify(auth));
            }
          } catch { }
          setIsSecIdEditable(false);
          alert('SEC ID updated successfully');
        } else { alert('Failed to update SEC ID'); }
      } catch { alert('Error updating SEC ID'); }
    } else { setIsSecIdEditable(true); }
  };

  // ─── Selfie upload ──────────────────────────────────────────────────────────
  const handleSelfieChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSelfieError('Please select a valid image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSelfieError('Image must be less than 10MB.');
      return;
    }

    setSelfieError('');
    setSelfieFile(file);
    setSelfieUrl(''); // Reset stored URL

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => setSelfiePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const uploadSelfie = async (base64Image) => {
    setIsUploadingSelfie(true);
    try {
      const res = await fetch('/api/sec/incentive-form/upload-selfie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
      return data.url;
    } finally {
      setIsUploadingSelfie(false);
    }
  };

  // ─── IMEI logic ─────────────────────────────────────────────────────────────
  const luhnCheck = (imei) => {
    let sum = 0;
    for (let i = 0; i < imei.length; i++) {
      let digit = parseInt(imei[imei.length - 1 - i], 10);
      if (Number.isNaN(digit)) return false;
      if (i % 2 === 1) { digit *= 2; if (digit > 9) digit -= 9; }
      sum += digit;
    }
    return sum % 10 === 0;
  };

  const checkImeiDuplicate = async (imei) => {
    if (!imei || imei.length < 14) { setImeiExists(false); setDuplicateError(''); return; }
    try {
      setIsCheckingDuplicate(true);
      const res = await fetch(`/api/sec/incentive-form/check-imei?imei=${imei}`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists) { setImeiExists(true); setDuplicateError('This IMEI has already been submitted.'); }
        else { setImeiExists(false); setDuplicateError(''); }
      }
    } catch { setImeiExists(false); setDuplicateError(''); }
    finally { setIsCheckingDuplicate(false); }
  };

  const debounce = (func, delay) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => func(...args), delay); };
  };
  const debouncedCheckImei = debounce(checkImeiDuplicate, 400);

  const validateAndSetImei = (rawValue) => {
    const numeric = rawValue.replace(/\D/g, '').slice(0, 15);
    setImeiNumber(numeric);
    if (!numeric) { setImeiError(''); setDuplicateError(''); setImeiExists(false); return; }
    if (numeric.length !== 15) { setImeiError('Invalid IMEI. Please enter a valid 15-digit IMEI number.'); setDuplicateError(''); setImeiExists(false); return; }
    if (!luhnCheck(numeric)) { setImeiError('Invalid IMEI. Please enter a valid 15-digit IMEI number.'); setDuplicateError(''); setImeiExists(false); return; }
    setImeiError('');
    debouncedCheckImei(numeric);
  };

  // ─── Form submit flow ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isRelianceStore) {
      alert('🛑 Sales submissions are currently closed for your store.');
      return;
    }
    if (!profileComplete) {
      alert(`⚠️ Please complete your profile first:\n${missingProfileFields.join('\n')}`);
      router.push('/SEC/profile');
      return;
    }
    if (!secPhone) { setShowSecAlert(true); alert('Please login to submit the form'); return; }
    if (!dateOfSale) { alert('⚠️ Please select the date of sale'); return; }
    if (!deviceId) { alert('⚠️ Please select a device'); return; }
    if (!planId) { alert('⚠️ Please select a plan'); return; }
    if (imeiError || duplicateError) { alert('⚠️ Please fix the IMEI issues before submitting'); return; }
    if (!imeiNumber || imeiNumber.length !== 15) { setImeiError('Invalid IMEI.'); alert('⚠️ Please enter a valid 15-digit IMEI number'); return; }
    if (!selfieFile && !selfieUrl) { setSelfieError('Please upload your selfie with the Samsung ProtectMax POSM.'); alert('📸 Selfie with Samsung ProtectMax POSM is mandatory'); return; }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      setShowConfirmModal(false);

      // Upload selfie if not already uploaded
      let finalSelfieUrl = selfieUrl;
      if (!finalSelfieUrl && selfiePreview) {
        try {
          finalSelfieUrl = await uploadSelfie(selfiePreview);
          setSelfieUrl(finalSelfieUrl);
        } catch (e) {
          alert('Failed to upload selfie. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      const res = await fetch('/api/sec/incentive-form/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          planId,
          imei: imeiNumber,
          dateOfSale: dateOfSale || undefined,
          clientSecPhone: secPhone,
          clientStoreId: storeId,
          selfieUrl: finalSelfieUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Failed to submit sales report'); return; }

      // Store breakdown for success modal
      const breakdown = data.incentiveBreakdown;
      setIncentiveBreakdown(breakdown);
      setEarnedIncentive(breakdown?.totalIncentive || 0);
      setShowSuccessModal(true);

      // Reset form
      setDateOfSale('');
      setDeviceId('');
      setPlanId('');
      setImeiNumber('');
      setImeiError('');
      setDuplicateError('');
      setSelfieFile(null);
      setSelfiePreview('');
      setSelfieUrl('');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit sales report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    router.push('/SEC/love-submissions');
  };
  const handleCancelConfirm = () => setShowConfirmModal(false);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const scannedImei = prompt('Enter or scan IMEI Number:');
      if (scannedImei) validateAndSetImei(scannedImei);
    } finally { setIsScanning(false); }
  };

  // ─── Render: CLOSED for non-Reliance stores ─────────────────────────────────
  const renderClosedState = () => (
    <div className="px-5 pt-6 pb-6">
      <div className="mb-6 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 border border-rose-300 px-5 py-4 flex items-center gap-3 shadow-md">
        <span className="text-2xl">⚠️</span>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-tight">Campaign Period Ended</h3>
          <p className="text-[11px] text-rose-100 font-medium leading-tight">
            Sales submissions for the current campaign are now closed. Please check announcements for the next campaign start date.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-slate-100 border border-slate-200 px-5 py-8 text-center">
        <div className="text-5xl mb-3">🔒</div>
        <h2 className="text-lg font-bold text-slate-700 mb-1">Submissions Closed</h2>
        <p className="text-sm text-slate-500">
          No active campaign right now.
        </p>
      </div>
    </div>
  );

  // ─── Render: PROFILE INCOMPLETE ─────────────────────────────────────────────
  const renderProfileIncomplete = () => (
    <div className="px-5 pt-6 pb-6">
      <div className="mb-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 border border-amber-300 px-5 py-4 flex items-start gap-3 shadow-md">
        <span className="text-2xl mt-0.5">🚧</span>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-tight">Profile Incomplete</h3>
          <p className="text-[11px] text-amber-100 font-medium leading-tight mt-1">
            To participate in the Reliance Digital campaign, you must complete your SalesDost profile first.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-amber-200 px-5 py-6 shadow-sm">
        <p className="text-sm font-bold text-slate-700 mb-3">Missing profile information:</p>
        <ul className="space-y-2 mb-6">
          {missingProfileFields.map((field) => (
            <li key={field} className="flex items-center gap-2 text-sm text-red-600 font-medium">
              <span className="text-base">❌</span> {field}
            </li>
          ))}
        </ul>
        <a
          href="/SEC/profile"
          className="block w-full text-center py-3 rounded-xl font-bold text-white shadow-md"
          style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' }}
        >
          Complete Profile Now →
        </a>
      </div>
    </div>
  );

  // ─── Reliance campaign banner ────────────────────────────────────────────────
  const renderCampaignBanner = () => (
    <div className="mb-5 rounded-xl overflow-hidden shadow-md border border-blue-200">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center gap-2">
        <span className="text-lg">🏪</span>
        <span className="text-white font-bold text-sm uppercase tracking-wide">Reliance Digital Campaign</span>
        <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
      </div>
      <div className="bg-blue-50 px-4 py-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white rounded-lg p-2 border border-blue-100">
            <p className="font-bold text-blue-700 mb-1">⭐ Flagship Devices</p>
            <p className="text-slate-600">ADLD: <strong className="text-green-600">₹200</strong></p>
            <p className="text-slate-600">Combo: <strong className="text-green-600">₹400</strong></p>
          </div>
          <div className="bg-white rounded-lg p-2 border border-blue-100">
            <p className="font-bold text-slate-600 mb-1">📱 Other Devices</p>
            <p className="text-slate-600">ADLD: <strong className="text-green-600">₹100</strong></p>
            <p className="text-slate-600">Combo: <strong className="text-green-600">₹200</strong></p>
          </div>
        </div>
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="text-base">🚀</span>
          <p className="text-xs text-amber-800 font-medium">
            <strong>Booster:</strong> Earn ₹1,000 extra when your total plan sales reach ₹75,000!
          </p>
        </div>
      </div>
    </div>
  );

  const isFormDisabled = !isRelianceStore || !profileComplete;

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden font-sans relative">
      <SECHeader />

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="px-5 pt-6 pb-6">

          {/* SEC ID Alert */}
          {showSecAlert && (
            <div className="mb-4 rounded-xl bg-gradient-to-r from-blue-50 to-slate-100 border border-blue-200 px-4 py-3 flex items-center justify-between gap-3 text-[13px] text-blue-900">
              <span className="font-medium">Session expired. Please login again.</span>
              <a href="/login" className="shrink-0 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-sm">Login</a>
            </div>
          )}

          {/* Page Heading */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="mb-6 relative pl-3 z-10">
            <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-blue-600 shadow-sm" />
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Sales Submission
              </h1>
            </div>
            {isRelianceStore ? (
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider">
                ✅ Reliance Digital Campaign — Active
              </p>
            ) : (
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider italic">
                📢 Sales submissions are currently closed for your store
              </p>
            )}
          </motion.div>

          {/* Conditional content based on store eligibility */}
          {!isRelianceStore ? renderClosedState() : !profileComplete ? renderProfileIncomplete() : (
            <>
              {/* Campaign banner */}
              {renderCampaignBanner()}

              {/* THE FORM */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-5 z-10 relative"
              >
                {/* SEC ID */}
                <div>
                  <label htmlFor="secId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">SEC ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="secId"
                      value={secId}
                      onChange={(e) => setSecId(e.target.value)}
                      disabled={!isSecIdEditable}
                      className={`w-full px-4 py-3 border rounded-xl text-sm font-medium transition-all ${isSecIdEditable
                        ? 'bg-white border-blue-500 text-slate-800 ring-2 ring-blue-100'
                        : 'bg-slate-200/50 border-slate-200 text-slate-500'}`}
                      placeholder="SEC ID"
                    />
                    <button
                      type="button"
                      onClick={handleToggleEdit}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#000080] bg-white hover:bg-slate-50 rounded-lg border border-slate-200 shadow-sm transition-all active:scale-95"
                    >
                      {isSecIdEditable ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Date of Sale */}
                <div>
                  <label htmlFor="dateOfSale" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Date of Sale</label>
                  <div className="relative">
                    <input
                      type="date"
                      id="dateOfSale"
                      ref={dateInputRef}
                      value={dateOfSale}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDateOfSale(e.target.value)}
                      onClick={() => dateInputRef.current?.showPicker()}
                      className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm transition-all appearance-none [&::-webkit-calendar-picker-indicator]:hidden"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer" onClick={() => dateInputRef.current?.showPicker()}>
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Store Name */}
                <div>
                  <label htmlFor="storeId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Store Name</label>
                  <input
                    type="text"
                    id="storeId"
                    value={(() => {
                      if (typeof window !== 'undefined') {
                        try {
                          const raw = window.localStorage.getItem('authUser');
                          if (raw) {
                            const auth = JSON.parse(raw);
                            if (auth?.store?.name) return `${auth.store.name}${auth.store.city ? ` - ${auth.store.city}` : ''}`;
                          }
                        } catch { }
                      }
                      return 'Store not set';
                    })()}
                    disabled
                    className="w-full px-4 py-3 bg-slate-200/50 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium"
                  />
                </div>

                {/* Device Name */}
                <div>
                  <label htmlFor="deviceId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Device Name</label>
                  <div className="relative">
                    <select
                      id="deviceId"
                      value={deviceId}
                      onChange={(e) => { setDeviceId(e.target.value); setPlanId(''); }}
                      required
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none shadow-sm transition-all"
                    >
                      <option value="">{loadingDevices ? 'Loading devices...' : 'Select Device'}</option>
                      {devices.map((device) => (
                        <option key={device.id} value={device.id}>
                          {device.Category} - {device.ModelName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                {/* Plan Type */}
                <div>
                  <label htmlFor="planId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Plan Type</label>
                  <div className="relative">
                    <select
                      id="planId"
                      value={planId}
                      onChange={(e) => setPlanId(e.target.value)}
                      required
                      disabled={!deviceId || loadingPlans}
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none disabled:bg-slate-100 disabled:text-slate-400 shadow-sm transition-all"
                    >
                      <option value="">{!deviceId ? 'Select device first' : loadingPlans ? 'Loading plans...' : 'Select Plan'}</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>{plan.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                {/* IMEI Number */}
                <div>
                  <label htmlFor="imeiNumber" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">IMEI Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="imeiNumber"
                      value={imeiNumber}
                      onChange={(e) => validateAndSetImei(e.target.value)}
                      placeholder="Enter IMEI Number"
                      inputMode="numeric"
                      maxLength="15"
                      className={`w-full pl-4 pr-24 py-3.5 bg-white border rounded-xl text-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 placeholder:text-slate-300 shadow-sm transition-all ${imeiError || duplicateError ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200'}`}
                    />
                    <button
                      type="button"
                      onClick={handleScan}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      {isScanning ? 'Scanning...' : 'SCAN'}
                    </button>
                  </div>
                  {isCheckingDuplicate && !imeiError && <p className="mt-2 text-xs text-blue-600 font-medium">Checking IMEI...</p>}
                  {(imeiError || duplicateError) && !isCheckingDuplicate && <p className="mt-2 text-xs text-red-600 font-medium">{imeiError || duplicateError}</p>}
                  {!imeiError && !duplicateError && !isCheckingDuplicate && <p className="mt-2 text-[10px] text-slate-500 font-medium">Any incorrect sales reported will impact your future incentives.</p>}
                </div>

                {/* ─── SELFIE WITH POSM ─────────────────────────────────────────── */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    📸 Selfie with Samsung ProtectMax POSM <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2 font-medium">
                    Take a selfie at the Samsung counter with the ProtectMax banner/display POSM. This is mandatory.
                  </p>

                  {/* Preview area */}
                  {selfiePreview ? (
                    <div className="relative rounded-xl overflow-hidden border-2 border-blue-200 shadow-md mb-2">
                      <img src={selfiePreview} alt="Selfie Preview" className="w-full h-48 object-cover" />
                      <button
                        type="button"
                        onClick={() => { setSelfieFile(null); setSelfiePreview(''); setSelfieUrl(''); setSelfieError(''); }}
                        className="absolute top-2 right-2 bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-700 transition-all"
                      >
                        ✕
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                        <p className="text-white text-xs font-medium">✅ Selfie captured</p>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => selfieInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-200 rounded-xl py-6 flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50/50 transition-all active:scale-[0.98]"
                    >
                      <span className="text-3xl">📷</span>
                      <span className="text-sm font-bold text-blue-600">Tap to take / upload selfie</span>
                      <span className="text-xs text-slate-400">JPG, PNG up to 10MB</span>
                    </button>
                  )}

                  <input
                    ref={selfieInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleSelfieChange}
                  />

                  {selfieError && <p className="mt-2 text-xs text-red-600 font-medium">⚠️ {selfieError}</p>}
                </div>

                {/* Submit Button */}
                <div className="pt-4 pb-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || !!imeiError || !!duplicateError || imeiExists}
                    className="w-full text-white font-bold py-4 rounded-xl transition-all text-base shadow-lg relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                    style={{ background: 'linear-gradient(90deg, #1d4ed8 0%, #1e40af 50%, #1d4ed8 100%)', backgroundSize: '200% 100%' }}
                  >
                    <div className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>SUBMIT SALE</span>
                      )}
                    </div>
                  </button>
                </div>

              </motion.form>
            </>
          )}
        </div>
      </main>

      <SECFooter />

      {/* Success Modal with incentive breakdown */}
      <ValentineSuccessModal
        isOpen={showSuccessModal}
        earnedIncentive={earnedIncentive}
        onClose={handleCloseSuccess}
      />

      {/* Booster notification overlay */}
      <AnimatePresence>
        {showSuccessModal && incentiveBreakdown?.boosterApplied && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-8 left-4 right-4 z-[60] bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl p-4 shadow-2xl flex items-center gap-3 border border-amber-300"
          >
            <span className="text-3xl">🚀</span>
            <div>
              <p className="font-black text-amber-900 text-sm">Booster Unlocked!</p>
              <p className="text-amber-800 text-xs font-medium">Your total plan sales crossed ₹75,000 — +₹1,000 bonus earned!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleCancelConfirm}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Confirm Plan Sale</h2>
            <p className="text-sm text-gray-500 mb-6">Review the details below before submitting.</p>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">SEC ID</span>
                <span className="text-sm text-gray-900 font-medium">{secId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Date of Sale</span>
                <span className="text-sm text-gray-900 font-medium">{dateOfSale || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Store Name</span>
                <span className="text-sm text-gray-900 font-medium text-right ml-4">
                  {(() => {
                    try {
                      const raw = window.localStorage.getItem('authUser');
                      if (raw) {
                        const auth = JSON.parse(raw);
                        if (auth?.store?.name) return `${auth.store.name}${auth.store.city ? ` - ${auth.store.city}` : ''}`;
                      }
                    } catch { }
                    return storeId;
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Device</span>
                <span className="text-sm text-gray-900 font-medium text-right ml-4">{devices.find(d => d.id === deviceId)?.ModelName || deviceId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Plan Type</span>
                <span className="text-sm text-gray-900 font-medium text-right ml-4">{plans.find(p => p.id === planId)?.label || planId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Plan Price</span>
                <span className="text-sm text-gray-900 font-medium">₹{plans.find(p => p.id === planId)?.price || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">IMEI</span>
                <span className="text-sm text-gray-900 font-medium">{imeiNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Selfie</span>
                <span className="text-sm text-green-600 font-medium">✅ Uploaded</span>
              </div>
            </div>

            {/* Selfie thumbnail in confirm modal */}
            {selfiePreview && (
              <div className="mb-4 rounded-lg overflow-hidden border border-slate-200">
                <img src={selfiePreview} alt="POSM Selfie" className="w-full h-28 object-cover" />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleCancelConfirm} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                Cancel
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium text-sm"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
