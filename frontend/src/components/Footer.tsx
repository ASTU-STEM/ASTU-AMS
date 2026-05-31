import React from "react";
import { Facebook, Twitter, Youtube, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";

const footerSections = [
  {
    title: "Portal Services",
    links: [
      { label: "Alumni", href: "/alumni/dashboard" },
      { label: "Employer", href: "/employer/dashboard" },
      { label: "Registrar", href: "/registrar/dashboard" },
      { label: "Department", href: "/department/dashboard" },
    ],
  },
  {
    title: "About ASTU",
    links: [
      { label: "University Overview", href: "/" },
      { label: "Stakeholder Portals", id: "stakeholders", scroll: true },
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
      { label: "Community Feed", id: "community", scroll: true },
    ],
  },
];

export default function Footer() {
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
            <h4 className="text-lg font-bold text-white">ASTU-AMS</h4>
            <p className="mt-2 text-sm text-slate-400">
              Adama Science and Technology University Alumni Management System - Connecting excellence to industry.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-astu-red" />
                <span>Adama, Oromia, Ethiopia</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-astu-red" />
                <span>+251-221-110000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-astu-red" />
                <span>alumni.office@astu.edu.et</span>
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
            © 2026 Adama Science and Technology University. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition-colors hover:text-white">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition-colors hover:text-white">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition-colors hover:text-white">
              <Youtube className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition-colors hover:text-white">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition-colors hover:text-white">
              <Instagram className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}