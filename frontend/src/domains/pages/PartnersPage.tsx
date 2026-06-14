import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Building2, CheckCircle, ArrowRight, Handshake, Search, MessageSquare, TrendingUp } from 'lucide-react';
import Navbar from '../../shared/components/Navbar';
import { partnerLogos } from '../../shared/components/PartnerLogos';

const benefits = [
  {
    icon: Users,
    title: 'Hire Talented Graduates',
    description: 'Access a pool of verified ASTU graduates with practical skills in engineering, technology, and sciences.',
  },
  {
    icon: Briefcase,
    title: 'Post Job Opportunities',
    description: 'Publish employment opportunities, internships, and campus recruitment events directly to our alumni network.',
  },
  {
    icon: MessageSquare,
    title: 'Give Industry Feedback',
    description: 'Provide valuable feedback on curriculum relevance and help shape future graduates to meet industry needs.',
  },
  {
    icon: Search,
    title: 'Verified Student Information',
    description: 'Search alumni by expertise, skills, department, and graduation year with verified credentials.',
  },
  {
    icon: TrendingUp,
    title: 'Track Recruitment Analytics',
    description: 'Monitor your recruitment metrics, application status, and hiring outcomes through our dashboard.',
  },
  {
    icon: Handshake,
    title: 'Build Strategic Partnerships',
    description: 'Establish long-term partnerships with ASTU for research collaboration, internships, and talent pipelines.',
  },
];

const features = [
  'TIN-verified employer accounts',
  'Direct access to 1,238+ registered alumni',
  'Curriculum-aligned skill matching',
  'Industry feedback integration',
  'Campus recruitment coordination',
  'Accreditation-ready reporting',
];

const partners = [
  { name: 'Ethio Telecom' },
  { name: 'INSA' },
  { name: 'Ethiopian Airlines' },
  { name: 'Safaricom' },
  { name: 'Huawei' },
  { name: 'Commercial Bank of Ethiopia' },
];

export default function PartnersPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-astu-navy via-slate-900 to-astu-red">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:3rem_3rem]" />
        <div className="relative mx-auto max-w-[1440px] px-4 py-24 md:px-8 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Building2 className="h-5 w-5 text-astu-red" />
              <span className="text-sm font-semibold text-white">Employer Partnership Program</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              Partner with ASTU to Access{' '}
              <span className="text-[#FFD700]">Top Graduates</span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-slate-200 md:text-xl">
              Connect with verified alumni talent, post job opportunities, and shape the future of 
              technical education through industry collaboration.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={() => navigate('/employers/register')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-astu-red px-8 py-4 text-base font-semibold text-white hover:bg-astu-red/90 transition-all hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-astu-red/20"
              >
                Register as Employer
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-sm"
              >
                Employer Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-astu-navy md:text-4xl">
            Why Partner with ASTU?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-on-surface-variant">
            Join 500+ partner organizations already hiring from ASTU's talented graduate pool
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group rounded-xl border border-outline-variant bg-white p-6 shadow-[0_2px_8px_rgba(0,51,102,0.06)] transition-all hover:shadow-lg hover:shadow-astu-navy/10 hover:-translate-y-1"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-astu-navy/10 text-astu-navy group-hover:bg-astu-navy group-hover:text-white transition-colors">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-astu-navy">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Partner Companies Section (from home page) */}
      <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 overflow-hidden bg-white rounded-2xl my-8 border border-outline-variant">
        <div className="mb-10 text-center">
          <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">Partner Companies</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">Institutional partners supporting employability, accreditation feedback, internships, and research collaboration.</p>
        </div>
        <div className="relative">
          <div className="flex gap-6 animate-scroll hover:[animation-play-state:paused]">
            {[...partners, ...partners].map((partner, idx) => {
              const LogoComponent = partnerLogos[partner.name];
              return (
                <div
                  key={`${partner.name}-${idx}`}
                  className="flex min-w-[180px] flex-col items-center gap-3 rounded-xl border border-outline-variant bg-white p-5 shadow-[0_2px_8px_rgba(0,51,102,0.06)]"
                >
                  {LogoComponent ? (
                    <LogoComponent />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-astu-navy text-white text-sm font-bold shadow-md">
                      {partner.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-astu-navy text-center leading-tight">{partner.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Checklist */}
      <section className="bg-astu-navy/5">
        <div className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-astu-navy md:text-4xl">
                What You Get as a Partner
              </h2>
              <p className="mb-8 text-lg text-on-surface-variant">
                Our employer portal provides comprehensive tools to streamline your recruitment 
                process and connect you with the right talent.
              </p>
              <ul className="space-y-4">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-astu-green/10">
                      <CheckCircle className="h-4 w-4 text-astu-green" />
                    </div>
                    <span className="text-base font-medium text-on-surface">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-2xl bg-gradient-to-br from-astu-navy to-astu-red p-8 text-white shadow-2xl">
                <h3 className="mb-4 text-2xl font-bold">Ready to Get Started?</h3>
                <p className="mb-6 text-white/90">
                  Register your organization today and start connecting with ASTU's talented graduates.
                </p>
                <button
                  onClick={() => navigate('/employers/register')}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-astu-red px-6 py-3 text-base font-semibold text-white hover:bg-astu-red/90 transition-all hover:scale-105"
                >
                  Register Now
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-astu-navy md:text-5xl">1,238+</div>
            <div className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">
              Registered Alumni
            </div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-astu-navy md:text-5xl">500+</div>
            <div className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">
              Partner Organizations
            </div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-astu-navy md:text-5xl">87%</div>
            <div className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">
              Employment Rate
            </div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-astu-navy md:text-5xl">5</div>
            <div className="text-sm font-medium text-on-surface-variant uppercase tracking-wider">
              Fields of Study
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-astu-navy">
        <div className="mx-auto max-w-[1440px] px-4 py-16 text-center md:px-8 md:py-24">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Start Building Your Talent Pipeline Today
          </h2>
          <p className="mb-8 text-lg text-slate-200">
            Join ASTU's employer network and connect with Ethiopia's top engineering and technology graduates.
          </p>
          <button
            onClick={() => navigate('/employers/register')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-astu-red px-8 py-4 text-base font-semibold text-white hover:bg-astu-red/90 transition-all hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-astu-red/20"
          >
            Register Your Organization
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
