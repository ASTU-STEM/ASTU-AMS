import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Building2,
  ArrowUp,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  FaFacebook,
  FaTelegram,
  FaLinkedin,
  FaYoutube,
  FaTwitter,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { useSystemSettings } from "../context/SystemSettingsContext";
import { resolveLogoUrl, DEFAULT_LOGO_PATH } from "../config";
import footerCmsService, {
  FooterCmsConfig,
} from "../features/admin/services/footerCms.service";

type FooterLink = { label: string; href?: string; id?: string; scroll?: boolean };

const defaultSections: { title: string; links: FooterLink[] }[] = [
  {
    title: "Portal Services",
    links: [
      { label: "Alumni Portal", href: "/info/alumni-portal" },
      { label: "Employer Portal", href: "/info/employer-portal" },
      { label: "Registrar Services", href: "/info/registrar-portal" },
      { label: "Department Portal", href: "/info/department-portal" },
    ],
  },
  {
    title: "About ASTU",
    links: [
      { label: "University Overview", href: "/info/overview" },
      { label: "Partners & Collaborators", href: "/partners" },
      { label: "Impact & Metrics", id: "impact-numbers", scroll: true },
      { label: "Research & Innovation", href: "/info/research" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Events & Workshops", href: "/events" },
      { label: "News & Bulletins", href: "/announcements" },
      { label: "Alumni Giving", href: "/donations" },
      { label: "Career Opportunities", href: "/info/employer-portal" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Contact Office", id: "contact", scroll: true },
      { label: "Photo Gallery", href: "/gallery" },
      { label: "Community Voices", href: "/community" },
      { label: "Join Network / Register", href: "/register" },
    ],
  },
];

function telHref(phone?: string) {
  if (!phone) return undefined;
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : undefined;
}

export default function Footer() {
  const { settings } = useSystemSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [cmsConfig, setCmsConfig] = useState<FooterCmsConfig>(() =>
    footerCmsService.getSettings()
  );
  const [emailInput, setEmailInput] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const sync = () => setCmsConfig(footerCmsService.getSettings());
    window.addEventListener("astu-cms-footer-updated", sync);
    footerCmsService
      .fetchFromApi()
      .then((cfg) => {
        if (cfg) setCmsConfig(cfg);
      })
      .catch(() => undefined);
    return () => window.removeEventListener("astu-cms-footer-updated", sync);
  }, []);

  const {
    universityName = "Adama Science and Technology University",
    abbreviation = "ASTU",
    address = "Adama, Ethiopia",
    postalCode = "P.O. Box 1888, Adama, Ethiopia",
    phoneNumber = "+251 22 110 0001",
    contactEmail = "irccd@astu.edu.et",
    website = "https://astu.edu.et",
  } = settings.general || {};

  const phoneLink = telHref(cmsConfig.contactInfo?.phone || phoneNumber);

  const handleSectionClick = (id: string) => {
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate(`/?scrollTo=${encodeURIComponent(id)}`);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setEmailInput("");
      toast.success("Thank you for subscribing to the ASTU Alumni Bulletin!");
    }, 800);
  };

  const renderedSections =
    cmsConfig.sections && cmsConfig.sections.length > 0
      ? cmsConfig.sections.map((s) => ({
          title: s.title,
          links: s.links.map((l) => ({
            label: l.label,
            href: l.href.startsWith("#") ? undefined : l.href,
            id: l.href.startsWith("#") ? l.href.replace("#", "") : undefined,
            scroll: l.href.startsWith("#"),
          })),
        }))
      : defaultSections;

  const socialLinks = [
    {
      href: "https://t.me/Adama_STU_Alumni",
      label: "ASTU Alumni on Telegram",
      title: "Official ASTU Alumni Telegram Channel",
      icon: FaTelegram,
      hover: "hover:bg-[#229ED9] hover:border-[#229ED9]",
    },
    {
      href: "https://www.linkedin.com/school/adama-science-and-technology-university/",
      label: "ASTU on LinkedIn",
      title: "ASTU LinkedIn Network",
      icon: FaLinkedin,
      hover: "hover:bg-[#0A66C2] hover:border-[#0A66C2]",
    },
    {
      href: "https://web.facebook.com/adamaastu/",
      label: "ASTU on Facebook",
      title: "Official Facebook Page",
      icon: FaFacebook,
      hover: "hover:bg-[#1877F2] hover:border-[#1877F2]",
    },
    {
      href: "https://www.youtube.com/@adamascienceandtechnologyu3403",
      label: "ASTU on YouTube",
      title: "Official YouTube Channel",
      icon: FaYoutube,
      hover: "hover:bg-[#FF0000] hover:border-[#FF0000]",
    },
    {
      href: "https://twitter.com/astu_edu_et",
      label: "ASTU on X (Twitter)",
      title: "ASTU on X (Twitter)",
      icon: FaTwitter,
      hover: "hover:bg-black hover:border-slate-700",
    },
  ];

  return (
    <footer
      id="contact"
      className="scroll-mt-20 relative w-full bg-slate-950 text-slate-300 font-sans border-t border-slate-800"
    >
      <div className="h-1 w-full bg-gradient-to-r from-astu-green via-astu-navy to-astu-red" />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 md:px-8">
        {/* Newsletter */}
        <div className="border-b border-slate-800/80 py-10">
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="max-w-xl text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-astu-navy/60 text-sky-400 border border-sky-500/30 mb-2">
                <Mail className="h-3 w-3" aria-hidden="true" />
                Alumni Bulletin &amp; Dispatch
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {cmsConfig.newsletterTitle || "Stay Connected with ASTU"}
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                {cmsConfig.newsletterSubtitle ||
                  "Get updates on reunions, career expos, and graduate employment reports."}
              </p>
            </div>

            <form
              onSubmit={handleNewsletterSubmit}
              className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-2.5"
            >
              <div className="relative w-full sm:w-80">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  aria-label="Email address for alumni bulletin"
                  className="w-full rounded-xl bg-slate-950/90 border border-slate-700/80 pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={isSubscribing}
                className="w-full sm:w-auto min-h-11 px-6 py-3 rounded-xl bg-gradient-to-r from-astu-navy via-[#003875] to-blue-700 hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all shrink-0 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                {isSubscribing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src={resolveLogoUrl(settings.appearance?.logoUrl)}
                alt={`${abbreviation} Logo`}
                className="h-12 w-12 object-contain rounded-2xl bg-white/5 p-1 ring-1 ring-white/10 shadow-md group-hover:scale-105 transition-transform"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = "1";
                    img.src = DEFAULT_LOGO_PATH;
                  }
                }}
              />
              <div>
                <h4 className="text-lg font-black text-white leading-tight">{abbreviation}-AMS</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Center of Excellence
                </p>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-sm">
              {universityName} Alumni Management System — connecting graduates, industry
              employers, research laboratories, and global partners.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300 pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                <span>
                  {cmsConfig.contactInfo?.address || `${universityName}, ${address}`}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                <span>
                  {cmsConfig.contactInfo?.poBox ||
                    (postalCode.includes("P.O.")
                      ? postalCode
                      : `P.O. Box ${postalCode}, Adama, Ethiopia`)}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                {phoneLink ? (
                  <a
                    href={phoneLink}
                    className="font-medium hover:text-white transition-colors underline-offset-2 hover:underline"
                  >
                    {cmsConfig.contactInfo?.phone || phoneNumber}
                  </a>
                ) : (
                  <span>{cmsConfig.contactInfo?.phone || phoneNumber}</span>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                <a
                  href={`mailto:${cmsConfig.contactInfo?.email || contactEmail}`}
                  className="font-medium hover:text-white transition-colors underline-offset-2 hover:underline"
                >
                  {cmsConfig.contactInfo?.email || contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-white transition-colors flex items-center gap-1 group/site underline-offset-2 hover:underline"
                >
                  <span>{website.replace(/^https?:\/\//, "")}</span>
                  <ExternalLink
                    className="h-3 w-3 opacity-60 group-hover/site:opacity-100"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[11px] font-black text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span>Network Operational</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-bold text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                Verified Institutional Portal
              </div>
            </div>
          </div>

          {renderedSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-white border-l-2 border-emerald-400 pl-2">
                {section.title}
              </h5>
              <ul className="space-y-2 text-xs">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        to={link.href}
                        className="text-slate-400 hover:text-white hover:translate-x-0.5 transition-all inline-block font-medium focus-visible:outline-none focus-visible:text-white"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => link.id && handleSectionClick(link.id)}
                        className="text-left text-slate-400 hover:text-white hover:translate-x-0.5 transition-all font-medium cursor-pointer focus-visible:outline-none focus-visible:text-white"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social + legal */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 py-6 md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-slate-400 md:justify-start">
            <span>
              {cmsConfig.copyright ||
                `© ${new Date().getFullYear()} ${universityName}. All rights reserved.`}
            </span>
            <span className="hidden sm:inline text-slate-600" aria-hidden="true">
              •
            </span>
            <Link to="/info/overview" className="hover:text-white transition-colors">
              Accreditation
            </Link>
            <span className="hidden sm:inline text-slate-600" aria-hidden="true">
              •
            </span>
            <Link to="/donations" className="hover:text-white transition-colors">
              Giving &amp; Transparency
            </Link>
            <span className="hidden sm:inline text-slate-600" aria-hidden="true">
              •
            </span>
            <Link to="/support" className="hover:text-white transition-colors">
              Support
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white ${social.hover} transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400`}
                  aria-label={social.label}
                  title={social.title}
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Sub-footer */}
        <div className="border-t border-slate-800/80 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="text-center sm:text-left">
            {cmsConfig.credit || "Designed by "}{" "}
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white font-bold transition-colors"
            >
              {abbreviation}-AMS
            </a>{" "}
            &bull; Center of Excellence in Science &amp; Technology
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            title="Scroll to top of page"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
