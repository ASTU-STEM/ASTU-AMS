import React, { useRef, useState, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export default function OtpInput({
  value,
  onChange,
  disabled = false,
  hasError = false
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Keep internal state in sync with parent value changes
  useEffect(() => {
    const digits = (value || '').slice(0, 6).split('');
    const newOtp = Array(6).fill('').map((_, idx) => digits[idx] || '');
    setOtp(newOtp);
  }, [value]);

  const handleInputChange = (val: string, index: number) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (!cleanVal) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      onChange(newOtp.join(''));
      return;
    }

    const singleChar = cleanVal.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = singleChar;
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Move to next input box if not at end
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;
    const pastedData = e.clipboardData.getData('text/plain');
    const cleanDigits = pastedData.replace(/[^0-9]/g, '').slice(0, 6);
    
    if (cleanDigits.length > 0) {
      const newOtp = Array(6).fill('').map((_, idx) => cleanDigits[idx] || '');
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      const focusIndex = Math.min(cleanDigits.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="flex gap-2.5 sm:gap-3" 
        role="group" 
        aria-label="One-Time Password"
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={disabled}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            className={`
              w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold rounded-lg border
              transition-all duration-200 focus:outline-none focus:ring-2 bg-white text-on-surface
              disabled:opacity-50 disabled:cursor-not-allowed
              ${hasError
                ? 'border-astu-red focus:border-astu-red focus:ring-astu-red/20 bg-astu-red/5'
                : 'border-outline-variant focus:border-astu-navy focus:ring-astu-navy/20 hover:border-outline-variant/85'
              }
            `}
            aria-label={`Digit ${index + 1} of 6`}
            required
          />
        ))}
      </div>
      <p className="sr-only">Please enter the 6-digit OTP code sent to your email.</p>
    </div>
  );
}
