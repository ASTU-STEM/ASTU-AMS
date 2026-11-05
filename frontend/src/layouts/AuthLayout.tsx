import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, ShieldCheck, Users } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showLogo?: boolean;
  maxWidth?: string;
  rightWidth?: string;
}

const highlights = [
  {
    icon: Users,
    title: 'Alumni Network',
    description: 'Stay connected with graduates across Ethiopia and beyond.',
  },
  {
    icon: Briefcase,
    title: 'Careers & Mentorship',
    description: 'Discover roles, mentors, and employer partnerships.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Identity',
    description: 'Secure access backed by ASTU registrar records.',
  },
];

export default function AuthLayout({
  children,
  title,
  subtitle,
  showLogo = true,
  maxWidth = 'max-w-md',
  rightWidth = 'lg:w-1/2',
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="group flex items-center gap-2.5">
            <img
              src="/images/astu-seal-logo.png"
              alt=""
              className="h-9 w-9 rounded-full object-contain ring-1 ring-slate-200 transition group-hover:ring-astu-navy/40 dark:ring-slate-700"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="leading-tight">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-astu-red">
                ASTU
              </p>
              <p className="text-sm font-bold text-astu-navy dark:text-sky-300">
                Alumni Management System
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle className="text-slate-500 hover:text-astu-navy dark:text-slate-300 dark:hover:text-sky-300" />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-astu-navy dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-sky-300"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside
          className="relative hidden overflow-hidden text-white lg:flex lg:w-1/2 lg:flex-col lg:justify-center"
          style={{
            backgroundImage: 'url(/images/astuget.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-astu-navy/75 to-slate-950/85" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-astu-red/25 to-transparent" />
          <div className="relative z-10 mx-auto w-full max-w-lg px-12 py-16">
            <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.22em] text-amber-300">
              Adama Science and Technology University
            </p>
            <h1 className="mb-4 text-4xl font-black tracking-tight text-white xl:text-[2.75rem]">
              Welcome to ASTU-AMS
            </h1>
            <p className="mb-10 max-w-md text-base leading-relaxed text-white/85">
              The official alumni platform connecting graduates, employers, and the university community.
            </p>

            <ul className="space-y-5">
              {highlights.map((item) => (
                <li key={item.title} className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-white/70">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main
          className={`relative flex w-full items-center justify-center overflow-hidden px-4 py-8 sm:px-8 sm:py-12 lg:px-12 ${rightWidth}`}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(7,89,166,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(227,30,36,0.06),_transparent_45%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.08),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(227,30,36,0.08),_transparent_45%)]"
            aria-hidden="true"
          />
          <div className={`auth-panel relative z-10 w-full ${maxWidth}`}>
            {showLogo ? (
              <div className="mb-5 flex justify-center">
                <img
                  src="/images/astu-seal-logo.png"
                  alt="ASTU seal"
                  className="h-20 w-20 object-contain drop-shadow-sm sm:h-24 sm:w-24"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : null}

            <div className="mb-6 text-center">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-astu-red lg:hidden">
                Adama Science and Technology University
              </p>
              <h1 className="mb-1.5 text-2xl font-black tracking-tight text-astu-navy dark:text-white sm:text-3xl">
                {title}
              </h1>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {subtitle}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_40px_-24px_rgba(7,89,166,0.35)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/40 sm:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
