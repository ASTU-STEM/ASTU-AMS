import React from "react";
import { Facebook, Linkedin, Send, Mail, Phone, MapPin, Globe } from "lucide-react";
import { useSystemSettings } from "../context/SystemSettingsContext";

const footerSections = [
  {
    title: "Portal Services",
    links: [
      { label: "Alumni", href: "/info/alumni-portal" },
      { label: "Employer Portal", href: "/partners?tab=recruitment" },
      { label: "Registrar", href: "/info/registrar-portal" },
      { label: "Department", href: "/info/department-portal" },
    ],
  },
  {
    title: "About ASTU",
    links: [
      { label: "About ASTU & AMS", href: "/about" },
      { label: "How It Works", id: "how-it-works", scroll: true },
      { label: "Impact & Accreditation", id: "impact", scroll: true },
      { label: "Research Highlights", id: "research", scroll: true },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Events", id: "events", scroll: true },
      { label: "Workshops", id: "workshops", scroll: true },
      { label: "Career Opportunities", id: "career-opportunities", scroll: true },
      { label: "FAQ", id: "faq", scroll: true },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Contact Us", id: "contact", scroll: true },
      { label: "Photo Gallery", id: "gallery", scroll: true },
      { label: "Community Voices", id: "testimonials", scroll: true },
      { label: "Join Alumni", href: "/register" },
    ],
  },
];

export default function Footer() {
  const { settings } = useSystemSettings();
  const { universityName, abbreviation, address, postalCode, phoneNumber, contactEmail, website } = settings.general;

  const handleNavClick = (item: { href?: string; id?: string; scroll?: boolean }) => {
    if (item.href) {
      window.location.href = item.href;
      return;
    }
    if (item.id && item.scroll) {
      const element = document.getElementById(item.id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <footer className="border-t border-outline-variant bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h4 className="text-lg font-bold text-white">{abbreviation}-AMS</h4>
            <p className="mt-2 text-sm text-slate-400">
              {universityName} Alumni Management System - Connecting excellence to industry.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-astu-green" />
                <span>{universityName}, {address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-astu-green" />
                <span>{postalCode}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-astu-green" />
                <span>{phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-astu-green" />
                <span>{contactEmail}</span>
              </div>
            </div>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h5 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">{section.title}</h5>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleNavClick(link)}
                      className="text-left text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-700 py-6 md:flex-row">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} {universityName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://web.facebook.com/adamaastu/" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition-colors hover:text-white" title="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://t.me/Adama_STU_Alumni" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition-colors hover:text-white" title="Telegram">
              <Send className="h-5 w-5" />
            </a>
            <a href="https://www.linkedin.com/school/adama-science-and-technology-university/" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition-colors hover:text-white" title="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="border-t border-slate-800 py-3 text-center text-[11px] text-slate-500">
          Designed by <a href={website} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">{abbreviation}-AMS</a>
        </div>
      </div>
    </footer>
  );
}