import React, { useState } from "react";
import {
  HiXMark,
  HiCheckCircle,
  HiExclamationCircle,
} from "react-icons/hi2";
import { MdPhone, MdPerson, MdMoney } from "react-icons/md";
import { Smartphone } from "lucide-react";
import toast from "react-hot-toast";

interface DonationCampaign {
  title: string;
  category: string;
}

export default function TelebirrDonationModal({
  isOpen,
  onClose,
  campaign,
}: {
  isOpen: boolean;
  onClose: () => void;
  campaign: DonationCampaign | null;
}) {
  const [step, setStep] = useState<"form" | "confirm" | "success" | "failed">(
    "form"
  );
  const [donorName, setDonorName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    const amt = parseInt(amount);
    if (!amt || amt < 10) {
      toast.error("Minimum donation is 10 ETB");
      return;
    }
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    const success = Math.random() > 0.15;
    setStep(success ? "success" : "failed");
    setIsProcessing(false);
  };

  const handleReset = () => {
    setStep("form");
    setDonorName("");
    setPhoneNumber("");
    setAmount("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={step === "form" ? onClose : undefined}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-[mega-menu-fade-in_150ms_ease-out_both] overflow-hidden">
        {step === "form" && (
          <>
            <div className="bg-gradient-to-r from-astu-navy to-[#004d99] p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-[#FFD700]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                    Telebirr Payment
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <HiXMark className="h-5 w-5" />
                </button>
              </div>
              <h3 className="text-lg font-bold mt-2">{campaign.title}</h3>
              <p className="text-sm text-white/70 mt-1">
                Support ASTU through secure Telebirr payment
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <MdPerson className="h-4 w-4" />
                  Your Name
                </label>
                <input
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-astu-navy focus:outline-none focus:ring-2 focus:ring-astu-navy/20 transition-all"
                  placeholder="e.g. Abebe Bikila"
                  type="text"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <MdPhone className="h-4 w-4" />
                  Telebirr Phone Number
                </label>
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-astu-navy focus:outline-none focus:ring-2 focus:ring-astu-navy/20 transition-all"
                  placeholder="e.g. +251 911 234 567"
                  type="tel"
                />
                <p className="text-[10px] text-gray-400 mt-1.5">
                  You will receive a payment request on Telebirr
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <MdMoney className="h-4 w-4" />
                  Amount (ETB)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {presetAmounts.map((val) => (
                    <button
                      key={val}
                      onClick={() => handlePresetAmount(val)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        amount === val.toString()
                          ? "bg-astu-navy text-white border-astu-navy"
                          : "bg-white text-gray-700 border-gray-200 hover:border-astu-navy/30"
                      }`}
                    >
                      {val.toLocaleString()} ETB
                    </button>
                  ))}
                </div>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-astu-navy focus:outline-none focus:ring-2 focus:ring-astu-navy/20 transition-all"
                  placeholder="Custom amount"
                  type="text"
                  inputMode="numeric"
                />
              </div>

              <button
                onClick={handleProceed}
                className="w-full py-3 bg-gradient-to-r from-astu-navy to-[#004d99] text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
              >
                Proceed to Payment
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <div className="p-6 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-astu-navy/10 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="h-8 w-8 text-astu-navy" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Confirm Payment
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                A payment request will be sent to your Telebirr
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Campaign</span>
                <span className="font-bold text-gray-900">
                  {campaign.title}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Donor</span>
                <span className="font-bold text-gray-900">{donorName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phone</span>
                <span className="font-bold text-gray-900">{phoneNumber}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="text-lg font-extrabold text-astu-navy">
                  {parseInt(amount).toLocaleString()} ETB
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                disabled={isProcessing}
              >
                Edit
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-astu-navy to-[#004d99] text-white text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Confirm & Pay"
                )}
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-astu-green/10 flex items-center justify-center mx-auto">
              <HiCheckCircle className="h-10 w-10 text-astu-green" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Payment Successful!
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Thank you, {donorName}! Your donation of{" "}
                {parseInt(amount).toLocaleString()} ETB to{" "}
                <strong>{campaign.title}</strong> has been processed.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm">
              <p className="text-gray-500">Transaction reference:</p>
              <p className="font-mono font-bold text-astu-navy">
                TLB-{Date.now().toString(36).toUpperCase()}
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-astu-navy text-white text-sm font-bold hover:shadow-lg transition-all"
            >
              Done
            </button>
          </div>
        )}

        {step === "failed" && (
          <div className="p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <HiExclamationCircle className="h-10 w-10 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Payment Failed
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                The transaction could not be completed. Please check your
                Telebirr balance and try again.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setStep("form");
                  setAmount("");
                }}
                className="flex-1 py-3 rounded-xl bg-astu-navy text-white text-sm font-bold hover:shadow-lg transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
