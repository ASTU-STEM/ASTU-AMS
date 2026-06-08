import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, ShieldAlert, ShieldCheck, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import AuthLayout from '../../../layouts/AuthLayout';
import PrimaryButton from '../components/PrimaryButton';
import InlineAlert from '../components/InlineAlert';
import SupportLink from '../components/SupportLink';
import authService from '../services/auth.service';
import { useRegistration } from '../contexts/RegistrationContext';

export default function VerifyNationalIdCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId') || searchParams.get('session_id') || '';
  
  const { registrationDetails, clearRegistration } = useRegistration();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed' | 'cancelled' | 'expired'>('processing');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      setStatus('failed');
      setErrorMsg('No verification session identifier found.');
      return;
    }

    let isSubscribed = true;
    let timer: any;

    const checkStatus = async () => {
      try {
        const result = await authService.getDiditStatus(sessionId);
        if (!isSubscribed) return;

        if (result.ok) {
          const currentStatus = result.data.status;
          setStatus(currentStatus);

          if (currentStatus === 'processing') {
            // Poll for maximum 60 seconds (20 times * 3 seconds)
            if (pollCount >= 20) {
              setStatus('expired');
              setErrorMsg('Verification session took too long and timed out. Please try again.');
              return;
            }
            setPollCount((prev) => prev + 1);
            timer = setTimeout(checkStatus, 3000);
          } else if (currentStatus === 'success') {
            // Complete registration by clearing temporary session storage
            clearRegistration();
          }
        } else {
          setStatus('failed');
          setErrorMsg((result as any).message || 'Failed to retrieve Didit verification status.');
        }
      } catch (err) {
        if (!isSubscribed) return;
        setStatus('failed');
        setErrorMsg('Error checking verification status.');
      }
    };

    checkStatus();

    return () => {
      isSubscribed = false;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId, pollCount]);

  // Handle support links
  const supportContext = {
    currentRoute: window.location.pathname,
    lastErrorCode: status.toUpperCase(),
    sessionId: sessionId
  };

  const renderContent = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <Loader2 className="h-10 w-10 text-astu-navy animate-spin" />
                <Shield className="h-5 w-5 text-astu-navy absolute" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-astu-navy">Verifying Your Identity</p>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                We are checking your identity credentials with didit.me. This process normally takes a few seconds...
              </p>
              <p className="text-[10px] text-on-surface-variant/70">
                Poll count: {pollCount} / 20
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 p-1">
                <ShieldCheck className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-astu-navy">Identity Verified Successfully!</p>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Thank you. Your National ID records have been authenticated. Your alumni registration is now complete.
              </p>
            </div>
            
            <PrimaryButton onClick={() => navigate('/login')} variant="primary">
              Log In to Portal
            </PrimaryButton>
          </div>
        );

      case 'cancelled':
        return (
          <div className="space-y-5">
            <InlineAlert 
              type="warning"
              title="Verification Cancelled"
              message="The Didit identity check was cancelled. If this was an accident, you can retry starting the session."
            />
            <div className="space-y-3">
              <PrimaryButton onClick={() => navigate('/verify-national-id')}>
                Restart Identity Verification
              </PrimaryButton>
              <PrimaryButton onClick={() => navigate('/verify-manual')} variant="outline">
                Try Manual Document Verification
              </PrimaryButton>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="space-y-5">
            <InlineAlert 
              type="error"
              title="Session Expired"
              message={errorMsg || 'The identity check session has expired or timed out.'}
            />
            <div className="space-y-3">
              <PrimaryButton onClick={() => navigate('/verify-national-id')}>
                Request New Session
              </PrimaryButton>
              <PrimaryButton onClick={() => navigate('/verify-manual')} variant="outline">
                Try Manual Document Verification
              </PrimaryButton>
            </div>
          </div>
        );

      case 'failed':
      default:
        return (
          <div className="space-y-5">
            <InlineAlert 
              type="error"
              title="Verification Failed"
              message={errorMsg || 'The digital ID verification failed. Please try again or use another verification method.'}
            />
            <div className="space-y-3">
              <PrimaryButton onClick={() => navigate('/verify-national-id')}>
                Retry National ID Verification
              </PrimaryButton>
              <PrimaryButton onClick={() => navigate('/verify-manual')} variant="outline">
                Verify Manually Instead
              </PrimaryButton>
            </div>
          </div>
        );
    }
  };

  return (
    <AuthLayout
      title="National ID Verification"
      subtitle="Identity status confirmation page"
      showLogo={true}
    >
      <div className="space-y-6">
        {/* Render status content */}
        {renderContent()}

        {/* Footer actions */}
        <div className="pt-4 border-t border-outline-variant flex flex-col items-center gap-3">
          <SupportLink 
            currentRoute="/verify-national-id/callback"
            lastErrorCode={status.toUpperCase()}
            sessionId={sessionId}
            label="Need assistance? Contact support"
          />

          {status !== 'processing' && status !== 'success' && (
            <button
              onClick={() => navigate('/register')}
              className="text-xs text-on-surface-variant hover:text-astu-navy font-semibold inline-flex items-center gap-1.5 mt-1 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Registration Form
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
