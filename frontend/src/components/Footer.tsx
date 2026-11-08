import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Facebook,
  Linkedin,
  Send,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  ArrowUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSystemSettings } from "../context/SystemSettingsContext";

export interface FooterProps {
  variant?: "full" | "minimal";
  className?: string;
}

export default function Footer({ variant = "full", className = "" }: FooterProps) {
  const navigate = useNavigate();
  const { settings } = useSystemSettings();
  const [emailInput, setEmailInput] = useState("");

  const universityName = settings?.general?.universityName || "Adama Science and Technology University";
  const abbreviation = settings?.general?.abbreviation || "ASTU";
  const address = settings?.general?.address || "Adama, Oromia, Ethiopia";
  const postalCode = settings?.general?.postalCode || "P.O. Box 1888";
  const phoneNumber = settings?.general?.phoneNumber || "+251-221-110000";
  const contactEmail = settings?.general?.contactEmail || "irccd@astu.edu.et";

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    toast.success("Subscribed to official ASTU-AMS bulletins.");
    setEmailInput("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── MINIMAL VARIANT (for Auth pages and Logged-in Dashboards) ──
  if (variant === "minimal") {
    return (
      <footer
        className={`w-full border-t-2 border-[#C8102E] bg-[#002766] text-slate-300 text-xs ${className}`}
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-400 text-center sm:text-left">
            &copy; {new Date().getFullYear()} {universityName}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
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

  // ── FULL GLOBAL VARIANT (for all Public Pages) ──
  return (
    <footer
      className={`w-full border-t-2 border-[#C8102E] bg-gradient-to-b from-[#003580] via-[#002766] to-[#001c4a] text-slate-300 ${className}`}
    >
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* 1. Global Newsletter Signup Panel (Single source of truth) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-10 border-b border-white/10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200 border border-white/15 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] animate-pulse" />
              <span>STAY INFORMED</span>
            </div>
            <h4 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
              Subscribe to official ASTU updates
            </h4>
            <p className="mt-2 text-xs sm:text-sm text-blue-100/75 leading-relaxed">
              Receive announcements, events, partner calls, tracer survey reminders, and campus circulars directly in your inbox.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="w-full lg:w-auto max-w-md space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@example.com"
                className="w-full sm:w-72 h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E] transition-all"
              />
              <button
                type="submit"
                className="h-12 px-6 rounded-xl bg-[#C8102E] hover:bg-[#A60D26] text-white font-bold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Subscribe</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-blue-200/60 flex items-center gap-1.5 pt-0.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Official ASTU communications • Unsubscribe anytime</span>
            </p>
          </form>
        </div>

        {/* 2. Middle Information & Real Navigation Links */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5 items-start">
          {/* Brand & University Contact Details (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#003580] font-black text-lg shadow-md">
                {abbreviation[0]}
              </div>
              <div>
                <span className="font-serif text-xl font-bold text-white tracking-tight block">
                  {abbreviation}-AMS
                </span>
                <span className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold block">
                  Alumni Management System
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed max-w-sm">
              Connecting graduates, corporate employers, and academic departments into one unified ecosystem for career tracking and institutional excellence.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#C8102E] shrink-0 mt-0.5" />
                <span>{address} • {postalCode}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-blue-300 shrink-0" />
                <span>{phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-blue-300 shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                  {contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-blue-300 shrink-0" />
                <span>Mon – Fri: 8:00 AM – 5:00 PM (EAT)</span>
              </div>
            </div>
          </div>

          {/* Real Links Col 1: Portals */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-[0.16em] text-white border-b border-white/10 pb-2.5 mb-3.5">
              Portals & Services
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/info/alumni-portal" className="hover:text-white transition-colors block">
                  Alumni Portal
                </Link>
              </li>
              <li>
                <Link to="/info/employer-portal" className="hover:text-white transition-colors block">
                  Employer Portal
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

          {/* Real Links Col 2: Campus & Media */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-[0.16em] text-white border-b border-white/10 pb-2.5 mb-3.5">
              Campus & Stories
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/info/campus-life" className="hover:text-white transition-colors block">
                  Campus Life & Culture
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
                <Link to="/partners" className="hover:text-white transition-colors block">
                  Partner Companies
                </Link>
              </li>
            </ul>
          </div>

          {/* Real Links Col 3: Community & Legal */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-[0.16em] text-white border-b border-white/10 pb-2.5 mb-3.5">
              Community & Help
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link to="/events" className="hover:text-white transition-colors block">
                  Events & Workshops
                </Link>
              </li>
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
                  Support Desk
                </Link>
              </li>
              <li>
                <Link to="/contact-registrar" className="hover:text-white transition-colors block">
                  Contact Registrar
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Bottom Legal, Social & Back to Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-xs text-slate-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-center sm:text-left">
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
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com/adamaastu"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://t.me/Adama_STU_Almuni"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Telegram"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-xs"
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
