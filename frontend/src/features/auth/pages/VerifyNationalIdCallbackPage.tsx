import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, ShieldAlert, ShieldCheck, Loader2, ArrowLeft, Camera, RotateCcw, ScanLine, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Tesseract from 'tesseract.js';
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

  // Step: camera → scanning → verifying → success | failed
  const [step, setStep] = useState<'camera' | 'preview' | 'scanning' | 'verifying' | 'success' | 'failed'>('camera');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedName, setExtractedName] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setErrorMsg('Unable to access camera. Please allow camera permission or try manual verification.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Start camera on mount
  useEffect(() => {
    if (sessionId && step === 'camera') {
      startCamera();
    }
    return () => stopCamera();
  }, [sessionId, step, startCamera, stopCamera]);

  // Capture photo from the camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
    stopCamera();
    setStep('preview');
  };

  // Handle file upload as fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      stopCamera();
      setStep('preview');
    };
    reader.readAsDataURL(file);
  };

  // Retake photo
  const retake = () => {
    setCapturedImage(null);
    setErrorMsg(null);
    setStep('camera');
  };

  // Run OCR on the captured image, then verify
  const processAndVerify = async () => {
    if (!capturedImage) return;
    setStep('scanning');
    setOcrProgress(0);
    setErrorMsg(null);

    try {
      // Run Tesseract OCR on the image
      const result = await Tesseract.recognize(capturedImage, 'eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const ocrText = result.data.text;
      console.log('OCR extracted text:', ocrText);

      if (!ocrText || ocrText.trim().length < 3) {
        setStep('failed');
        setErrorMsg('Could not read any text from the ID card. Please retake the photo with better lighting and ensure the text is clearly visible.');
        return;
      }

      // Extract name from OCR text
      // Ethiopian IDs typically have "Name" or "Full Name" fields.
      // We try multiple patterns to find the name.
      const name = extractNameFromOCR(ocrText);

      if (!name) {
        setStep('failed');
        setErrorMsg(
          `Could not extract a name from the scanned ID. The OCR detected the following text:\n\n"${ocrText.substring(0, 200)}"\n\nPlease ensure the ID card is clearly visible and well-lit, or try manual verification.`
        );
        return;
      }

      setExtractedName(name);

      // Now verify with the backend
      setStep('verifying');

      const verifyResult = await authService.verifyDiditSession(sessionId, name);

      if (verifyResult.ok && verifyResult.data.status === 'success') {
        setStep('success');
        toast.success('Identity verified successfully!');
      } else {
        setStep('failed');
        const msg = verifyResult.ok ? verifyResult.data.message : (verifyResult as any).message;
        setErrorMsg(msg || 'Name on the ID does not match your alumni record.');
      }
    } catch (err) {
      console.error('OCR/Verification error:', err);
      setStep('failed');
      setErrorMsg('An error occurred while scanning the ID card. Please try again.');
    }
  };

  // --- No session ---
  if (!sessionId) {
    return (
      <AuthLayout title="Session Error" subtitle="No verification session found" showLogo={true}>
        <div className="space-y-5">
          <InlineAlert type="error" title="Missing Session" message="No verification session identifier was found. Please restart the Didit verification." />
          <PrimaryButton onClick={() => navigate('/verify-national-id')}>Restart Verification</PrimaryButton>
        </div>
      </AuthLayout>
    );
  }

  // --- Render ---
  return (
    <AuthLayout
      title="National ID Verification"
      subtitle="Scan your National ID card to verify your identity"
      showLogo={true}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Step Indicator */}
        <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium bg-slate-50 p-3 rounded-lg border border-outline-variant">
          <span>Step 2 of 3: Verify identity</span>
          <span className="bg-astu-navy/10 text-astu-navy px-2 py-0.5 rounded-full text-[10px]">
            {step === 'camera' || step === 'preview' ? 'Capture ID' : step === 'scanning' ? 'Scanning...' : step === 'verifying' ? 'Verifying...' : step === 'success' ? 'Verified ✓' : 'Failed'}
          </span>
        </div>

        {/* ========== CAMERA STEP ========== */}
        {step === 'camera' && (
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-astu-navy/20 bg-black relative overflow-hidden" style={{ minHeight: 320 }}>
              {/* Live camera feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ minHeight: 320 }}
              />

              {/* ID card overlay guide */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-white/60 rounded-xl" style={{ width: '85%', height: '60%' }}>
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-3 py-1 rounded-full">
                    Position your ID card within the frame
                  </div>
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-white rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-white rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-white rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-white rounded-br-lg" />
                </div>
              </div>

              {/* Scanning line animation */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[85%] h-[60%] relative overflow-hidden">
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-astu-teal to-transparent animate-bounce" style={{ top: '50%' }} />
                </div>
              </div>
            </div>

            {/* Camera error */}
            {errorMsg && <InlineAlert type="error" message={errorMsg} />}

            {/* Capture button */}
            <div className="flex gap-3">
              <PrimaryButton onClick={capturePhoto} type="button" className="flex-1">
                <span className="flex items-center justify-center gap-2">
                  <Camera className="h-5 w-5" />
                  Capture ID Card
                </span>
              </PrimaryButton>
            </div>

            {/* File upload fallback */}
            <div className="text-center">
              <label className="text-xs text-on-surface-variant hover:text-astu-navy cursor-pointer font-medium underline">
                Or upload a photo of your ID
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {/* ========== PREVIEW STEP ========== */}
        {step === 'preview' && capturedImage && (
          <div className="space-y-4">
            <div className="rounded-xl border-2 border-astu-navy/20 overflow-hidden relative">
              <img src={capturedImage} alt="Captured ID" className="w-full object-contain" style={{ maxHeight: 400 }} />
            </div>

            <div className="rounded-lg bg-blue-50 p-3 border border-blue-100 text-xs text-blue-800">
              <strong>Review:</strong> Make sure the text on your National ID is clearly readable. If not, retake the photo.
            </div>

            <div className="flex gap-3">
              <button
                onClick={retake}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold border-2 border-outline-variant rounded-lg hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </button>
              <PrimaryButton onClick={processAndVerify} type="button" className="flex-1">
                <span className="flex items-center justify-center gap-2">
                  <ScanLine className="h-4 w-4" />
                  Scan & Verify
                </span>
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ========== SCANNING STEP (OCR) ========== */}
        {step === 'scanning' && (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <Loader2 className="h-14 w-14 text-astu-navy animate-spin" />
                <ScanLine className="h-6 w-6 text-astu-navy absolute" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-astu-navy">Reading Your National ID...</p>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Our OCR engine is extracting text from your ID card. This may take a few seconds.
              </p>
            </div>
            {/* Progress bar */}
            <div className="max-w-xs mx-auto space-y-1">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-astu-navy to-astu-teal rounded-full transition-all duration-300"
                  style={{ width: `${ocrProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant">{ocrProgress}% complete</p>
            </div>
          </div>
        )}

        {/* ========== VERIFYING STEP ========== */}
        {step === 'verifying' && (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <Loader2 className="h-14 w-14 text-astu-teal animate-spin" />
                <Shield className="h-6 w-6 text-astu-teal absolute" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-astu-navy">Verifying Identity...</p>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Comparing the name from your ID with your alumni records.
              </p>
              {extractedName && (
                <p className="text-xs mt-2">
                  Extracted name: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-outline-variant font-semibold">{extractedName}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* ========== SUCCESS STEP ========== */}
        {step === 'success' && (
          <div className="space-y-6 text-center py-4">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 border-2 border-emerald-200 p-1">
                <ShieldCheck className="h-10 w-10 text-emerald-600" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-bold text-astu-navy">Identity Verified Successfully!</p>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Your National ID name matches your alumni records. Your account is now <strong className="text-emerald-600">active</strong>.
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-100 text-xs text-emerald-800 space-y-1 text-left">
              <p><strong>Student ID:</strong> {registrationDetails?.studentId || 'N/A'}</p>
              <p><strong>Name from ID:</strong> {extractedName}</p>
              <p><strong>Verification:</strong> National ID Camera Scan (Didit)</p>
            </div>

            <PrimaryButton onClick={() => { clearRegistration(); navigate('/login'); }} variant="primary">
              Log In to Portal
            </PrimaryButton>
          </div>
        )}

        {/* ========== FAILED STEP ========== */}
        {step === 'failed' && (
          <div className="space-y-5">
            <div className="flex justify-center py-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 border border-red-200 p-1">
                <ShieldAlert className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <InlineAlert
              type="error"
              title="Verification Failed"
              message={errorMsg || 'Could not verify your identity. Please try again or use manual verification.'}
            />

            {extractedName && (
              <div className="rounded-lg bg-amber-50 p-3 border border-amber-200 text-xs text-amber-800">
                <strong>Extracted name:</strong> "{extractedName}"
                {registrationDetails?.fullName && (
                  <> — <strong>Expected:</strong> "{registrationDetails.fullName}"</>
                )}
              </div>
            )}

            <div className="space-y-3">
              <PrimaryButton onClick={retake}>
                <span className="flex items-center justify-center gap-2">
                  <Camera className="h-4 w-4" />
                  Retake & Try Again
                </span>
              </PrimaryButton>
              <PrimaryButton onClick={() => navigate('/verify-manual')} variant="outline">
                Verify Manually Instead
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* Footer */}
        {(step === 'camera' || step === 'preview' || step === 'failed') && (
          <div className="pt-4 border-t border-outline-variant flex flex-col items-center gap-3">
            <SupportLink
              currentRoute="/verify-national-id/callback"
              lastErrorCode={step.toUpperCase()}
              sessionId={sessionId}
              label="Need assistance? Contact support"
            />
            <button
              onClick={() => { stopCamera(); navigate('/verify-national-id'); }}
              className="text-xs text-on-surface-variant hover:text-astu-navy font-semibold inline-flex items-center gap-1.5 mt-1 hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to verification options
            </button>
          </div>
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </AuthLayout>
  );
}

/**
 * Attempts to extract a full name from OCR text of an Ethiopian National ID.
 * Ethiopian IDs typically have labels like "Name", "Full Name", "ስም" (Amharic for name).
 * The function tries multiple patterns and returns the best match.
 */
function extractNameFromOCR(text: string): string | null {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Strategy 1: Look for "Name" label patterns
  const namePatterns = [
    /(?:full\s*name|name)\s*[:\-—]\s*(.+)/i,
    /(?:first\s*name|given\s*name)\s*[:\-—]\s*(.+)/i,
    /(?:ስም|ሙሉ\s*ስም)\s*[:\-—]\s*(.+)/i,
  ];

  for (const pattern of namePatterns) {
    for (const line of lines) {
      const match = line.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Validate it looks like a name (at least 2 chars, mostly letters)
        if (name.length >= 2 && /[a-zA-Z\u1200-\u137F]/.test(name)) {
          return name;
        }
      }
    }
  }

  // Strategy 2: Look for the line right after a "Name" label
  for (let i = 0; i < lines.length; i++) {
    if (/^(full\s*name|name|ስም|ሙሉ\s*ስም)\s*:?\s*$/i.test(lines[i])) {
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.length >= 2 && /[a-zA-Z\u1200-\u137F]/.test(nextLine)) {
          return nextLine;
        }
      }
    }
  }

  // Strategy 3: Find consecutive capitalized words that look like a name
  // (Fallback — pick the longest sequence of 2-4 capitalized words)
  let bestCandidate = '';
  for (const line of lines) {
    // Match lines that look like names: 2-4 words, each starting with uppercase
    const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/);
    if (nameMatch && nameMatch[1].length > bestCandidate.length) {
      bestCandidate = nameMatch[1];
    }
  }

  if (bestCandidate) return bestCandidate;

  // Strategy 4: If nothing matched, return the longest line that has mostly alphabetic chars
  const alphaLines = lines
    .filter(l => {
      const alphaCount = (l.match(/[a-zA-Z\u1200-\u137F]/g) || []).length;
      return alphaCount / l.length > 0.7 && l.length >= 4 && l.split(/\s+/).length >= 2;
    })
    .sort((a, b) => b.length - a.length);

  return alphaLines[0] || null;
}
