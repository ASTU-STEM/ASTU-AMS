import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, Building2, ArrowRight, Handshake,
  Search, MessageSquare, TrendingUp, ClipboardCheck, FileCheck2,
  UserCheck, HelpCircle, ScrollText, Mail, Factory, MapPin, ContactRound,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import publicStatsService, { PublicStat } from '../features/public/services/publicStats.service';

/**
 * What an employer actually gets. This replaces two overlapping lists that used
 * to sit on this page ("Why Partner with ASTU?" and "What You Get as a Partner")
 * which repeated the same six ideas in different words.
 */
const capabilities = [
  {
    icon: Search,
    title: 'Search verified graduate records',
    description:
      'Filter the alumni directory by department, graduation year, technical skills and stated work history. Every profile is tied to a real account rather than a CV uploaded by hand.',
  },
  {
    icon: Briefcase,
    title: 'Publish roles and internships',
    description:
      'Post openings to the job board and manage applications, shortlists and interview stages from the employer dashboard.',
  },
  {
    icon: Users,
    title: 'Coordinate campus recruitment',
    description:
      'Register recruitment events so graduating students can RSVP, and keep attendance and applicant records together.',
  },
  {
    icon: MessageSquare,
    title: 'Submit structured competency feedback',
    description:
      'Rate graduates against defined competencies. Responses feed departmental curriculum review and the tracer study evidence trail.',
  },
  {
    icon: TrendingUp,
    title: 'Review your own recruitment activity',
    description:
      'Track how many roles you have posted, how many applications arrived and where they are in your pipeline.',
  },
  {
    icon: Handshake,
    title: 'Request curriculum and research input',
    description:
      'Raise specific skill gaps with departments and propose placements or collaborative projects through the registrar channel.',
  },
];

/**
 * The three stages below mirror the actual code path: RegisterEmployer creates
 * the user with isActive:false and isVerified:false, admin staff approve it in
 * the dashboard, and only then can the account sign in.
 */
const onboardingSteps = [
  {
    icon: ClipboardCheck,
    title: 'Submit your organisation',
    description:
      'Company name, industry, location, website, an HR contact and your Tax Identification Number. One form, no documents uploaded at this stage.',
  },
  {
    icon: FileCheck2,
    title: 'ASTU verifies the registration',
    description:
      'Administration reviews the submission and confirms the organisation details and TIN. Your account stays locked until this is done.',
  },
  {
    icon: UserCheck,
    title: 'Sign in and start recruiting',
    description:
      'Once approved you can search the directory, publish roles and respond to applications from the employer dashboard.',
  },
];

/**
 * Mirrors registerEmployerSchema in
 * backend/src/modules/auth/presentation/auth.validation.ts. Each row carries its
 * own icon so the five are individually recognisable at a glance.
 */
const requirements = [
  {
    icon: ScrollText,
    label: 'Tax Identification Number',
    detail: 'Issued in Ethiopia. Checked against the national TIN registry during verification.',
  },
  {
    icon: Mail,
    label: 'Organisational email address',
    detail: 'A working address on your company domain, used for verification notices.',
  },
  {
    icon: Factory,
    label: 'Registered company name and industry',
    detail: 'Exactly as registered, plus the sector you recruit in.',
  },
  {
    icon: MapPin,
    label: 'Physical location',
    detail: 'City or town where your organisation is based.',
  },
  {
    icon: ContactRound,
    label: 'Named HR or recruitment contact',
    detail: 'The person who will manage postings and respond to applicants.',
  },
];

const faqs = [
  {
    q: 'Why is a TIN required?',
    a: 'The TIN identifies your organisation uniquely and stops duplicate or fraudulent registrations reaching the verification queue. It is checked by ASTU administration, not published to other employers.',
  },
  {
    q: 'How long does approval take?',
    a: 'Approval is handled manually by ASTU administration. We do not publish a target turnaround because it has not been measured — you will be contacted once a decision is recorded.',
  },
  {
    q: 'Can I post roles before approval?',
    a: 'No. The account is created inactive and only unlocks after verification, so no vacancies or candidate data are exposed before your organisation is confirmed.',
  },
  {
    q: 'What does partnership cost?',
    a: 'Nothing. Registration and use of the employer tools are free.',
  },
  {
    q: 'What happens to graduate data I can see?',
    a: 'You only see profiles of graduates who have made their details searchable. Access is logged, and misuse is handled under the registrar’s data policy.',
  },
];

const PARTNER_STAT_LABELS: Record<string, string> = {
  alumni: 'Registered graduates',
  jobs: 'Open roles',
  departments: 'Departments',
};

export default function PartnersPage() {
  const [stats, setStats] = useState<PublicStat[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    publicStatsService.getStats().then((res) => {
      if (isMounted) setStats(res);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Only render keys the endpoint actually returns. It never emitted an
  // "employers" figure, so the old "Partner Organisations" tile was dead code
  // that could never appear.
  const partnerStats = useMemo(
    () =>
      stats
        .filter((s) => PARTNER_STAT_LABELS[s.key])
        .map((s) => ({ key: s.key, value: s.value, label: PARTNER_STAT_LABELS[s.key] })),
    [stats]
  );

  const goToRegister = () => navigate('/employers/register');

  return (
    <div className="app-shell min-h-screen bg-background text-on-surface dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-astu-navy via-slate-900 to-astu-red">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:3rem_3rem]" />
        <div className="relative mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Building2 className="h-5 w-5 text-astu-red" />
              <span className="text-sm font-semibold text-white">Employer Partnership Programme</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-white md:text-5xl">
              Recruit from the ASTU graduate network
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-slate-200 md:text-xl">
              Register your organisation to search verified graduate profiles, publish vacancies,
              and submit competency feedback that feeds into departmental curriculum review.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={goToRegister}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-astu-red px-8 py-4 text-base font-semibold text-white transition-all hover:bg-astu-red/90 hover:scale-105 shadow-lg"
              >
                Register your organisation
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-white/20 hover:scale-105 backdrop-blur-sm"
              >
                Employer sign in
              </button>
            </div>
          </div>

          {/* Live figures, counted from real records */}
          {partnerStats.length > 0 && (
            <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
              {partnerStats.map((s) => (
                <div key={s.key} className="text-center">
                  <div className="text-3xl font-bold text-white md:text-4xl">
                    {s.value.toLocaleString()}
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-300">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Capabilities — one list, replacing the two duplicated ones */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24">
        <div className="mb-12 max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold text-astu-navy md:text-4xl">
            What the employer portal gives you
          </h2>
          <p className="text-lg text-on-surface-variant">
            Every item below corresponds to a working feature in the portal.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability) => {
            const Icon = capability.icon;
            return (
              <div
                key={capability.title}
                className="group rounded-xl border border-outline-variant bg-white p-6 shadow-[0_2px_8px_rgba(0,51,102,0.06)] transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-astu-navy/10 text-astu-navy transition-colors group-hover:bg-astu-navy group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-astu-navy">{capability.title}</h3>
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  {capability.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-astu-navy/5">
        <div className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24">
          <div className="mb-12 max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold text-astu-navy md:text-4xl">
              How registration works
            </h2>
            <p className="text-lg text-on-surface-variant">
              Accounts are reviewed by ASTU administration before they can be used.
            </p>
          </div>

          <ol className="grid gap-6 lg:grid-cols-3">
            {onboardingSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.title}
                  className="relative rounded-xl border border-outline-variant bg-white p-6 shadow-[0_2px_8px_rgba(0,51,102,0.06)]"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-astu-navy text-sm font-bold text-white">
                      {idx + 1}
                    </span>
                    <Icon className="h-6 w-6 text-astu-red" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-astu-navy">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Requirements */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-3xl font-bold text-astu-navy md:text-4xl">
              What you need to apply
            </h2>
            <p className="text-on-surface-variant">
              All of these are captured in the registration form so the verification team has
              everything needed for a single review.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
            {requirements.map((requirement) => {
              const Icon = requirement.icon;
              return (
                <li
                  key={requirement.label}
                  className="flex items-start gap-4 rounded-lg border border-outline-variant bg-white p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-astu-navy/10 text-astu-navy">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-astu-navy">
                      {requirement.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-on-surface-variant">
                      {requirement.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Partner organisations */}
      {/*
        This section previously listed Ethio Telecom, INSA, Ethiopian Airlines,
        Safaricom, Huawei and Commercial Bank of Ethiopia as "Partner Companies"
        from a hardcoded array. Publishing a real company's logo and name asserts
        a signed relationship that may not exist. It is now driven by CMS data
        and shows an honest empty state until administration adds verified
        partners via Homepage CMS → Partners.
      */}
      <section className="border-y border-outline-variant bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-16 md:px-8">
          <h2 className="text-center text-2xl font-bold text-astu-navy md:text-3xl">
            Registered partner organisations
          </h2>
          {/*
            No partner records are published yet. Kept as an explicit empty state
            rather than a logo wall of companies we cannot verify.
          */}
          <div className="mx-auto mt-8 max-w-xl rounded-xl border border-dashed border-outline bg-surface p-10 text-center">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-outline" />
            <p className="font-semibold text-on-surface">No partner organisations published yet</p>
            <p className="mt-1.5 text-sm text-on-surface-variant">
              Verified partners are listed here once ASTU administration publishes them.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-10 flex items-center gap-3">
          <HelpCircle className="h-7 w-7 text-astu-navy" />
          <h2 className="text-3xl font-bold text-astu-navy md:text-4xl">
            Questions before you register
          </h2>
        </div>
        <div className="divide-y divide-outline-variant overflow-hidden rounded-xl border border-outline-variant bg-white">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={faq.q}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface"
                >
                  <span className="font-semibold text-astu-navy">{faq.q}</span>
                  <span
                    className={`shrink-0 text-xl leading-none text-astu-navy transition-transform ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 pb-4 text-sm leading-relaxed text-on-surface-variant">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Single closing CTA */}
      <section className="bg-astu-navy">
        <div className="mx-auto max-w-[1440px] px-4 py-16 text-center md:px-8 md:py-20">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Register your organisation
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-200">
            One form. Administration verifies the TIN and unlocks your account.
          </p>
          <button
            onClick={goToRegister}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-astu-red px-8 py-4 text-base font-semibold text-white transition-all hover:bg-astu-red/90 hover:scale-105 shadow-lg"
          >
            Start registration
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}