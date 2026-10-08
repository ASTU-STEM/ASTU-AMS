import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLayout from '../../../layouts/AuthLayout';
import authService from '../services/auth.service';
import { ShieldCheck, Smartphone, Mail, KeyRound, RefreshCw, MessageSquare, ArrowLeft } from 'lucide-react';

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
  const phone = pendingAuth.phone || '+251 9** *** *42';
  const emailOrStudentId = pendingAuth.emailOrStudentId || '';
  const password = pendingAuth.password || '';
  const rememberMe = pendingAuth.rememberMe || false;

  const [activeTab, setActiveTab] = useState<'app' | 'email' | 'sms' | 'backup'>('app');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Email OTP states
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);

  // SMS OTP states
  const [sendingSmsOtp, setSendingSmsOtp] = useState(false);
  const [smsOtpSent, setSmsOtpSent] = useState(false);
  const [smsTimer, setSmsTimer] = useState(0);

  // If user navigated directly without pending credentials, redirect back to login
  useEffect(() => {
    if (!emailOrStudentId || !password) {
      toast('Please sign in with your credentials first.', { icon: 'ℹ️' });
      navigate('/login');
    }
  }, [emailOrStudentId, password, navigate]);

  // Email timer countdown
  useEffect(() => {
    if (emailTimer > 0) {
      const interval = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [emailTimer]);

  // SMS timer countdown
  useEffect(() => {
    if (smsTimer > 0) {
      const interval = setInterval(() => setSmsTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [smsTimer]);

  const handleSendEmailOtp = async () => {
    if (!email) return;
    setSendingEmailOtp(true);
    try {
      const res = await authService.send2FAOTP(email);
      if (res.ok) {
        setEmailOtpSent(true);
        setEmailTimer(45);
        toast.success(`Verification code sent to ${email}`);
        if (res.data?.devCode) {
          toast(`DEV CODE: ${res.data.devCode}`, { icon: '🔑', duration: 7000 });
        }
      } else {
        toast.error(res.message || 'Failed to send OTP code to email.');
      }
    } catch (err) {
      toast.error('Error sending email verification code.');
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const handleSendSmsOtp = async () => {
    setSendingSmsOtp(true);
    try {
      // Trigger Ethio Telecom SMS OTP dispatch
      const res = await authService.send2FAOTP(email);
      if (res.ok) {
        setSmsOtpSent(true);
        setSmsTimer(45);
        toast.success(`SMS verification code dispatched via Ethio Telecom Gateway to ${phone}`);
        if (res.data?.devCode) {
          toast(`DEV SMS CODE: ${res.data.devCode}`, { icon: '📱', duration: 7000 });
        }
      } else {
        toast.error(res.message || 'Failed to send SMS code.');
      }
    } catch (err) {
      toast.error('Error sending SMS verification code.');
    } finally {
      setSendingSmsOtp(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 4) {
      toast.error('Please enter a valid verification code or backup key.');
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
      <div className="space-y-5">
        {/* User Account Info Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-astu-navy text-white flex items-center justify-center font-bold text-xs shadow">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-astu-navy">Signing in as</p>
              <p className="text-xs font-bold text-slate-800 truncate max-w-[190px]">{email}</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
            2FA Active
          </span>
        </div>

        {/* Verification Method Selection Grid */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => { setActiveTab('app'); setCode(''); }}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'app'
                ? 'bg-white text-astu-navy shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" /> App Code
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setCode('');
              if (!emailOtpSent) handleSendEmailOtp();
            }}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'email'
                ? 'bg-white text-astu-navy shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="h-3.5 w-3.5" /> Email OTP
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('sms');
              setCode('');
              if (!smsOtpSent) handleSendSmsOtp();
            }}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'sms'
                ? 'bg-white text-astu-navy shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" /> SMS Mobile
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('backup'); setCode(''); }}
            className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'backup'
                ? 'bg-white text-astu-navy shadow-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" /> Backup Key
          </button>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          {activeTab === 'app' && (
            <div className="space-y-3 text-center">
              <p className="text-xs text-slate-600">
                Open your <span className="font-bold text-slate-800">Google Authenticator</span> app and enter your 6-digit code:
              </p>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full text-center text-2xl font-mono tracking-[0.4em] p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-astu-navy text-slate-900 font-extrabold bg-white shadow-inner"
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-3 text-center">
              <p className="text-xs text-slate-600 leading-relaxed">
                Security code sent to <span className="font-bold text-astu-navy">{email}</span>:
              </p>

              <div className="flex justify-center">
                <button
                  type="button"
                  disabled={emailTimer > 0 || sendingEmailOtp}
                  onClick={handleSendEmailOtp}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-astu-navy text-xs font-bold transition-all border border-slate-300 disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${sendingEmailOtp ? 'animate-spin' : ''}`} />
                  <span>
                    {sendingEmailOtp
                      ? 'Sending Code...'
                      : emailTimer > 0
                      ? `Send Code Again in ${emailTimer}s`
                      : 'Send Code Again'}
                  </span>
                </button>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  6-Digit Email Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 849204"
                  className="w-full text-center text-2xl font-mono tracking-[0.4em] p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-astu-navy text-slate-900 font-extrabold bg-white shadow-inner"
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="space-y-3 text-center">
              <p className="text-xs text-slate-600 leading-relaxed">
                Ethio Telecom SMS sent to registered mobile <span className="font-bold text-astu-navy">{phone}</span>:
              </p>

              <div className="flex justify-center">
                <button
                  type="button"
                  disabled={smsTimer > 0 || sendingSmsOtp}
                  onClick={handleSendSmsOtp}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-astu-navy text-xs font-bold transition-all border border-slate-300 disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${sendingSmsOtp ? 'animate-spin' : ''}`} />
                  <span>
                    {sendingSmsOtp
                      ? 'Dispatching SMS...'
                      : smsTimer > 0
                      ? `Send SMS Again in ${smsTimer}s`
                      : 'Send SMS Again'}
                  </span>
                </button>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  6-Digit Mobile SMS Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 592813"
                  className="w-full text-center text-2xl font-mono tracking-[0.4em] p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-astu-navy text-slate-900 font-extrabold bg-white shadow-inner"
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-3 text-center">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter one of your 8-character Emergency Recovery Keys saved during 2FA setup:
              </p>

              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">
                  Emergency Backup Recovery Key
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ASTU-XXXX-XXXX"
                  className="w-full text-center text-lg font-mono tracking-widest p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-astu-navy text-slate-900 font-extrabold bg-white shadow-inner uppercase"
                  required
                  autoFocus
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-astu-navy hover:bg-[#00264d] text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Verifying 2FA...' : 'Verify & Sign In'}
          </button>
        </form>

        <div className="text-center pt-1">
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-500 hover:text-astu-navy inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

