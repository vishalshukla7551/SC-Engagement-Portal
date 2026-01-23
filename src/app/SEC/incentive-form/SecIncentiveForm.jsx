'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// OLD CONFETTI IMPORT - Uncomment after Christmas
// import Confetti from 'react-confetti';
// import FestiveHeader from '@/components/FestiveHeader';
// import FestiveFooter from '@/components/FestiveFooter';
import RepublicHeader from '@/components/RepublicHeader';
import RepublicFooter from '@/components/RepublicFooter';
import RepublicSuccessModal from '@/components/RepublicSuccessModal';
import ChristmasSuccessModal from '@/components/ChristmasSuccessModal';

const IndianFlag = ({ size = 20 }) => (
  <svg width={size} height={(size * 2) / 3} viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shadow-sm rounded-[1px] inline-block">
    <rect width="30" height="20" fill="white" />
    <rect width="30" height="6.66" fill="#FF9933" />
    <rect y="13.33" width="30" height="6.67" fill="#138808" />
    <circle cx="15" cy="10" r="3" stroke="#000080" strokeWidth="1" />
    <path d="M15 10L15 7M15 10L15 13M15 10L18 10M15 10L12 10M15 10L17.12 7.88M15 10L12.88 12.12M15 10L17.12 12.12M15 10L12.88 7.88" stroke="#000080" strokeWidth="0.5" />
  </svg>
);

export default function SecIncentiveForm({ initialSecId = '' }) {
  const router = useRouter();
  const [secPhone, setSecPhone] = useState('');
  const [secId, setSecId] = useState('');
  const [dateOfSale, setDateOfSale] = useState('');
  const [storeId, setStoreId] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [planId, setPlanId] = useState('');
  const [imeiNumber, setImeiNumber] = useState('');
  const [imeiError, setImeiError] = useState('');
  const [duplicateError, setDuplicateError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [imeiExists, setImeiExists] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSecAlert, setShowSecAlert] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [earnedIncentive, setEarnedIncentive] = useState(0);
  // OLD CONFETTI STATE - Uncomment after Christmas
  // const [showConfetti, setShowConfetti] = useState(false);

  // Data from APIs
  const [devices, setDevices] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Load SEC phone and store from authUser in localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('authUser');
      if (!raw) {
        setShowSecAlert(true);
        return;
      }

      const auth = JSON.parse(raw);
      const phoneFromAuth = auth?.phone;
      const employeeIdFromAuth = auth?.employeeId || auth?.employId;
      const storeFromAuth = auth?.store?.id;

      if (phoneFromAuth) {
        setSecPhone(phoneFromAuth);
        setShowSecAlert(false);
      } else {
        setShowSecAlert(true);
      }

      if (employeeIdFromAuth) {
        setSecId(employeeIdFromAuth);
      }

      if (storeFromAuth) {
        setStoreId(storeFromAuth);
      }
    } catch {
      // ignore parse errors but show alert so SEC can re-login
      setShowSecAlert(true);
    }
  }, []);

  // Fetch devices on mount
  useEffect(() => {
    async function fetchDevices() {
      try {
        const res = await fetch('/api/sec/incentive-form/devices');
        if (res.ok) {
          const data = await res.json();

          // Define category priority for sorting
          const categoryPriority = {
            'Luxury': 1,
            'Super': 2,  // For "Super Premium"
            'Premium': 3,
            'High': 4,
            'Mid': 5,
            'Mass': 6
          };

          // Sort devices by category priority
          const sortedDevices = (data.devices || []).sort((a, b) => {
            const categoryA = a.Category?.split(' ')[0] || '';
            const categoryB = b.Category?.split(' ')[0] || '';
            const priorityA = categoryPriority[categoryA] || 999;
            const priorityB = categoryPriority[categoryB] || 999;

            // If same category, sort alphabetically by model name
            if (priorityA === priorityB) {
              return (a.ModelName || '').localeCompare(b.ModelName || '');
            }

            return priorityA - priorityB;
          });

          setDevices(sortedDevices);
        }
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoadingDevices(false);
      }
    }
    fetchDevices();
  }, []);

  // Fetch plans when device is selected
  useEffect(() => {
    if (!deviceId) {
      setPlans([]);
      setPlanId('');
      return;
    }

    async function fetchPlans() {
      try {
        setLoadingPlans(true);
        const res = await fetch(`/api/sec/incentive-form/plans?deviceId=${deviceId}`);
        if (res.ok) {
          const data = await res.json();
          setPlans(data.plans || []);
        } else {
          setPlans([]);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans([]);
      } finally {
        setLoadingPlans(false);
      }
    }
    fetchPlans();
  }, [deviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!secPhone) {
      setShowSecAlert(true);
      alert('Please login to submit the form');
      return;
    }

    // Validate all fields with user-friendly messages
    if (!dateOfSale) {
      alert('⚠️ Please select the date of sale');
      return;
    }
    if (!storeId) {
      alert('⚠️ Please select a store');
      return;
    }
    if (!deviceId) {
      alert('⚠️ Please select a device');
      return;
    }
    if (!planId) {
      alert('⚠️ Please select a plan');
      return;
    }
    if (imeiError || duplicateError) {
      alert('⚠️ Please fix the IMEI issues before submitting');
      return;
    }
    if (!imeiNumber || imeiNumber.length !== 15) {
      setImeiError('Invalid IMEI. Please enter a valid 15-digit IMEI number.');
      alert('⚠️ Please enter a valid 15-digit IMEI number');
      return;
    }

    // Show confirmation modal instead of submitting directly
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmitting(true);
      setShowConfirmModal(false);

      const res = await fetch('/api/sec/incentive-form/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          planId,
          imei: imeiNumber,
          dateOfSale: dateOfSale || undefined,
          // Send client values for security verification (server will validate)
          clientSecPhone: secPhone,
          clientStoreId: storeId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to submit sales report');
        return;
      }

      // Success - Show celebration modal
      // User Request: Show Plan Price as Honor Points
      const selectedPlan = plans.find(p => p.id === planId);
      setEarnedIncentive(selectedPlan?.price || 0);
      setShowSuccessModal(true);

      // OLD CONFETTI CODE - Uncomment after Christmas
      // setShowConfetti(true);
      // Stop confetti after 4 seconds
      // setTimeout(() => {
      //   setShowConfetti(false);
      // }, 4000);

      // Reset form
      setDateOfSale('');
      setStoreId('');
      setDeviceId('');
      setPlanId('');
      setImeiNumber('');
      setImeiError('');
      setDuplicateError('');

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit sales report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    // OLD CONFETTI CODE - Uncomment after Christmas
    // setShowConfetti(false);
    router.push('/SEC/republic-leaderboard');
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
  };



  const luhnCheck = (imei) => {
    let sum = 0;
    for (let i = 0; i < imei.length; i++) {
      let digit = parseInt(imei[imei.length - 1 - i], 10);
      if (Number.isNaN(digit)) return false;
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    return sum % 10 === 0;
  };

  const checkImeiDuplicate = async (imei) => {
    if (!imei || imei.length < 14) {
      setImeiExists(false);
      setDuplicateError('');
      return;
    }

    try {
      setIsCheckingDuplicate(true);
      const res = await fetch(`/api/sec/incentive-form/check-imei?imei=${imei}`);

      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setImeiExists(true);
          setDuplicateError('This IMEI has already been submitted.');
        } else {
          setImeiExists(false);
          setDuplicateError('');
        }
      } else {
        // If API fails, don't block the user
        setImeiExists(false);
        setDuplicateError('');
      }
    } catch (error) {
      console.error('Error checking IMEI:', error);
      // If API fails, don't block the user
      setImeiExists(false);
      setDuplicateError('');
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Debounce function
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Create debounced version of checkImeiDuplicate
  const debouncedCheckImei = debounce(checkImeiDuplicate, 400);

  const validateAndSetImei = (rawValue) => {
    const numeric = rawValue.replace(/\D/g, '').slice(0, 15);
    setImeiNumber(numeric);

    if (!numeric) {
      setImeiError('');
      setDuplicateError('');
      setImeiExists(false);
      return;
    }

    if (numeric.length !== 15) {
      setImeiError('Invalid IMEI. Please enter a valid 15-digit IMEI number.');
      setDuplicateError('');
      setImeiExists(false);
      return;
    }

    if (!luhnCheck(numeric)) {
      setImeiError('Invalid IMEI. Please enter a valid 15-digit IMEI number.');
      setDuplicateError('');
      setImeiExists(false);
      return;
    }

    setImeiError('');
    // Use debounced check for duplicate IMEI
    debouncedCheckImei(numeric);
  };

  const handleImeiChange = (e) => {
    validateAndSetImei(e.target.value);
  };

  const handleScan = async () => {
    setIsScanning(true);

    try {
      // Check if browser supports BarcodeDetector API
      if ('BarcodeDetector' in window) {
        // Use native barcode / QR / DataMatrix scanner where supported
        const barcodeDetector = new BarcodeDetector({
          formats: ['ean_13', 'code_128', 'upc_e', 'qr_code', 'data_matrix'],
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        // NOTE: Implementing a full live camera preview + frame capture pipeline
        // is beyond the scope here, so we simulate by asking for IMEI after camera opens.
        alert('Camera scanner would open here on supported devices. For now, please enter IMEI manually.');
        stream.getTracks().forEach((track) => track.stop());

        const scannedImei = prompt('Enter scanned IMEI Number:');
        if (scannedImei) {
          validateAndSetImei(scannedImei);
        }
      } else {
        // Fallback: Use a simple prompt or third-party scanner library
        const scannedImei = prompt('Enter or scan IMEI Number:');
        if (scannedImei) {
          validateAndSetImei(scannedImei);
        }
      }
    } catch (error) {
      console.error('Scanner error:', error);
      // Fallback to manual input
      const manualImei = prompt('Camera access denied or unavailable. Enter IMEI manually:');
      if (manualImei) {
        validateAndSetImei(manualImei);
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans">
      <RepublicHeader hideGreeting />
      {/* <FestiveHeader hideGreeting /> */}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="px-5 pt-6 pb-6">
          {/* SEC ID Alert */}
          {showSecAlert && (
            <div className="mb-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 px-4 py-3 flex items-center justify-between gap-3 text-[13px] text-[#000080]">
              <span className="font-medium">
                Please set up your SEC ID to continue
              </span>
              <button
                type="button"
                onClick={() => {
                  setSecInput(secId || '');
                  setSecError('');
                  setShowSecModal(true);
                }}
                className="shrink-0 px-3 py-1.5 rounded-full bg-[#000080] text-white text-xs font-semibold shadow-sm"
              >
                Set Now
              </button>
            </div>
          )}

          {/* Page Heading - Republic Theme */}
          <div className="mb-8 relative pl-3">
            <div className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-[#FF9933] via-white to-[#138808] shadow-sm"></div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-black text-[#000080] tracking-tight uppercase" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Sales Submission
              </h1>
              <IndianFlag size={20} />
            </div>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Submit your plan sales below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* SEC ID - Disabled */}
            <div>
              <label htmlFor="secId" className="block text-xs font-bold text-[#000080] uppercase tracking-wider mb-1.5">
                SEC ID
              </label>
              <input
                type="text"
                id="secId"
                value={secId}
                disabled
                className="w-full px-4 py-3 bg-slate-200/50 border border-slate-200 rounded-xl text-slate-500 text-sm font-medium"
                placeholder="SEC Phone Number"
              />
            </div>

            {/* Date of Sale */}
            <div>
              <label htmlFor="dateOfSale" className="block text-xs font-bold text-[#000080] uppercase tracking-wider mb-1.5">
                Date of Sale
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="dateOfSale"
                  value={dateOfSale}
                  onChange={(e) => setDateOfSale(e.target.value)}
                  min="2026-01-23"
                  max="2026-01-31"
                  onClick={(e) => e.target.showPicker?.()}
                  className="w-full pl-4 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm transition-all [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  placeholder="dd/mm/yyyy"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Store Name - Always disabled, loaded from authUser */}
            <div>
              <label htmlFor="storeId" className="block text-xs font-bold text-[#000080] uppercase tracking-wider mb-1.5">
                Store Name
              </label>
              <input
                type="text"
                id="storeId"
                value={(() => {
                  // Get store from authUser directly
                  if (typeof window !== 'undefined') {
                    try {
                      const raw = window.localStorage.getItem('authUser');
                      if (raw) {
                        const auth = JSON.parse(raw);
                        if (auth?.store?.name) {
                          return `${auth.store.name}${auth.store.city ? ` - ${auth.store.city}` : ''}`;
                        }
                      }
                    } catch {
                      // ignore
                    }
                  }
                  return 'Store not set';
                })()}
                disabled
                className="w-full px-4 py-3 bg-slate-200/50 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium"
              />
              <a
                href="/SEC/profile?from=incentive-form"
                className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
              >
                Want to change store?
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
            </div>

            {/* Device Name */}
            <div>
              <label htmlFor="deviceId" className="block text-xs font-bold text-[#000080] uppercase tracking-wider mb-1.5">
                Device Name
              </label>
              <div className="relative">
                <select
                  id="deviceId"
                  value={deviceId}
                  onChange={(e) => {
                    setDeviceId(e.target.value);
                    setPlanId(''); // Reset plan when device changes
                  }}
                  disabled={loadingDevices}
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none disabled:opacity-50 shadow-sm transition-all"
                >
                  <option value="">{loadingDevices ? 'Loading devices...' : 'Select Device'}</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.Category} - {device.ModelName}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Plan Type */}
            <div>
              <label htmlFor="planId" className="block text-xs font-bold text-[#000080] uppercase tracking-wider mb-1.5">
                Plan Type
              </label>
              <div className="relative">
                <select
                  id="planId"
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  disabled={!deviceId || loadingPlans}
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none disabled:opacity-50 shadow-sm transition-all"
                >
                  <option value="">
                    {!deviceId ? 'Select device first' : loadingPlans ? 'Loading plans...' : 'Select Plan'}
                  </option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.label} - ₹{plan.price}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* IMEI Number */}
            <div>
              <label htmlFor="imeiNumber" className="block text-xs font-bold text-[#000080] uppercase tracking-wider mb-1.5">
                IMEI Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="imeiNumber"
                  value={imeiNumber}
                  onChange={handleImeiChange}
                  placeholder="Enter IMEI Number"
                  inputMode="numeric"
                  maxLength="15"
                  className={`w-full pl-4 pr-24 py-3.5 bg-white border rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 placeholder:text-slate-400 shadow-sm transition-all ${imeiError || duplicateError || imeiExists
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-200 focus:ring-orange-500 focus:border-orange-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={handleScan}
                  disabled={isScanning}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#000080] hover:bg-[#1a1a90] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                  {isScanning ? 'Scanning...' : 'SCAN'}
                </button>
              </div>
              {isCheckingDuplicate && !imeiError && (
                <p className="mt-2 text-xs text-blue-600 font-medium">
                  Checking IMEI...
                </p>
              )}
              {(imeiError || duplicateError) && !isCheckingDuplicate && (
                <p className="mt-2 text-xs text-red-600 font-medium">
                  {imeiError || duplicateError}
                </p>
              )}
              {!imeiError && !duplicateError && !isCheckingDuplicate && (
                <p className="mt-2 text-[10px] text-slate-500 font-medium">
                  Any incorrect sales reported will impact your future incentives.
                </p>
              )}
            </div>

            {/* Submit Button - Republic Day Theme */}
            <div className="pt-6 pb-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base shadow-lg hover:shadow-xl active:scale-[0.98] relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(90deg, #FF9933 0%, #000080 50%, #138808 100%)',
                }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>SUBMITTING...</span>
                    </>
                  ) : (
                    <>
                      <span>SUBMIT</span>
                      <IndianFlag size={16} />
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </main>



      <RepublicFooter />
      {/* <FestiveFooter /> */}

      {/* Republic Day Success Modal */}
      <RepublicSuccessModal
        isOpen={showSuccessModal}
        earnedIncentive={earnedIncentive}
        onClose={handleCloseSuccess}
      />

      {/* Christmas Success Modal - KEPT FOR LATER USE
      <ChristmasSuccessModal
        isOpen={showSuccessModal}
        earnedIncentive={earnedIncentive}
        onClose={handleCloseSuccess}
      />
      */}

      {/* OLD SUCCESS MODAL - Uncomment after Christmas and remove ChristmasSuccessModal above
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {showConfetti && (
            <Confetti
              width={typeof window !== 'undefined' ? window.innerWidth : 300}
              height={typeof window !== 'undefined' ? window.innerHeight : 200}
              numberOfPieces={300}
              recycle={false}
            />
          )}
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full animate-[fadeIn_0.3s_ease-in]">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-blue-600 mb-3">
              Congratulations!
            </h2>
            <p className="text-gray-700 text-base mb-2">
              You've earned
            </p>
            <p className="text-3xl font-bold text-green-600 mb-6">
              ₹{earnedIncentive}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              incentive! 🎊
            </p>
            <button
              onClick={handleCloseSuccess}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View My Report
            </button>
          </div>
        </div>
      )}
      */}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCancelConfirm}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Confirm Plan Sale
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Review the details below before submitting.
            </p>

            <div className="space-y-3 mb-6">
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
                    if (typeof window !== 'undefined') {
                      try {
                        const raw = window.localStorage.getItem('authUser');
                        if (raw) {
                          const auth = JSON.parse(raw);
                          if (auth?.store?.name) {
                            return `${auth.store.name}${auth.store.city ? ` - ${auth.store.city}` : ''}`;
                          }
                        }
                      } catch {
                        // ignore
                      }
                    }
                    return storeId;
                  })()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Device</span>
                <span className="text-sm text-gray-900 font-medium text-right ml-4">
                  {devices.find(d => d.id === deviceId)?.ModelName || deviceId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Plan Type</span>
                <span className="text-sm text-gray-900 font-medium text-right ml-4">
                  {plans.find(p => p.id === planId)?.label || planId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Plan Price</span>
                <span className="text-sm text-gray-900 font-medium">
                  ₹{plans.find(p => p.id === planId)?.price || '0'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">IMEI</span>
                <span className="text-sm text-gray-900 font-medium">{imeiNumber}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelConfirm}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
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
