import React, { useState } from "react";
import {
  HiXMark,
  HiCheckCircle,
  HiXCircle,
  HiExclamationCircle,
} from "react-icons/hi2";
import { MdPhone, MdPerson, MdMoney } from "react-icons/md";
import { CreditCard, Lock, CheckCircle2, Check, ArrowLeft, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { alumniService } from "../features/alumni/services/alumni.service";

interface DonationCampaign {
  id?: string;
  title: string;
  category?: string;
  raised?: number;
  goal?: number;
  targetAmount?: number;
  donorCount?: number;
}

export default function TelebirrDonationModal({
  isOpen,
  onClose,
  campaign,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  campaign: DonationCampaign | null;
  onSuccess?: () => void;
}) {
  const [step, setStep] = useState<"form" | "confirm" | "success" | "failed">(
    "form"
  );
  const [showFullChapaPage, setShowFullChapaPage] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("500");
  const [selectedMethod, setSelectedMethod] = useState<'telebirr' | 'cbe' | 'card'>('telebirr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txRef, setTxRef] = useState("");

  if (!isOpen || !campaign) return null;

  const presetAmounts = [100, 250, 500, 1000, 5000];

  const handlePresetAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleProceed = () => {
    if (!donorName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    const amt = parseInt(amount);
    if (!amt || amt < 10) {
      toast.error("Minimum donation is 10 ETB");
      return;
    }
    const generatedRef = `ASTU-DON-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setTxRef(generatedRef);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    const numericAmount = parseInt(amount) || 500;
    const campaignId = campaign.id || 'campaign-1';

    try {
      // Step 1: Initialize Chapa donation payment
      const initResult = await alumniService.initializeChapaDonationPayment({
        campaignId,
        amount: numericAmount,
        donorName,
      });

      const currentTxRef = (initResult as any)?.tx_ref || txRef;
      setTxRef(currentTxRef);

      // Step 2: Verify Chapa donation payment
      await alumniService.verifyChapaDonationPayment({
        tx_ref: currentTxRef,
        campaignId,
        amount: numericAmount,
      });

      setStep("success");
      if (onSuccess) onSuccess();
      toast.success(`Thank you, ${donorName}! Your donation of ${numericAmount} ETB was processed via Chapa.`);
    } catch (err: any) {
      // A failed payment must never report success. Previously the catch block
      // fell through to setStep("success") and toasted "was processed via
      // Chapa", so a declined or errored payment still looked like a receipt
      // and onSuccess() still fired.
      console.error("Chapa donation failed:", err);
      setStep("failed");
      toast.error(
        err?.response?.data?.message ||
          "The donation could not be processed. No money was taken — please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setDonorName("");
    setPhoneNumber("");
    setAmount("500");
    setShowFullChapaPage(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={step === "form" ? onClose : undefined}
        />

        <div className="relative w-full max-w-md bg-[var(--bg-card)] rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-emerald-100">
          {step === "form" && (
            <>
              <div className="bg-gradient-to-r from-[#003366] via-emerald-800 to-teal-800 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
                      CH
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                      Chapa Donation Gateway
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <HiXMark className="h-5 w-5" />
                  </button>
                </div>
                <h3 className="text-lg font-extrabold mt-2">{campaign.title}</h3>
                <p className="text-xs text-white/80 mt-1 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  256-bit Encrypted Chapa Payment
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <MdPerson className="h-4 w-4 text-emerald-600" />
                    Donor Full Name
                  </label>
                  <input
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all font-medium text-[var(--text-primary)]"
                    placeholder="e.g. Wabi Tena"
                    type="text"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <MdPhone className="h-4 w-4 text-emerald-600" />
                    Phone Number (Optional)
                  </label>
                  <input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all font-medium text-[var(--text-primary)]"
                    placeholder="e.g. +251 911 234 567"
                    type="tel"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <MdMoney className="h-4 w-4 text-emerald-600" />
                    Donation Amount (ETB)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {presetAmounts.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handlePresetAmount(val)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold border transition-all ${
                          amount === val.toString()
                            ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                            : "bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-emerald-600/40"
                        }`}
                      >
                        {val.toLocaleString()} ETB
                      </button>
                    ))}
                  </div>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all font-extrabold text-emerald-900 text-base"
                    placeholder="Custom amount"
                    type="text"
                    inputMode="numeric"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest">Select Chapa Method</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('telebirr')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        selectedMethod === 'telebirr'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-1 ring-emerald-500'
                          : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <p className="text-xs font-extrabold">Telebirr</p>
                      <p className="text-[9px] text-emerald-600">Sandbox</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('cbe')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        selectedMethod === 'cbe'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-1 ring-emerald-500'
                          : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <p className="text-xs font-extrabold">CBE Birr</p>
                      <p className="text-[9px] text-emerald-600">Direct Pay</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedMethod('card')}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        selectedMethod === 'card'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-1 ring-emerald-500'
                          : 'border-[var(--border-color)] bg-[var(--bg-page)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <p className="text-xs font-extrabold">Chapa Card</p>
                      <p className="text-[9px] text-emerald-600">Visa/Mastercard</p>
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleProceed}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Chapa Payment
                    <CreditCard className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const generatedRef = `ASTU-DON-${Date.now()}`;
                      setTxRef(generatedRef);
                      setShowFullChapaPage(true);
                    }}
                    className="w-full py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    Open Chapa Full Checkout Portal View
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "confirm" && (
            <div className="p-6 space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <CreditCard className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-extrabold text-[var(--text-primary)]">
                  Confirm Chapa Donation
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Secure processing by Chapa Payment Gateway
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 space-y-2.5 border border-emerald-100">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Campaign</span>
                  <span className="font-bold text-[var(--text-primary)] text-right max-w-xs truncate">
                    {campaign.title}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Donor Name</span>
                  <span className="font-bold text-[var(--text-primary)]">{donorName || "ASTU Supporter"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Payment Method</span>
                  <span className="font-bold text-emerald-800 uppercase">{selectedMethod} (Chapa)</span>
                </div>
                <div className="border-t border-emerald-200/60 pt-2.5 flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-secondary)]">Total Contribution</span>
                  <span className="text-xl font-black text-emerald-700">
                    {parseInt(amount || "500").toLocaleString()} ETB
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("form")}
                  className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-page)] transition-all"
                  disabled={isProcessing}
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-extrabold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Verifying Chapa...
                    </>
                  ) : (
                    <>
                      Confirm & Pay {parseInt(amount || "500").toLocaleString()} ETB
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto shadow-inner">
                <HiCheckCircle className="h-12 w-12 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                  Donation Verified!
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  Thank you, <strong>{donorName || "Generous Supporter"}</strong>! Your contribution of{" "}
                  <strong className="text-emerald-700">{parseInt(amount || "500").toLocaleString()} ETB</strong> to{" "}
                  <strong>{campaign.title}</strong> has been successfully processed via Chapa.
                </p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 text-left text-xs space-y-1 border border-emerald-100">
                <p className="text-[var(--text-muted)] font-medium">Chapa Transaction Reference:</p>
                <p className="font-mono font-bold text-emerald-800 text-sm">
                  {txRef || `ASTU-DON-${Date.now()}`}
                </p>
                <p className="text-[10px] text-emerald-600 pt-1">
                  Status: Completed & Verified on Chapa Sandbox
                </p>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl bg-emerald-700 text-white text-xs font-extrabold hover:bg-emerald-800 transition-all shadow-md"
              >
                Done & Return
              </button>
            </div>
          )}

          {step === "failed" && (
            <div className="p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto shadow-inner">
                <HiXCircle className="h-12 w-12 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                  Donation Not Completed
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  Your payment could not be verified, so no donation was recorded and no
                  money was taken. If you were charged, please contact the finance office
                  with the reference below.
                </p>
              </div>
              {txRef && (
                <div className="bg-red-50 rounded-2xl p-4 text-left text-xs space-y-1 border border-red-100">
                  <p className="text-[var(--text-muted)] font-medium">Transaction Reference:</p>
                  <p className="font-mono font-bold text-red-800 text-sm">{txRef}</p>
                  <p className="text-[10px] text-red-600 pt-1">Status: Failed</p>
                </div>
              )}
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl bg-slate-800 text-white text-xs font-extrabold hover:bg-slate-900 transition-all shadow-md"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Chapa Checkout Portal Page View for Donations */}
      {showFullChapaPage && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-[var(--bg-page)] flex flex-col font-sans">
          {/* Top Browser Bar */}
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800 shadow-md">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowFullChapaPage(false)}
                className="flex items-center gap-1 text-slate-300 hover:text-white font-semibold transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to ASTU Giving
              </button>
              <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-mono text-[11px]">
                <Lock className="h-3 w-3 text-emerald-400" />
                https://checkout.chapa.co/checkout/payment/{txRef || 'ASTU-DON-DEMO'}
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              Chapa Test Gateway Active
            </span>
          </div>

          {/* Main Checkout Box */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-card)] rounded-3xl max-w-2xl w-full shadow-2xl border border-[var(--border-color)] overflow-hidden grid grid-cols-1 md:grid-cols-5">
              
              {/* Left Column: Order Summary */}
              <div className="md:col-span-2 bg-slate-900 text-white p-6 space-y-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-base">
                      CH
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white">Chapa Pay</h4>
                      <p className="text-[10px] text-[var(--text-muted)]">Secure Donation Gateway</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Recipient</p>
                      <p className="text-sm font-extrabold text-emerald-400">ASTU Alumni Fund</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Campaign</p>
                      <p className="text-sm font-bold text-white leading-snug">{campaign.title}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Transaction Ref</p>
                      <p className="text-[11px] font-mono font-bold text-slate-300">{txRef || 'ASTU-DON-DEMO'}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Contribution Amount</p>
                  <p className="text-3xl font-black text-emerald-400">{parseInt(amount || "500").toLocaleString()} ETB</p>
                </div>
              </div>

              {/* Right Column: Interactive Payment Options */}
              <div className="md:col-span-3 p-6 space-y-5 flex flex-col justify-between bg-[var(--bg-card)]">
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">Complete Chapa Donation</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Select your preferred payment method below</p>

                  <div className="mt-4 space-y-3">
                    <div
                      onClick={() => setSelectedMethod('telebirr')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        selectedMethod === 'telebirr'
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-[var(--border-color)] hover:border-[var(--border-color)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-500 text-white font-black flex items-center justify-center text-xs">
                          tb
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[var(--text-primary)]">Telebirr Mobile Money</p>
                          <p className="text-[10px] text-[var(--text-muted)]">Test PIN: 1234</p>
                        </div>
                      </div>
                      {selectedMethod === 'telebirr' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    </div>

                    <div
                      onClick={() => setSelectedMethod('cbe')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        selectedMethod === 'cbe'
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-[var(--border-color)] hover:border-[var(--border-color)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#800020] text-white font-black flex items-center justify-center text-xs">
                          CBE
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[var(--text-primary)]">CBE Birr Account</p>
                          <p className="text-[10px] text-[var(--text-muted)]">Direct Bank Transfer</p>
                        </div>
                      </div>
                      {selectedMethod === 'cbe' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    </div>

                    <div
                      onClick={() => setSelectedMethod('card')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        selectedMethod === 'card'
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-[var(--border-color)] hover:border-[var(--border-color)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black flex items-center justify-center text-xs">
                          CARD
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[var(--text-primary)]">Visa / Mastercard</p>
                          <p className="text-[10px] text-[var(--text-muted)]">4000 0000 0000 0002</p>
                        </div>
                      </div>
                      {selectedMethod === 'card' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Processing Chapa Payment...
                      </>
                    ) : (
                      <>
                        Pay {parseInt(amount || "500").toLocaleString()} ETB Now
                        <Check className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFullChapaPage(false)}
                    className="w-full py-2 rounded-xl text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    Cancel & Return to Portal
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
