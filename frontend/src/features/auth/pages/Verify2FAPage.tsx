import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../../layouts/AuthLayout';
import authService from '../services/auth.service';

const roleRoutes: Record<string, string> = {
  ALUMNI: '/alumni/dashboard',
  EMPLOYER: '/employer/dashboard',
  REGISTRAR: '/registrar/dashboard',
  DEPARTMENT_HEAD: '/department/dashboard',
  SUPER_ADMIN: '/admin/dashboard',
  ADMIN: '/ict/dashboard',
  CMS_MANAGER: '/cms/dashboard',
  ALUMNI_OFFICE: '/cms/dashboard',
};

export default function Verify2FAPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pending login credentials passed via location state
  const pendingAuth = (location.state as any) || {};
  const email = pendingAuth.email || 'your account email';
  const emailOrStudentId = pendingAuth.emailOrStudentId || '';
  const password = pendingAuth.password || '';
  const rememberMe = pendingAuth.rememberMe || false;

  const [activeTab, setActiveTab] = useState<'app' | 'email'>('app');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // If user navigated directly without pending credentials, redirect back to login
  useEffect(() => {
    if (!emailOrStudentId || !password) {
      toast('Please sign in with your credentials first.', { icon: 'ℹ️' });
      navigate('/login');
    }
  }, [emailOrStudentId, password, navigate]);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleSendEmailOtp = async () => {
    if (!email) return;
    setSendingEmailOtp(true);
    try {
      const res = await authService.send2FAOTP(email);
      if (res.ok) {
        setEmailOtpSent(true);
        setResendTimer(45);
        toast.success(`Verification code sent to ${email}`);
      } else {
        toast.error(res.message || 'Failed to send OTP code to email.');
      }
    } catch (err) {
      toast.error('Error sending email verification code.');
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 4) {
      toast.error('Please enter a valid 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({
        emailOrStudentId,
        password,
        rememberMe,
        twoFactorCode: code.trim(),
      } as any);

      if (response.ok && response.data?.user) {
        toast.success('Two-Factor Authentication verified! Signing in...', { id: '2fa-success' });
        const route = roleRoutes[response.data.user.role] || '/alumni/dashboard';
        navigate(route);
      } else {
        toast.error(response.message || 'Invalid verification code. Please try again.');
      }
    } catch (err) {
      toast.error('Verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Two-Factor Authentication"
      subtitle="Complete 2FA verification to secure your account access"
      showLogo={true}
    >
      <div className="space-y-6">
        {/* User Account Info Banner */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center font-bold text-xs">
              🛡️
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#003366]">Signing in as</p>
              <p className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[200px]">{email}</p>
            </div>
          </div>
          <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full">
            2FA Active
          </span>
        </div>

        {/* Verification Method Selection Tabs */}
        <div className="flex rounded-xl bg-[var(--bg-page)] p-1 border border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => { setActiveTab('app'); setCode(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'app'
                ? 'bg-white text-[#003366] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>📱</span> Authenticator App
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setCode('');
              if (!emailOtpSent) handleSendEmailOtp();
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'email'
                ? 'bg-white text-[#003366] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>✉️</span> Email Verification
          </button>
        </div>

        {/* Form area based on tab */}
        <form onSubmit={handleVerify} className="space-y-5">
          {activeTab === 'app' ? (
            <div className="space-y-3 text-center">
              <p className="text-xs text-[var(--text-secondary)]">
                Open your <span className="font-bold text-[var(--text-primary)]">Google Authenticator</span> or TOTP app and enter your 6-digit code:
              </p>
              <div>
                <label className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  6-Digit App Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full text-center text-2xl font-mono tracking-[0.4em] p-3.5 rounded-xl border border-[var(--border-color)] focus:ring-2 focus:ring-[#003366] text-[var(--text-primary)] font-extrabold shadow-inner"
                  required
                  autoFocus
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                We send a 6-digit security code directly to <span className="font-bold text-[#003366]">{email}</span>:
              </p>

              <div className="flex justify-center">
                <button
                  type="button"
                  disabled={resendTimer > 0 || sendingEmailOtp}
                  onClick={handleSendEmailOtp}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-page)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] text-xs font-bold transition-all border border-[var(--border-color)] disabled:opacity-60 flex items-center gap-2"
                >
                  <span>{sendingEmailOtp ? '⏳ Sending Code...' : resendTimer > 0 ? `Resend Code in ${resendTimer}s` : '📩 Send Code to Email'}</span>
                </button>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  6-Digit Email Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 849204"
                  className="w-full text-center text-2xl font-mono tracking-[0.4em] p-3.5 rounded-xl border border-[var(--border-color)] focus:ring-2 focus:ring-[#003366] text-[var(--text-primary)] font-extrabold shadow-inner"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#003366] hover:bg-[#00264d] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Verifying...' : 'Verify & Sign In'}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[#003366] transition-colors"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
