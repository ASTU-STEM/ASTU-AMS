import React from "react";
import { useTranslation } from "react-i18next";
import { Facebook, Linkedin, Send, Mail, Phone, MapPin, Globe } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  const footerSections = [
    {
      title: t("footer.portalServices"),
      links: [
        { label: t("footer.alumni"), href: "/info/alumni-portal" },
        { label: t("footer.employer"), href: "/info/employer-portal" },
        { label: t("footer.registrar"), href: "/info/registrar-portal" },
        { label: t("footer.department"), href: "/info/department-portal" },
      ],
    },
    {
      title: t("footer.aboutAstu"),
      links: [
        { label: t("footer.universityOverview"), href: "/" },
        { label: t("footer.stakeholderPortals"), id: "stakeholders", scroll: true },
        { label: t("footer.impactAccreditation"), id: "impact", scroll: true },
        { label: t("footer.researchHighlights"), id: "research", scroll: true },
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        { label: t("nav.events"), id: "events", scroll: true },
        { label: t("nav.workshops"), id: "workshops", scroll: true },
        { label: t("nav.careerOpportunities"), id: "career-opportunities", scroll: true },
        { label: t("home.faq"), id: "faq", scroll: true },
      ],
    },
    {
      title: t("footer.connect"),
      links: [
        { label: t("footer.contactUs"), id: "contact", scroll: true },
        { label: t("footer.photoGallery"), id: "gallery", scroll: true },
        { label: t("footer.communityFeed"), id: "community", scroll: true },
        { label: t("footer.joinAlumni"), href: "/register" },
      ],
    },
  ];

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
            <h4 className="text-lg font-bold text-white">{t("app.name")}</h4>
            <p className="mt-2 text-sm text-slate-400">
              {t("app.taglineFooter")}
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-astu-green" />
                <span>{t("footer.address")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-astu-green" />
                <span>{t("footer.poBox")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-astu-green" />
                <span>{t("footer.phone")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-astu-green" />
                <span>{t("footer.email")}</span>
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
            {t("footer.copyright")}
          </p>
          <div className="flex items-center gap-4">
            <a href="https://web.facebook.com/adamaastu/" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition-colors hover:text-white" title="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="https://t.me/Adama_STU_Almuni" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition-colors hover:text-white" title="Telegram">
              <Send className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition-colors hover:text-white" title="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="border-t border-slate-800 py-3 text-center text-[11px] text-slate-500">
          {t("footer.designedBy")} <a href="https://www.astu.edu.et" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">ASTU-BADA</a>
        </div>
      </div>
    </footer>
  );
}