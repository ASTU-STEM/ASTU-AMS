import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  ExternalLink,
  Globe,
  Handshake,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CompanyDetailModal from "../components/CompanyDetailModal";
import { getPartnerLogoSrc } from "../components/PartnerLogos";
import { mediaUrl } from "../config";
import homepageCmsService, {
  Partner,
  PartnersPageConfig,
  defaultPartnersPageConfig,
} from "../features/admin/services/homepageCms.service";
import { usePublicMetrics } from "../services/publicMetrics.service";
import { partnerMonogram } from "../features/public/components/home/homeShared";

const TYPE_FILTERS = ["All", "Strategic", "Recruitment", "Research", "Internship", "Technology"] as const;

function PartnerLogo({
  partner,
  className = "h-14 w-14",
}: {
  partner: Partner;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const mapped = getPartnerLogoSrc(partner.name);
  const logo = mediaUrl(partner.logo) || partner.logo || mapped;

  if (!logo || failed) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-2xl bg-astu-navy/10 text-sm font-black text-astu-navy dark:bg-sky-500/15 dark:text-sky-300 ${className}`}
        aria-hidden="true"
      >
        {partnerMonogram(partner.name)}
      </span>
    );
  }

  return (
    <img
      src={logo}
      alt=""
      className={`${className} object-contain`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function PartnersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { metrics } = usePublicMetrics();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [pageConfig, setPageConfig] = useState<PartnersPageConfig>(defaultPartnersPageConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [typeFilter, setTypeFilter] = useState(searchParams.get("tab") === "employers" ? "Recruitment" : searchParams.get("type") || "All");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set("q", debouncedSearch);
    else next.delete("q");
    if (typeFilter && typeFilter !== "All") next.set("type", typeFilter);
    else next.delete("type");
    // Keep legacy ?tab=employers working, but prefer type.
    if (searchParams.get("tab") === "employers" && typeFilter === "Recruitment") {
      next.set("tab", "employers");
    } else {
      next.delete("tab");
    }
    setSearchParams(next, { replace: true });
  }, [debouncedSearch, typeFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPartnerData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const settings = await homepageCmsService.fetchSettings();
      if (settings?.partnersPage) setPageConfig(settings.partnersPage);
      const backendPartners = Array.isArray(settings?.partners) ? settings.partners : [];
      setPartners(backendPartners.filter((p: Partner) => p && p.active !== false));
    } catch {
      setLoadError("Unable to load live partner records. Please try again.");
      setPartners([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPartnerData();
    const onUpdate = () => void loadPartnerData();
    window.addEventListener("astu-cms-homepage-updated", onUpdate);
    return () => window.removeEventListener("astu-cms-homepage-updated", onUpdate);
  }, [loadPartnerData]);

  const filteredPartners = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return partners
      .filter((p) => {
        const typeOk =
          typeFilter === "All" ||
          String(p.partnershipType || "").toLowerCase() === typeFilter.toLowerCase() ||
          (typeFilter === "Recruitment" &&
            /recruit|employer|hiring/i.test(String(p.partnershipType || p.industry || "")));
        if (!typeOk) return false;
        if (!q) return true;
        const haystack = [p.name, p.industry, p.location, p.description, p.partnershipType, ...(p.tags || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.name.localeCompare(b.name));
  }, [partners, debouncedSearch, typeFilter]);

  const liveStats = [
    {
      label: "Verified Alumni",
      value: metrics?.registeredAlumni ? Number(metrics.registeredAlumni).toLocaleString() : "—",
      icon: Users,
    },
    {
      label: "Active Partners",
      value: partners.length ? partners.length.toLocaleString() : "—",
      icon: Building2,
    },
    {
      label: "Employment Rate",
      value:
        metrics?.employmentRate != null ? `${Number(metrics.employmentRate)}%` : "—",
      icon: ShieldCheck,
    },
  ];

  const faqs = (pageConfig.faqs || []).filter(Boolean).slice(0, 4);

  return (
    <div className="app-shell min-h-screen bg-[var(--bg-page)] text-slate-900 dark:text-slate-100">
      <Navbar />

      {/* Hero — brand-first, full-bleed */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(196,30,58,0.28),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(15,76,129,0.45),_transparent_50%)]" />
        <div className="relative mx-auto max-w-[1440px] px-4 py-16 md:px-8 md:py-20">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
            {pageConfig.heroBadge || "Employer & Industry Partnerships"}
          </p>
          <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight md:text-5xl">
            {pageConfig.heroTitle || "Partner with ASTU"}{" "}
            <span className="text-astu-green">
              {pageConfig.heroHighlight || "Top Engineering & Tech Graduates"}
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">
            {pageConfig.heroSubtitle ||
              "Connect with verified alumni talent, publish opportunities, and shape technical education through industry collaboration."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="home-btn home-btn--primary"
              onClick={() =>
                navigate(pageConfig.heroPrimaryCtaLink || "/employers/register")
              }
            >
              <Handshake className="home-btn__icon" aria-hidden="true" />
              {pageConfig.heroPrimaryCtaText || "Register as Employer"}
              <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="home-btn home-btn--outline-light"
              onClick={() => navigate(pageConfig.heroSecondaryCtaLink || "/login")}
            >
              {pageConfig.heroSecondaryCtaText || "Employer Portal Login"}
            </button>
          </div>

          <div className="mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {liveStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                >
                  <Icon className="mb-2 h-4 w-4 text-amber-300" aria-hidden="true" />
                  <p className="text-xl font-black tabular-nums">{stat.value}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/65">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Directory */}
      <section id="directory" className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-14">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-astu-red">
              Partner Directory
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">
              {pageConfig.partnersCarouselTitle || "Corporate & Institutional Partners"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              {pageConfig.partnersCarouselSubtitle ||
                "Live partners published by the Alumni Office and Corporate Relations team."}
            </p>
          </div>
          <button
            type="button"
            className="home-btn home-btn--soft home-btn--sm"
            onClick={() => void loadPartnerData()}
            aria-label="Refresh partners"
          >
            <RefreshCw className="home-btn__icon" aria-hidden="true" />
            Refresh
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, industry, or location…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none ring-astu-navy/30 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
              aria-label="Search partners"
            />
            {search ? (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  typeFilter === type
                    ? "bg-astu-navy text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {loadError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-8 text-center dark:border-rose-900/50 dark:bg-rose-950/30">
            <p className="text-sm text-rose-700 dark:text-rose-300">{loadError}</p>
            <button
              type="button"
              className="home-btn home-btn--navy home-btn--sm mt-4"
              onClick={() => void loadPartnerData()}
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : !filteredPartners.length ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
            <Building2 className="mx-auto mb-3 h-8 w-8 text-slate-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {partners.length
                ? "No partners match your current filters."
                : "No published partners yet. Organizations approved by Alumni Office will appear here."}
            </p>
            <button
              type="button"
              className="home-btn home-btn--primary home-btn--sm mt-5"
              onClick={() => navigate("/employers/register")}
            >
              Register your organization
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPartners.map((partner) => (
              <article
                key={partner.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-astu-navy/30 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/50"
              >
                <div className="mb-4 flex items-start gap-3">
                  <PartnerLogo partner={partner} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-bold text-slate-900 dark:text-white">
                        {partner.name}
                      </h3>
                      {partner.featured ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {[partner.partnershipType, partner.industry].filter(Boolean).join(" · ") ||
                        "Industry Partner"}
                    </p>
                  </div>
                </div>

                {partner.description ? (
                  <p className="mb-4 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                    {partner.description}
                  </p>
                ) : (
                  <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                    Collaborating with ASTU on talent, research, and campus engagement.
                  </p>
                )}

                <div className="mt-auto space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  {partner.location ? (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {partner.location}
                    </p>
                  ) : null}
                  {partner.openings ? (
                    <p className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      {partner.openings} openings
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="home-btn home-btn--navy home-btn--sm"
                    onClick={() => setSelectedPartner(partner)}
                  >
                    View details
                  </button>
                  {partner.website ? (
                    <a
                      href={partner.website.startsWith("http") ? partner.website : `https://${partner.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="home-btn home-btn--soft home-btn--sm"
                    >
                      Website
                      <ExternalLink className="home-btn__icon" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Why partner — concise CMS benefits */}
      {(pageConfig.benefits || []).filter((b) => b.active !== false).length > 0 ? (
        <section className="border-y border-slate-200 bg-white/70 py-12 dark:border-slate-800 dark:bg-slate-950/40 md:py-14">
          <div className="mx-auto max-w-[1440px] px-4 md:px-8">
            <div className="mb-8 max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-astu-red">
                {pageConfig.benefitsEyebrow || "Mutual Value"}
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">
                {pageConfig.benefitsTitle || "Why Partner with ASTU?"}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {pageConfig.benefitsSubtitle}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(pageConfig.benefits || [])
                .filter((b) => b.active !== false)
                .slice(0, 6)
                .map((benefit) => (
                  <div
                    key={benefit.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/50"
                  >
                    <h3 className="font-bold text-slate-900 dark:text-white">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {benefit.description}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {faqs.length ? (
        <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-14">
          <h2 className="mb-6 text-2xl font-black tracking-tight">Partnership FAQs</h2>
          <div className="mx-auto max-w-3xl space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50"
              >
                <summary className="cursor-pointer list-none font-semibold text-slate-900 dark:text-white">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* Bottom CTA + contact */}
      <section className="mx-auto max-w-[1440px] px-4 pb-16 md:px-8 md:pb-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-astu-navy via-[#163a66] to-slate-900 px-6 py-10 text-white md:px-10">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <h2 className="text-2xl font-black tracking-tight md:text-3xl">
                {pageConfig.bottomCtaTitle || "Build your talent pipeline with ASTU"}
              </h2>
              <p className="mt-3 max-w-xl text-sm text-white/85 md:text-base">
                {pageConfig.bottomCtaDescription ||
                  "Register your organization to access verified graduates and campus recruitment support."}
              </p>
              <button
                type="button"
                className="home-btn home-btn--primary mt-6"
                onClick={() =>
                  navigate(pageConfig.bottomCtaButtonLink || "/employers/register")
                }
              >
                {pageConfig.bottomCtaButtonText || "Register Your Organization"}
                <ArrowRight className="home-btn__icon home-btn__icon--arrow" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm">
              {pageConfig.contactEmail ? (
                <a
                  href={`mailto:${pageConfig.contactEmail}`}
                  className="flex items-center gap-2 text-white/90 hover:text-white"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  {pageConfig.contactEmail}
                </a>
              ) : null}
              {pageConfig.contactPhone ? (
                <a
                  href={`tel:${pageConfig.contactPhone}`}
                  className="flex items-center gap-2 text-white/90 hover:text-white"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {pageConfig.contactPhone}
                </a>
              ) : null}
              {pageConfig.contactAddress ? (
                <p className="flex items-start gap-2 text-white/80">
                  <Globe className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {pageConfig.contactAddress}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {selectedPartner ? (
        <CompanyDetailModal
          company={selectedPartner as any}
          onClose={() => setSelectedPartner(null)}
        />
      ) : null}
    </div>
  );
}
