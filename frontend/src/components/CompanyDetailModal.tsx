import React, { useEffect, useState } from 'react';
import {
  X,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  ShieldCheck,
  Star,
  Calendar,
  Tag,
  Copy,
  Check,
  ArrowRight,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Partner } from '../features/admin/services/homepageCms.service';
import { partnerLogos } from './PartnerLogos';
import { mediaUrl } from '../config';

interface CompanyDetailModalProps {
  company: Partner | null;
  onClose: () => void;
  onRegisterInterest?: (company: Partner) => void;
  onSelectTag?: (tag: string) => void;
  onShare?: (company: Partner) => void;
}

export default function CompanyDetailModal({
  company,
  onClose,
  onRegisterInterest,
  onSelectTag,
  onShare,
}: CompanyDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!company) return null;

  const LogoComponent = partnerLogos[company.name];

  const handleCopyLink = () => {
    const url = `${window.location.origin}/partners?partner=${encodeURIComponent(company.id || company.name)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        toast.success(`Copied direct link for ${company.name}!`);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      toast.success(url);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedContact(label);
        toast.success(`Copied ${label}: ${text}`);
        setTimeout(() => setCopiedContact(null), 2000);
      });
    } else {
      toast.success(text);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white text-slate-900 shadow-2xl transition-all dark:bg-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-[#001f3f] via-[#002b5c] to-[#001830] px-6 py-6 sm:py-7 text-white border-b border-blue-900/40">
          {/* Action icons */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            {onShare && (
              <button
                type="button"
                onClick={() => onShare(company)}
                className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
                title={`Share ${company.name}`}
              >
                <Share2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleCopyLink}
              className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
              title="Copy direct link"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-start gap-4 pr-24">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-md">
              {LogoComponent ? (
                <LogoComponent className="h-full w-full object-contain" />
              ) : company.logo ? (
                <img
                  src={mediaUrl(company.logo)}
                  alt={`${company.name} logo`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-tr from-[#001f3f] to-blue-700 text-white font-bold text-lg">
                  {company.name?.slice(0, 2).toUpperCase() || 'PT'}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                {/* Active Partner Pulse */}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                  </span>
                  <span>Active MoU</span>
                </span>

                {company.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                    <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                    <span>Featured</span>
                  </span>
                )}

                {company.partnershipType && (
                  <span className="rounded-full bg-blue-400/20 px-2 py-0.5 text-[10px] font-bold text-blue-200 border border-blue-400/30">
                    {company.partnershipType} Track
                  </span>
                )}
              </div>

              <h2 id="partner-modal-title" className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                {company.name}
              </h2>

              {company.location && (
                <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-amber-300 shrink-0" />
                  <span>{company.location}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sector</span>
              <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {company.industry || 'Technology & Engineering'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opportunities</span>
              <p className="mt-0.5 text-xs font-bold text-blue-600 dark:text-sky-400 truncate">
                {company.openings || 'Collaborative Tracks'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/60 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MoU Status</span>
              <p className="mt-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>{company.status || (company.mouYear ? `Est. ${company.mouYear}` : 'Active Agreement')}</span>
              </p>
            </div>
          </div>

          {/* About Partnership */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              About Partnership
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {company.description ||
                `${company.name} collaborates with Adama Science and Technology University through accredited graduate hiring pipelines, curriculum competency advisory, internship opportunities, and practical engineering projects.`}
            </p>
          </div>

          {/* Technology Focus & Interactive Tags */}
          {Array.isArray(company.tags) && company.tags.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-blue-500" />
                  <span>Collaboration Focus Areas</span>
                </h3>
                {onSelectTag && (
                  <span className="text-[10px] text-slate-400">Click a topic to filter directory</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {company.tags.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (onSelectTag) {
                        onSelectTag(tag);
                        onClose();
                      } else {
                        handleCopyText(tag, 'Topic');
                      }
                    }}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:border-blue-400 transition-all cursor-pointer"
                    title={onSelectTag ? `Filter partners by ${tag}` : `Copy topic ${tag}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MoU Year Highlight if available */}
          {company.mouYear && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
              <span>
                Formal institutional agreement established with ASTU in <strong>{company.mouYear}</strong>.
              </span>
            </div>
          )}

          {/* Contact and Links */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {company.contactEmail && (
                <div className="inline-flex items-center gap-1.5">
                  <a
                    href={`mailto:${company.contactEmail}`}
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{company.contactEmail}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyText(company.contactEmail!, 'Email')}
                    className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                    title="Copy email"
                  >
                    {copiedContact === 'Email' ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}

              {company.contactPhone && (
                <div className="inline-flex items-center gap-1.5">
                  <a
                    href={`tel:${company.contactPhone}`}
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{company.contactPhone}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyText(company.contactPhone!, 'Phone')}
                    className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                    title="Copy phone number"
                  >
                    {copiedContact === 'Phone' ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:underline dark:text-sky-400 ml-auto"
              >
                <span>Official Website</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              if (onRegisterInterest) {
                onRegisterInterest(company);
              } else {
                window.location.href = `/employers/register?partner=${encodeURIComponent(company.name)}`;
              }
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
          >
            <span>Partner with ASTU</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
