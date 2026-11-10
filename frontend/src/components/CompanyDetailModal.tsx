import React, { useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  Briefcase,
  Globe,
  Mail,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Award,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Partner } from '../features/admin/services/homepageCms.service';
import { partnerLogos } from './PartnerLogos';

interface CompanyDetailModalProps {
  company: Partner | null;
  onClose: () => void;
  onRegisterInterest?: (company: Partner) => void;
  partners?: Partner[];
  onSelectCompany?: (company: Partner) => void;
}

export default function CompanyDetailModal({
  company,
  onClose,
  onRegisterInterest,
  partners,
  onSelectCompany,
}: CompanyDetailModalProps) {
  const currentIndex = partners && company ? partners.findIndex((p) => p.name === company.name) : -1;
  const prevCompany = currentIndex > 0 && partners ? partners[currentIndex - 1] : null;
  const nextCompany =
    currentIndex >= 0 && partners && currentIndex < partners.length - 1 ? partners[currentIndex + 1] : null;

  useEffect(() => {
    if (!company) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevCompany && onSelectCompany) {
        e.preventDefault();
        onSelectCompany(prevCompany);
      } else if (e.key === 'ArrowRight' && nextCompany && onSelectCompany) {
        e.preventDefault();
        onSelectCompany(nextCompany);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [company, prevCompany, nextCompany, onSelectCompany, onClose]);

  if (!company) return null;

  const LogoComponent = partnerLogos[company.name];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl transition-all dark:bg-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-[#001f3f] to-[#003366] px-6 py-8 text-white">
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            {partners && partners.length > 1 && onSelectCompany && (
              <div className="flex items-center gap-1 mr-1">
                <button
                  type="button"
                  onClick={() => prevCompany && onSelectCompany(prevCompany)}
                  disabled={!prevCompany}
                  className={`rounded-full p-1.5 text-white/80 transition-all cursor-pointer ${
                    !prevCompany ? 'opacity-30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 hover:text-white'
                  }`}
                  title="Previous organization (←)"
                  aria-label="Previous organization"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => nextCompany && onSelectCompany(nextCompany)}
                  disabled={!nextCompany}
                  className={`rounded-full p-1.5 text-white/80 transition-all cursor-pointer ${
                    !nextCompany ? 'opacity-30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 hover:text-white'
                  }`}
                  title="Next organization (→)"
                  aria-label="Next organization"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-md">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="h-full w-full object-contain" />
              ) : LogoComponent ? (
                <LogoComponent className="h-10 w-10" />
              ) : (
                <Building2 className="h-8 w-8 text-[#003366]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Employer Partner
                </span>
                {company.partnershipType && (
                  <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                    {company.partnershipType} Track
                  </span>
                )}
                {currentIndex >= 0 && partners && (
                  <span className="text-[10px] font-semibold text-slate-300">
                    ({currentIndex + 1} of {partners.length})
                  </span>
                )}
              </div>
              <h2 className="mt-1 text-xl font-black tracking-tight">{company.name}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-amber-300 shrink-0" />
                <span>{company.location || 'Ethiopia & Regional Hubs'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Key Attributes */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sector</span>
              <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {company.industry || 'Technology & Engineering'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Open Tracks</span>
              <p className="mt-0.5 text-xs font-bold text-[#003366] dark:text-sky-400 truncate">
                {company.openings || 'Active Trainee Roles'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/60 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Accreditation</span>
              <p className="mt-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Tracer Verified</span>
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
              About Institutional Partnership
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {company.description ||
                `${company.name} collaborates with Adama Science and Technology University through verified hiring pipelines, curriculum competency advisory, internship opportunities, and practical engineering projects.`}
            </p>
          </div>

          {/* Opportunities & Recruitment Programs */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-slate-800 dark:bg-sky-950/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#003366] dark:text-sky-300">
              <Briefcase className="h-4 w-4 text-[#003366] dark:text-sky-400" />
              <span>Available Placement Channels</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 pl-5 list-disc">
              <li>Direct Graduate Trainee recruitment for ASTU engineering & science graduates</li>
              <li>Semester-break and final-year accredited industrial internships</li>
              <li>Campus Career Expo interview screening and fast-track hiring</li>
            </ul>
          </div>

          {/* Contact and Links */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {company.contactEmail && (
              <a
                href={`mailto:${company.contactEmail}`}
                className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#003366] dark:text-slate-300"
              >
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{company.contactEmail}</span>
              </a>
            )}

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-[#003366] hover:underline dark:text-sky-400"
              >
                <span>Visit Company Portal</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            >
              Close
            </button>

            {partners && partners.length > 1 && onSelectCompany && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => prevCompany && onSelectCompany(prevCompany)}
                  disabled={!prevCompany}
                  className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    !prevCompany
                      ? 'opacity-30 cursor-not-allowed text-slate-400'
                      : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                  }`}
                  title="Previous organization"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => nextCompany && onSelectCompany(nextCompany)}
                  disabled={!nextCompany}
                  className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold transition-all ${
                    !nextCompany
                      ? 'opacity-30 cursor-not-allowed text-slate-400'
                      : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
                  }`}
                  title="Next organization"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <a
            href="/employers/register"
            className="inline-flex items-center gap-2 rounded-xl bg-[#003366] hover:bg-[#002244] px-5 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
          >
            <span>Apply as Candidate / Employer</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
