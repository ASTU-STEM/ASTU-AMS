import React, { useState } from 'react';
import { employerService } from '../services/employer.service';
import toast from 'react-hot-toast';

interface PremiumListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProfile: any) => void;
  darkMode: boolean;
  companyName: string;
}

export const PremiumListingModal: React.FC<PremiumListingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  darkMode,
  companyName
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [chapaCheckout, setChapaCheckout] = useState<{
    tx_ref: string;
    checkout_url: string;
    amount: number;
    planTitle: string;
  } | null>(null);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'monthly' as const,
      name: 'Monthly Priority Boost',
      price: 15000,
      period: '/ month',
      badge: 'Popular',
      badgeColor: 'bg-[#003366] text-white',
      features: [
        'Top AI Ranking boost in Alumni Talent Search',
        'Priority Job Listing badge on Alumni Portal',
        'Direct Messaging access to 50 top graduates / mo',
        'Company logo featured on ASTU Career Board'
      ]
    },
    {
      id: 'quarterly' as const,
      name: 'Quarterly Elite Partner',
      price: 40000,
      period: '/ 3 months',
      badge: 'Save 11%',
      badgeColor: 'bg-emerald-600 text-white',
      features: [
        'All Monthly Priority Boost features included',
        'Unlimited Job & Internship postings',
        'Direct CV Download & Transcript verification credits',
        'Dedicated Department Placement Officer support'
      ]
    },
    {
      id: 'annual' as const,
      name: 'Annual Enterprise VIP',
      price: 120000,
      period: '/ year',
      badge: 'VIP Enterprise',
      badgeColor: 'bg-amber-500 text-white',
      features: [
        'All Quarterly Elite features included',
        'ASTU Campus Career Fair Booth Sponsorship',
        'Exclusive early access to graduating Senior Thesis cohorts',
        'Custom Curriculum Advisory & Co-branding banner'
      ]
    }
  ];

  const currentPlanObj = plans.find(p => p.id === selectedPlan) || plans[0];

  const handleInitializeChapa = async () => {
    setIsInitializing(true);
    try {
      const data = await employerService.initializePremiumChapa(
        currentPlanObj.name,
        currentPlanObj.price,
        `ASTU Recruitment Hub - ${currentPlanObj.name}`
      );
      setChapaCheckout({
        tx_ref: data.tx_ref,
        checkout_url: data.checkout_url,
        amount: data.amount,
        planTitle: currentPlanObj.name
      });
      toast.success('Chapa payment gateway initialized!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initialize Chapa payment.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!chapaCheckout) return;
    setIsVerifying(true);
    try {
      const updatedProfile = await employerService.verifyPremiumChapa(chapaCheckout.tx_ref, chapaCheckout.planTitle);
      onSuccess(updatedProfile);
      toast.success('🎉 Premium membership activated successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Payment verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden transition-all my-8 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-[#003366] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-2 transition-all"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">ASTU Employer Premium Membership</h3>
              <p className="text-xs text-amber-100 mt-0.5">Elevate {companyName || 'your company'} to top priority placement & direct talent access</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {!chapaCheckout ? (
            <>
              {/* Plan Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/5 shadow-md scale-[1.02]'
                          : darkMode
                            ? 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                            : 'border-[var(--border-color)] bg-[var(--bg-page)] hover:border-[var(--border-color)]'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${plan.badgeColor}`}>
                            {plan.badge}
                          </span>
                          <input
                            type="radio"
                            name="premiumPlan"
                            checked={isSelected}
                            onChange={() => setSelectedPlan(plan.id)}
                            className="text-amber-500 accent-amber-500 h-4 w-4"
                          />
                        </div>

                        <h4 className="font-bold text-sm text-[#003366] dark:text-amber-400 mt-1">{plan.name}</h4>
                        <div className="mt-2 mb-4">
                          <span className="text-2xl font-black">{plan.price.toLocaleString()}</span>
                          <span className="text-xs text-[var(--text-muted)] font-bold ml-1">ETB {plan.period}</span>
                        </div>

                        <ul className="space-y-2 border-t border-[var(--border-color)] pt-3">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] dark:text-slate-300">
                              <span className="text-emerald-500 font-bold text-sm leading-none">✓</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-semibold">
                  <span className="material-symbols-outlined text-emerald-500 text-lg">verified_user</span>
                  <span>Secured by Chapa Payment Gateway (Telebirr, CBE Birr, Cards)</span>
                </div>
                <button
                  onClick={handleInitializeChapa}
                  disabled={isInitializing}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-[#003366] text-white rounded-xl font-extrabold text-sm uppercase tracking-wider hover:scale-102 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isInitializing ? (
                    <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Initializing Gateway...</>
                  ) : (
                    <>Proceed to Chapa Payment ({currentPlanObj.price.toLocaleString()} ETB)</>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Chapa Payment Gateway Simulation / Direct Checkout Modal */
            <div className="space-y-6 py-2">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 text-amber-900 dark:text-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm">Chapa Order Reference</h4>
                    <p className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">{chapaCheckout.tx_ref}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase block text-amber-700 dark:text-amber-400">Total Payable</span>
                    <span className="text-xl font-black">{chapaCheckout.amount.toLocaleString()} ETB</span>
                  </div>
                </div>
              </div>

              {/* Supported Payment Channels */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Select Payment Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: 'Telebirr', color: 'border-blue-300 bg-blue-50 text-blue-800' },
                    { name: 'CBE Birr', color: 'border-purple-300 bg-purple-50 text-purple-800' },
                    { name: 'Bank Card (Mastercard/Visa)', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
                    { name: 'Awash / BOA Mobile', color: 'border-amber-300 bg-amber-50 text-amber-800' }
                  ].map((pm, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border font-bold text-xs text-center cursor-pointer shadow-xs ${pm.color}`}>
                      {pm.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Embedded Checkout Frame or External Redirect options */}
              <div className="p-4 rounded-2xl border border-[var(--border-color)] dark:border-slate-800 bg-[var(--bg-page)] dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[var(--text-secondary)] dark:text-slate-300 space-y-1">
                  <p className="font-bold text-[var(--text-primary)] dark:text-white">Complete your payment securely:</p>
                  <p>Option 1: Click <a href={chapaCheckout.checkout_url} target="_blank" rel="noreferrer" className="text-amber-600 underline font-bold">Open Chapa Hosted Page</a> to pay in browser tab.</p>
                  <p>Option 2: Click <strong>"Verify & Activate Premium"</strong> below once completed.</p>
                </div>
                <a
                  href={chapaCheckout.checkout_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-sm"
                >
                  🔗 Open Chapa Tab ↗
                </a>
              </div>

              {/* Verification Button */}
              <div className="pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
                <button
                  onClick={() => setChapaCheckout(null)}
                  className="px-4 py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  ← Back to Plans
                </button>

                <button
                  onClick={handleConfirmPayment}
                  disabled={isVerifying}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {isVerifying ? (
                    <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Verifying with Chapa...</>
                  ) : (
                    '✅ Confirm & Activate Premium'
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
