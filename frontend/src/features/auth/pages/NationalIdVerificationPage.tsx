import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Shield, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import PrimaryButton from '../components/PrimaryButton';
import InlineAlert from '../components/InlineAlert';
import SupportLink from '../components/SupportLink';
import authService from '../services/auth.service';
import { useRegistration } from '../contexts/RegistrationContext';

export default function NationalIdVerificationPage() {
  const navigate = useNavigate();
  const { registrationDetails } = useRegistration();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDiditVerification = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const studentId = registrationDetails?.studentId || 'DEFAULT';
      const result = await authService.startDiditVerification(studentId);
      
      if (result.ok && result.data.sessionId) {
        toast.loading('Starting identity verification...', { duration: 2000 });
        // Navigate directly to the callback page with the sessionId
        navigate(`/verify-national-id/callback?sessionId=${result.data.sessionId}`);
      } else {
        setErrorMsg((result as any).message || 'Could not initialize Didit verification session.');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMsg('Didit.me verification service is temporarily unavailable.');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify with National ID"
      subtitle="Fast, secure identity check using your national ID"
      showLogo={true}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-lg bg-astu-navy/5 p-4 border border-astu-navy/10">
          <Shield className="h-5 w-5 text-astu-navy flex-shrink-0" />
          <p className="text-xs text-on-surface leading-relaxed">
            We verify your identity in seconds using your official Ethiopian National ID card through **didit.me**.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium bg-slate-50 p-3 rounded-lg border border-outline-variant">
          <span>Step 2 of 3: Verify identity</span>
          <span className="bg-astu-navy/10 text-astu-navy px-2 py-0.5 rounded-full text-[10px]">National ID</span>
        </div>

        {/* Failure / Unavailable state */}
        {errorMsg && (
          <InlineAlert 
            type="error"
            title="Verification Failed"
            message={errorMsg}
            action={
              <button
                type="button"
                onClick={() => navigate('/verify-manual')}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-800 hover:underline"
              >
                Try Manual Verification Instead
                <ArrowRight className="h-3 w-3" />
              </button>
            }
          />
        )}

        <div className="space-y-4">
          <PrimaryButton
            onClick={handleDiditVerification}
            loading={isLoading}
            disabled={isLoading}
            type="button"
            className="flex items-center justify-center gap-2"
          >
            <span>Continue with Didit</span>
            <ExternalLink className="h-4 w-4" />
          </PrimaryButton>

          <div className="rounded-lg bg-astu-navy/5 p-4 border border-outline-variant text-[11px] text-on-surface-variant leading-relaxed space-y-1.5">
            <p className="font-semibold text-astu-navy">🔒 Privacy Note</p>
            <p>
              Your National ID data is processed securely by didit.me. We do not store your physical ID card image or biometric information. Only identity verification confirmation is sent to the university.
            </p>
          </div>
        </div>

        {/* Navigation & Fallbacks */}
        <div className="pt-2 border-t border-outline-variant flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/verify-manual')}
            className="text-xs text-astu-navy hover:underline font-semibold"
          >
            I want to verify using documents manually →
          </button>

          <SupportLink 
            lastErrorCode="DIDIT_PAGE"
            label="Need assistance? Contact support"
            className="mt-1"
          />

          <button
            type="button"
            onClick={() => navigate('/verify-otp')}
            className="text-xs text-on-surface-variant hover:text-astu-navy font-semibold inline-flex items-center gap-1.5 mt-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to OTP verification
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
