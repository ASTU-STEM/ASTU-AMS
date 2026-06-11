import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Users, Briefcase, BarChart3, ShieldCheck } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  showLogo?: boolean;
  maxWidth?: string;
  rightWidth?: string;
}

export default function AuthLayout({ children, title, subtitle, showLogo = true, maxWidth = 'max-w-md', rightWidth = 'lg:w-1/2' }: AuthLayoutProps) {
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
    <div className="min-h-screen bg-surface">
      {/* Top Navigation */}
      <header className="border-b border-outline-variant bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-full bg-astu-navy p-2 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-astu-navy">ASTU AMS</span>
          </Link>
          <Link to="/" className="text-sm font-semibold text-on-surface-variant hover:text-astu-navy">
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Left Side - Branding & Features (Desktop) */}
        <div
          className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 py-8 text-white relative overflow-hidden"
          style={{
            backgroundImage: 'url(/images/astuget.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/55 to-astu-navy/60"></div>
          
          {/* Content container - properly centered */}
          <div className="relative z-10 flex flex-col justify-center max-w-lg mx-auto w-full">
            <div className="mb-10 text-center lg:text-left">
              <div className="inline-flex mb-6 h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md shadow-lg">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight drop-shadow-lg">
                Welcome to ASTU-AMS
              </h1>
              <p className="text-lg text-white/90 drop-shadow">
                The official alumni management system connecting graduates, employers, and the university community.
              </p>
            </div>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-5">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="mb-1.5 text-lg font-semibold drop-shadow">{feature.title}</h3>
                    <p className="text-sm text-white/80 drop-shadow">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 rounded-xl bg-white/15 p-6 backdrop-blur-md border border-white/10">
              <p className="text-sm font-medium text-white/95 drop-shadow">
                "ASTU-AMS has transformed how we connect with our alumni and track graduate success."
              </p>
              <p className="mt-2 text-xs text-white/70">
                — University Administration
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className={`flex w-full items-center justify-center bg-surface p-4 ${rightWidth} sm:p-8 lg:p-12`}>
          <div className={`w-full ${maxWidth}`}>
            {/* Logo */}
            {showLogo && (
              <div className="flex justify-center mb-6">
                <img 
                  src="/images/astu-logo-modified.png" 
                  alt="ASTU Logo" 
                  className="h-20 w-20 rounded-full object-contain sm:h-24 sm:w-24 md:h-28 md:w-28"
                  onError={(e) => {
                    e.currentTarget.src = "/images/astu-logo-modified.png";
                  }}
                />
              </div>
            )}

            {/* Title and Subtitle */}
            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-astu-navy mb-2">{title}</h1>
              <p className="text-sm text-on-surface-variant px-2">{subtitle}</p>
            </div>

            {/* Auth Card */}
            <div className="rounded-xl border border-outline-variant bg-white p-5 sm:p-8 shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}