import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, Briefcase, BarChart3, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showLogo?: boolean;
  maxWidth?: string;
  rightWidth?: string;
}

export default function AuthLayout({ children, title, subtitle, showLogo = true, maxWidth = 'max-w-md', rightWidth = 'lg:w-1/2' }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  const features = [
    {
      icon: Users,
      title: 'Alumni Network',
      description: 'Connect with graduates and build professional relationships',
    },
    {
      icon: Briefcase,
      title: 'Job Opportunities',
      description: 'Access exclusive job postings and career resources',
    },
    {
      icon: BarChart3,
      title: 'Career Analytics',
      description: 'Track your career growth and industry insights',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Profiles',
      description: 'Secure, university-verified alumni credentials',
    },
  ];

  return (
    <div className="app-shell min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] dark:text-slate-100 transition-colors duration-200">
      {/* Top Navigation */}
      <header className="border-b border-outline-variant bg-[var(--bg-card)] backdrop-blur dark:bg-slate-900/95 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-full bg-astu-navy p-2 text-white shadow-sm">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-astu-navy dark:text-blue-200">ASTU AMS</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant dark:border-slate-700 bg-surface-container-low dark:bg-slate-800 text-[var(--text-secondary)] dark:text-amber-400 hover:bg-[var(--bg-page)] dark:hover:bg-slate-700 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-[var(--text-secondary)]" />}
            </button>
            <Link to="/" className="text-sm font-semibold text-on-surface-variant hover:text-astu-navy dark:text-slate-300 dark:hover:text-white transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Left Side - Branding & Features (Desktop) */}
        <div 
          className="hidden lg:flex lg:w-1/2 flex-col justify-start pt-24 px-12 pb-12 text-white relative overflow-hidden"
          style={{
            backgroundImage: 'url(/images/astuget.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-astu-navy/70 backdrop-blur-[2px]"></div>
          <div className="mx-auto max-w-lg relative z-10">
            <div className="mb-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="mb-3 text-4xl font-bold tracking-tight">
                Welcome to ASTU-AMS
              </h1>
              <p className="text-lg text-white/80">
                The official alumni management system connecting graduates, employers, and the university community.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold">{feature.title}</h3>
                    <p className="text-sm text-white/70">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-xl bg-white/10 p-6 backdrop-blur">
              <p className="text-sm font-medium text-white/90">
                "ASTU-AMS has transformed how we connect with our alumni and track graduate success."
              </p>
              <p className="mt-2 text-xs text-white/60">
                — University Administration
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className={`flex w-full items-center justify-center bg-[var(--bg-page)] p-4 ${rightWidth} sm:p-8 lg:p-12 transition-colors duration-200`}>
          <div className={`w-full ${maxWidth}`}>
            {/* Logo */}
            {showLogo && (
              <div className="flex justify-center mb-4">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH" 
                  alt="ASTU Logo" 
                  className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 object-contain drop-shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = "/images/astu-logo.jpeg";
                  }}
                />
              </div>
            )}

            {/* Title and Subtitle */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-astu-navy dark:text-white mb-1.5">{title}</h1>
              <p className="text-xs sm:text-sm text-on-surface-variant dark:text-slate-400 px-2">{subtitle}</p>
            </div>

            {/* Auth Card */}
            <div className="rounded-2xl border border-outline-variant bg-[var(--bg-card)] p-5 sm:p-8 shadow-sm dark:bg-slate-900/90 dark:border-slate-800 dark:shadow-2xl transition-colors duration-200">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
