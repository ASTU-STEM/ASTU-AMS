import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Linkedin,
  Send,
  Mail,
  Phone,
  MapPin,
  Clock,
  ArrowUp,
} from "lucide-react";
import { useSystemSettings } from "../context/SystemSettingsContext";

export interface FooterProps {
  variant?: "full" | "minimal";
  className?: string;
}

export default function Footer({ variant = "full", className = "" }: FooterProps) {
  const { settings } = useSystemSettings();

  const universityName = settings?.general?.universityName || "Adama Science and Technology University";
  const abbreviation = settings?.general?.abbreviation || "ASTU";
  const address = settings?.general?.address || "Adama, Oromia, Ethiopia";
  const postalCode = settings?.general?.postalCode || "P.O. Box 1888";
  const phoneNumber = settings?.general?.phoneNumber || "+251-221-110000";
  const contactEmail = settings?.general?.contactEmail || "irccd@astu.edu.et";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── MINIMAL VARIANT (for Auth pages and Logged-in Dashboards) ──
  if (variant === "minimal") {
    return (
      <footer
        className={`w-full border-t border-[#C8102E]/70 bg-[#002147] text-slate-300 text-xs ${className}`}
      >
        <div className="mx-auto max-w-[1140px] px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src={settings?.appearance?.logoUrl || "/images/astu-seal-logo.png"}
              alt={`${abbreviation} Logo`}
              className="h-6 w-6 object-contain shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/astu-seal-logo.png";
              }}
            />
            <p className="text-slate-400 text-center sm:text-left text-[11px]">
              &copy; {new Date().getFullYear()} {universityName}. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3.5 text-slate-300 text-[11px]">
            <Link to="/info/overview" className="hover:text-white transition-colors">
              About {abbreviation}-AMS
            </Link>
            <span className="text-slate-600">•</span>
            <Link to="/info/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-600">•</span>
            <Link to="/info/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span className="text-slate-600">•</span>
            <Link to="/support" className="hover:text-white transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    );
  }

  // ── FULL GLOBAL VARIANT (Clean, narrow & professional for all Public Pages) ──
  return (
    <footer
      className={`w-full border-t-2 border-[#C8102E] bg-gradient-to-b from-[#002554] via-[#001e45] to-[#001533] text-slate-300 ${className}`}
    >
      <div className="mx-auto max-w-[1140px] px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Main Grid: University Brand on Left + 3 Structured Link Columns */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 items-start">
          {/* Brand & University Contact Details (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3.5 pr-0 lg:pr-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src={settings?.appearance?.logoUrl || "/images/astu-seal-logo.png"}
                alt={`${abbreviation} Logo`}
                className="h-11 w-11 sm:h-12 sm:w-12 object-contain shrink-0 group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/astu-seal-logo.png";
                }}
              />
              <div>
                <span className="font-serif text-lg font-bold text-white tracking-tight block group-hover:text-blue-100 transition-colors">
                  {abbreviation}-AMS
                </span>
                <span className="text-[10px] text-blue-200/90 uppercase tracking-widest font-semibold block">
                  Alumni Management System
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-300/85 leading-relaxed max-w-sm">
              Adama Science and Technology University&apos;s institutional platform connecting graduates, corporate industry partners, and academic departments into one collaborative network.
            </p>

            <div className="pt-1 space-y-2 text-xs text-slate-300/90">
              <a
                href="https://maps.google.com/?q=Adama+Science+and+Technology+University"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-start gap-2.5"
                title="View ASTU Campus on Google Maps"
              >
                <MapPin className="h-4 w-4 text-[#C8102E] shrink-0 mt-0.5" />
                <span>{address} • {postalCode}</span>
              </a>

              <a
                href={`tel:${phoneNumber.replace(/[^+\d]/g, "")}`}
                className="hover:text-white transition-colors flex items-center gap-2.5"
                title="Call ASTU Office"
              >
                <Phone className="h-4 w-4 text-blue-300 shrink-0" />
                <span>{phoneNumber}</span>
              </a>

              <a
                href={`mailto:${contactEmail}`}
                className="hover:text-white transition-colors flex items-center gap-2.5"
                title="Send Email to ASTU Directorate"
              >
                <Mail className="h-4 w-4 text-blue-300 shrink-0" />
                <span>{contactEmail}</span>
              </a>

              <div className="flex items-center gap-2.5 text-slate-300/80">
                <Clock className="h-4 w-4 text-blue-300 shrink-0" />
                <span>Mon – Fri: 8:00 AM – 5:00 PM (EAT)</span>
              </div>
            </div>
          </div>

          {/* Col 1: Portals & Services */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-[0.14em] text-white border-b border-white/10 pb-2 mb-3">
              Portals & Services
            </h5>
            <ul className="space-y-2 text-xs text-slate-300/90">
              <li>
                <Link to="/info/alumni-portal" className="hover:text-white transition-colors block">
                  Alumni Portal
                </Link>
              </li>
              <li>
                <Link to="/partners" className="hover:text-white transition-colors block">
                  Employer & Partner Hub
                </Link>
              </li>
              <li>
                <Link to="/info/registrar-portal" className="hover:text-white transition-colors block">
                  Registrar Portal
                </Link>
              </li>
              <li>
                <Link to="/info/department-portal" className="hover:text-white transition-colors block">
                  Department Portal
                </Link>
              </li>
              <li>
                <Link to="/info/impact-numbers" className="hover:text-white transition-colors block">
                  Impact & Tracer Data
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Campus & Stories */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-[0.14em] text-white border-b border-white/10 pb-2 mb-3">
              Campus & Stories
            </h5>
            <ul className="space-y-2 text-xs text-slate-300/90">
              <li>
                <Link to="/info/campus-life" className="hover:text-white transition-colors block">
                  Campus Life
                </Link>
              </li>
              <li>
                <Link to="/info/facilities" className="hover:text-white transition-colors block">
                  Facilities & Labs
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-white transition-colors block">
                  Campus Photography
                </Link>
              </li>
              <li>
                <Link to="/info/alumni-stories" className="hover:text-white transition-colors block">
                  Alumni Success Stories
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors block">
                  Events & Workshops
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Support */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-[0.14em] text-white border-b border-white/10 pb-2 mb-3">
              Community & Support
            </h5>
            <ul className="space-y-2 text-xs text-slate-300/90">
              <li>
                <Link to="/announcements" className="hover:text-white transition-colors block">
                  Official Announcements
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-white transition-colors block">
                  Alumni Network
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white transition-colors block">
                  Help & Support Desk
                </Link>
              </li>
              <li>
                <Link to="/contact-registrar" className="hover:text-white transition-colors block">
                  Contact Registrar
                </Link>
              </li>
              <li>
                <Link to="/info/overview" className="hover:text-white transition-colors block">
                  About {abbreviation}-AMS
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal, Social Media & Back to Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 text-xs text-slate-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 text-center sm:text-left text-[11px]">
            <p>&copy; {new Date().getFullYear()} {universityName}. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-600">•</span>
            <Link to="/info/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="hidden sm:inline text-slate-600">•</span>
            <Link to="/info/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <a
                href="https://facebook.com/adamaastu"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Follow ASTU on Facebook"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://t.me/Adama_STU_Almuni"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Join ASTU Telegram Channel"
                aria-label="Telegram"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/school/adama-science-and-technology-university/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Connect on LinkedIn"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-xs"
              title="Back to Top"
            >
              <span>Top</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
