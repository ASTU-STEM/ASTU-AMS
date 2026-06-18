import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CircleUserRound,
  FileCheck2,
  Globe,
  GraduationCap,
  Handshake,
  LineChart,
  LockKeyhole,
  Menu,
  Search,
  Users,
  X,
  MapPin,
  Heart,
} from "lucide-react";

import astuBuilding from "../../assets/imgs/astu-building.jpg";
import campusImg from "../../assets/imgs/campus-2.jpeg";
import arcImage from "../../assets/images/arc.jpg";
import stateM from "../../assets/images/State-M.jpg";
import gc7 from "../../assets/images/gc7.jpg";
import electricLabs from "../../assets/images/electriclabs.jpeg";

const FALLBACK_IMAGE = "/images/fallback-campus.svg";



const navSections = [
  { label: "Home", id: "home" },
  { label: "Stakeholders", id: "stakeholders" },
  { label: "Impact", id: "impact" },
  { label: "Gallery", id: "gallery" },
  { label: "Community", id: "community" },
  { label: "Events", id: "events" },
  { label: "News", id: "news" },
  { label: "Success Stories", id: "success-stories" },
  { label: "Contact", id: "contact" },
];



const communityPosts: {
  name: string;
  role: string;
  text: string;
  image: string;
}[] = [];

const events: {
  title: string;
  date: string;
  location: string;
  image: string;
}[] = [];

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const stakeholders = [
    {
      title: t("home.alumniTitle"),
      icon: Users,
      points: [
        t("home.alumniPoint1"),
        t("home.alumniPoint2"),
        t("home.alumniPoint3"),
        t("home.alumniPoint4"),
      ],
      cta: t("home.alumniCta"),
      route: "/alumni",
      tint: "text-astu-navy bg-astu-navy/10",
    },
    {
      title: t("home.employersTitle"),
      icon: Briefcase,
      points: [
        t("home.employersPoint1"),
        t("home.employersPoint2"),
        t("home.employersPoint3"),
      ],
      cta: t("home.employersCta"),
      route: "/employer",
      tint: "text-astu-red bg-astu-red/10",
    },
    {
      title: t("home.departmentsTitle"),
      icon: LineChart,
      points: [
        t("home.departmentsPoint1"),
        t("home.departmentsPoint2"),
        t("home.departmentsPoint3"),
      ],
      cta: t("home.departmentsCta"),
      route: "/department",
      tint: "text-astu-green bg-astu-green/10",
    },
    {
      title: t("home.registrarTitle"),
      icon: FileCheck2,
      points: [
        t("home.registrarPoint1"),
        t("home.registrarPoint2"),
        t("home.registrarPoint3"),
      ],
      cta: t("home.registrarCta"),
      route: "/registrar",
      tint: "text-[#B87900] bg-[#E8A020]/15",
    },
    {
      title: t("home.administratorTitle"),
      icon: LockKeyhole,
      points: [
        t("home.administratorPoint1"),
        t("home.administratorPoint2"),
        t("home.administratorPoint3"),
      ],
      cta: t("home.administratorCta"),
      route: "/admin",
      tint: "text-violet-700 bg-violet-100",
    },
  ];

  const searchItems = [
    { label: t("landing.goToStakeholders"), type: "section", id: "stakeholders" },
    { label: t("landing.goToImpact"), type: "section", id: "impact" },
    { label: t("landing.goToGallery"), type: "section", id: "gallery" },
    { label: t("landing.goToCommunity"), type: "section", id: "community" },
    { label: t("landing.goToEvents"), type: "section", id: "events" },
    { label: t("landing.goToNews"), type: "section", id: "news" },
    {
      label: t("landing.goToSuccessStories"),
      type: "section",
      id: "success-stories",
    },
    { label: t("landing.alumniPortal"), type: "route", route: "/alumni" },
    { label: t("landing.employerPortal"), type: "route", route: "/employer" },
    { label: t("landing.registrarPortal"), type: "route", route: "/registrar" },
    { label: t("landing.departmentPortal"), type: "route", route: "/department" },
    { label: t("landing.adminPortal"), type: "route", route: "/admin" },
  ];

  const searchWrapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const filteredSearch = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    return searchItems
      .filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, 6);
  }, [searchQuery]);

  const goToSection = (id) => {
    const node = document.getElementById(id);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMobileNavOpen(false);
    }
  };

  const handleSearchSelect = (item) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    if (item.type === "section") {
      goToSection(item.id);
      return;
    }

    if (item.type === "route") {
      navigate(item.route);
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && filteredSearch.length > 0) {
      handleSearchSelect(filteredSearch[0]);
    }
  };

  const handleImageError = (event) => {
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.15 },
    );

    const nodes = document.querySelectorAll(".reveal");
    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: 0.1 },
    );

    navSections.forEach((section) => {
      const node = document.getElementById(section.id);
      if (node) {
        sectionObserver.observe(node);
      }
    });

    return () => sectionObserver.disconnect();
  }, []);

  useEffect(() => {
    const closeOnOutside = (event) => {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("click", closeOnOutside);
    return () => window.removeEventListener("click", closeOnOutside);
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="sticky top-0 z-50 border-b border-outline-variant bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 md:px-8">
          <Link to="/" className="flex min-w-fit items-center gap-2">
            <div className="rounded-full border border-outline-variant p-1.5">
              <GraduationCap className="h-4 w-4 text-astu-red" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-astu-navy">
                {t("app.name")}
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                {t("landing.alumniEcosystem")}
              </p>
            </div>
          </Link>

          <div
            ref={searchWrapRef}
            className="relative hidden flex-1 max-w-xl md:block"
          >
            <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              className="w-full rounded-md border border-outline-variant bg-surface-container-low py-2 pl-9 pr-3 text-sm focus:border-astu-navy focus:outline-none"
              placeholder={t("landing.searchPlaceholder")}
              type="text"
            />

            {isSearchOpen && filteredSearch.length > 0 ? (
              <div className="absolute top-12 w-full overflow-hidden rounded-md border border-outline-variant bg-white shadow-lg">
                {filteredSearch.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSearchSelect(item)}
                    className="flex w-full items-center border-b border-outline-variant px-3 py-2 text-left text-sm last:border-b-0 hover:bg-surface-container-low"
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <nav className="hidden items-center gap-5 xl:flex">
            {navSections.map((item) => (
              <button
                key={item.id}
                className={`text-xs font-semibold transition-colors ${
                  activeSection === item.id
                    ? "text-astu-navy"
                    : "text-on-surface-variant hover:text-astu-navy"
                }`}
                onClick={() => goToSection(item.id)}
              >
                {t(`landing.${item.id}`)}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              aria-label="notifications"
              className="rounded-full p-2 hover:bg-surface-container-low"
              onClick={() => navigate("/alumni/dashboard")}
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              aria-label="mobile navigation"
              className="rounded-full p-2 hover:bg-surface-container-low xl:hidden"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
            >
              {isMobileNavOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
            <button
              aria-label="profile"
              className="rounded-full border border-outline-variant p-1.5 hover:bg-surface-container-low"
              onClick={() => navigate("/alumni/dashboard")}
            >
              <CircleUserRound className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isMobileNavOpen ? (
          <div className="border-t border-outline-variant bg-white px-4 py-4 xl:hidden">
            <div className="space-y-2">
              {navSections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => goToSection(item.id)}
                  className="block w-full rounded-md border border-outline-variant px-3 py-2 text-left text-sm font-semibold text-astu-navy"
                >
                  {t(`landing.${item.id}`)}
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => navigate("/alumni/dashboard")}
                className="rounded-md bg-astu-navy px-3 py-2 text-sm font-semibold text-white"
              >
                {t("landing.alumniPortal")}
              </button>
              <button
                onClick={() => navigate("/employer/dashboard")}
                className="rounded-md border border-outline-variant px-3 py-2 text-sm font-semibold"
              >
                {t("landing.employerPortal")}
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <main id="home">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              alt="ASTU campus"
              className="h-full w-full object-cover"
              src={astuBuilding}
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,51,102,0.84),rgba(0,30,64,0.94))]" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1440px] px-4 py-20 md:px-8 md:py-28 lg:py-32">
            <div className="max-w-3xl reveal">
              <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                {t("landing.heroTitle")}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-100 md:text-base">
                {t("landing.heroDesc")}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-astu-red px-6 py-3 text-sm font-semibold text-white hover:brightness-110"
                  onClick={() => navigate("/alumni/dashboard")}
                >
                  {t("landing.alumniPortalLogin")}
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20"
                  onClick={() => navigate("/employer/dashboard")}
                >
                  {t("home.employerPartnership")}
                  <Handshake className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-20 mx-auto -mt-12 mb-16 max-w-[1440px] px-4 md:-mt-16 md:px-8">
          <div className="grid overflow-hidden rounded-xl border border-outline-variant bg-white shadow-xl md:grid-cols-3">
            <article className="flex flex-col items-center gap-3 border-b border-outline-variant p-8 text-center md:border-b-0 md:border-r">
              <div className="rounded-full bg-astu-navy/10 p-3 text-astu-navy">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-astu-navy">24,000+</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                {t("landing.globalAstuAlumni")}
              </p>
            </article>
            <article className="flex flex-col items-center gap-3 border-b border-outline-variant p-8 text-center md:border-b-0 md:border-r">
              <div className="rounded-full bg-astu-red/10 p-3 text-astu-red">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-astu-navy">500+</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                {t("home.partnerOrganizations")}
              </p>
            </article>
            <article className="flex flex-col items-center gap-3 p-8 text-center">
              <div className="rounded-full bg-astu-green/10 p-3 text-astu-green">
                <LineChart className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-astu-navy">87%</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">
                {t("home.employmentRate")}
              </p>
            </article>
          </div>
        </section>

        <section
          id="stakeholders"
          className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16"
        >
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">
              {t("landing.stakeholderPortals")}
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              {t("landing.stakeholderDesc")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {stakeholders.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className={`mb-4 inline-flex rounded-lg p-3 ${item.tint}`}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h4 className="mb-3 text-base font-semibold text-astu-navy sm:text-lg">
                    {item.title}
                  </h4>
                  <ul className="space-y-2.5 text-sm text-on-surface-variant">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-astu-navy hover:text-astu-red"
                    onClick={() => navigate(item.route)}
                  >
                    {item.cta}
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <section
          id="impact"
          className="mx-auto grid max-w-[1440px] gap-8 px-4 py-12 md:grid-cols-2 md:px-8 md:py-16"
        >
          <article className="reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-astu-red">
              {t("home.industryCampusBridge")}
            </p>
            <h3 className="mt-2 text-3xl font-bold text-astu-navy">
              {t("home.nurturingInnovation")}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              {t("home.impactDesc")}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold text-astu-navy">12+</p>
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                  {t("home.researchCenters")}
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-astu-navy">80+</p>
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">
                  {t("home.industryPartners")}
                </p>
              </div>
            </div>
            <button
              className="mt-7 rounded-md bg-astu-navy px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
              onClick={() => navigate("/department")}
            >
              {t("home.exploreCampusLife")}
            </button>
          </article>

          <article className="reveal">
            <img
              alt="ASTU Innovation Arc"
              className="h-full min-h-[280px] w-full rounded-xl object-cover shadow-lg"
              src={arcImage}
              onError={handleImageError}
            />
          </article>
        </section>

        <section
          id="community"
          className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16"
        >
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">
              {t("landing.communityFeed")}
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              {t("landing.communityDesc")}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4 sm:col-span-2 lg:col-span-2">
              <div className="reveal rounded-xl border border-outline-variant bg-white p-4">
                <div className="mb-3 flex items-center gap-2 rounded-md bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
                  <BookOpen className="h-4 w-4" />
                  {t("landing.shareUpdate")}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs font-medium hover:bg-surface-container-low">
                    {t("landing.media")}
                  </button>
                  <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs font-medium hover:bg-surface-container-low">
                    {t("landing.event")}
                  </button>
                  <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs font-medium hover:bg-surface-container-low">
                    {t("landing.article")}
                  </button>
                </div>
              </div>

              {communityPosts.map((post) => (
                <article
                  key={post.name}
                  className="reveal rounded-xl border border-outline-variant bg-white p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {post.image && (
                        <img
                          src={post.image}
                          alt={post.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold text-astu-navy">
                          {post.name}
                        </h4>
                        <p className="text-xs text-on-surface-variant">
                          {post.role}
                        </p>
                      </div>
                    </div>
                    <button className="rounded-md px-2 py-1 text-xs text-on-surface-variant hover:bg-surface-container-low">
                      ...
                    </button>
                  </div>
                  <p className="text-sm text-on-surface-variant">{post.text}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs hover:bg-surface-container-low">
                      {t("landing.like")}
                    </button>
                    <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs hover:bg-surface-container-low">
                      {t("landing.comment")}
                    </button>
                    <button className="rounded-md border border-outline-variant px-3 py-1.5 text-xs hover:bg-surface-container-low">
                      {t("landing.share")}
                    </button>
                    <button
                      className="rounded-md border border-outline-variant px-3 py-1.5 text-xs hover:bg-surface-container-low"
                      onClick={() => navigate("/alumni/dashboard")}
                    >
                      {t("landing.viewProfile")}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="space-y-4 lg:col-span-1">
              <article className="reveal rounded-xl border border-outline-variant bg-white p-4">
                <h4 className="text-sm font-semibold text-astu-navy">
                  {t("landing.recommendedConnections")}
                </h4>
                <div className="mt-3 space-y-3 text-sm">
                  <button className="flex w-full items-center justify-between rounded-md border border-outline-variant px-3 py-2 text-left hover:bg-surface-container-low">
                    <span>Meta Finetec PLC</span>
                  </button>
                  <button className="flex w-full items-center justify-between rounded-md border border-outline-variant px-3 py-2 text-left hover:bg-surface-container-low">
                    <span>Summit Devs</span>
                  </button>
                </div>
              </article>

              <article className="reveal rounded-xl border border-outline-variant bg-white p-4">
                <h4 className="text-sm font-semibold text-astu-navy">
                  {t("landing.trendingTopics")}
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
                  <li>#EngineeringCareers</li>
                  <li>#TracerStudy2026</li>
                  <li>#ASTUInnovation</li>
                </ul>
                <button
                  className="mt-4 rounded-md border border-outline-variant px-3 py-1.5 text-xs hover:bg-surface-container-low"
                  onClick={() => navigate("/department")}
                >
                  {t("landing.viewInsights")}
                </button>
              </article>
            </aside>
          </div>
        </section>

        <section className="bg-gradient-to-r from-astu-navy to-primary-container py-14 md:py-20">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-4 md:grid-cols-2 md:px-8">
            <article className="reveal text-white">
              <p className="inline-flex rounded-full bg-astu-red px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                {t("home.qualityAssurance")}
              </p>
              <h3 className="mt-4 text-3xl font-bold">
                {t("home.dataDrivenAccreditation")}
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-200">
                {t("home.accreditationDesc")}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                  <Globe className="mb-2 h-5 w-5 text-astu-green" />
                  <h4 className="text-sm font-semibold">
                    {t("home.globalAccreditation")}
                  </h4>
                  <p className="mt-1 text-xs text-slate-300">
                    {t("home.globalAccreditationDesc")}
                  </p>
                </div>
                <div className="rounded-lg border border-white/20 bg-white/5 p-4">
                  <Handshake className="mb-2 h-5 w-5 text-astu-green" />
                  <h4 className="text-sm font-semibold">{t("home.marketAlignment")}</h4>
                  <p className="mt-1 text-xs text-slate-300">
                    {t("home.marketAlignmentDesc")}
                  </p>
                </div>
              </div>
              <button
                className="mt-6 rounded-md bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-astu-navy hover:bg-slate-100"
                onClick={() => navigate("/department")}
              >
                {t("landing.participateInImpactStudy")}
              </button>
            </article>

            <article className="reveal grid gap-2 sm:col-span-2 sm:grid-cols-2 md:col-span-1">
              <img
                alt="ASTU Innovation Arc"
                className="h-40 w-full rounded-xl border border-white/10 object-cover shadow-lg sm:h-48"
                src={gc7}
                onError={handleImageError}
              />
              <img
                alt="Electric Labs"
                className="h-40 w-full rounded-xl border border-white/10 object-cover shadow-lg sm:h-48"
                src={electricLabs}
                onError={handleImageError}
              />
            </article>
          </div>
        </section>

        <section
          id="events"
          className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16"
        >
          <div className="reveal mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h3 className="text-2xl font-bold text-astu-navy sm:text-3xl">
                {t("home.upcomingAlumniEvents")}
              </h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                {t("home.eventsDesc")}
              </p>
            </div>
            <button
              className="rounded-md border border-outline-variant px-3 py-2 text-xs font-semibold hover:bg-surface-container-low"
              onClick={() => navigate("/alumni/dashboard")}
            >
              {t("home.seeAllEvents")}
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {events.map((event) => (
              <article
                key={event.title}
                className="reveal overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm"
              >
                <img
                  alt={event.title}
                  className="h-48 w-full object-cover sm:h-52"
                  src={event.image}
                  onError={handleImageError}
                />
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-astu-red">
                    {t("home.careerDevelopment")}
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-astu-navy">
                    {event.title}
                  </h4>
                  <div className="mt-3 flex flex-col gap-2 text-xs text-on-surface-variant sm:flex-row sm:flex-wrap sm:gap-4">
                    <p className="inline-flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {event.date}
                    </p>
                    <p>{event.location}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      className="rounded-md bg-astu-navy px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
                      onClick={() => navigate("/alumni")}
                    >
                      {t("home.register")}
                    </button>
                    <button className="rounded-md border border-outline-variant px-4 py-2 text-xs font-semibold hover:bg-surface-container-low">
                      {t("home.learnMore")}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="news"
          className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 bg-surface-container-low/30"
        >
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">
              {t("home.latestNews")}
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              {t("home.newsDesc")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {[
              t("landing.newEngineeringLab"),
              t("landing.researchGrantResults"),
              t("landing.careerExpo2026"),
            ].map((news, i) => (
              <article
                key={i}
                className="reveal rounded-xl border border-outline-variant bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-astu-red">
                  {t("home.announcement")}
                </p>
                <h4 className="mt-2 font-semibold text-astu-navy">{news}</h4>
                <p className="mt-2 text-xs text-on-surface-variant">
                  May {15 + i * 5}, 2026
                </p>
                <button
                  className="mt-3 text-xs text-astu-navy hover:underline"
                  onClick={() => navigate("/alumni")}
                >
                  {t("home.readMore")}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section
          id="success-stories"
          className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16"
        >
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">
              {t("home.alumniSuccessStories")}
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              {t("home.successStoriesDesc")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {communityPosts.map((post, i) => (
              <article
                key={i}
                className="reveal rounded-xl border border-outline-variant bg-white overflow-hidden shadow-sm"
              >
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.name}
                    className="h-48 w-full object-cover"
                    onError={handleImageError}
                  />
                )}
                <div className="p-4">
                  <h4 className="font-semibold text-astu-navy">{post.name}</h4>
                  <p className="text-xs text-on-surface-variant">{post.role}</p>
                  <p className="mt-2 text-sm line-clamp-2">{post.text}</p>
                  <button
                    className="mt-3 text-xs text-astu-navy hover:underline"
                    onClick={() => navigate("/alumni")}
                  >
                    {t("home.readStory")}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16 bg-surface-container-low/30"
        >
          <div className="mb-10 text-center reveal">
            <h3 className="text-2xl font-bold text-astu-navy md:text-3xl">
              {t("home.contactUs")}
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-on-surface-variant">
              {t("home.contactDesc")}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-xl border border-outline-variant bg-white">
              <MapPin className="h-8 w-8 mx-auto text-astu-navy mb-3" />
              <h4 className="font-semibold text-astu-navy">{t("home.address")}</h4>
              <p className="text-xs text-on-surface-variant mt-1">
                Adama, Oromia, Ethiopia
              </p>
            </div>
            <div className="text-center p-6 rounded-xl border border-outline-variant bg-white">
              <span className="material-symbols-outlined text-astu-navy text-3xl mb-3">
                phone
              </span>
              <h4 className="font-semibold text-astu-navy">{t("home.phone")}</h4>
              <p className="text-xs text-on-surface-variant mt-1">
                +251-221-110000
              </p>
            </div>
            <div className="text-center p-6 rounded-xl border border-outline-variant bg-white">
              <span className="material-symbols-outlined text-astu-navy text-3xl mb-3">
                mail
              </span>
              <h4 className="font-semibold text-astu-navy">{t("home.email")}</h4>
              <p className="text-xs text-on-surface-variant mt-1">
                alumni.office@astu.edu.et
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant bg-surface py-10">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-4 md:grid-cols-4 md:px-8">
          <div>
            <h5 className="text-sm font-bold text-astu-navy">{t("app.name")}</h5>
            <p className="mt-2 text-xs text-on-surface-variant">
              {t("footer.designedFor")}
            </p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-md border border-outline-variant px-2 py-1 text-xs hover:bg-surface-container-low">
                FB
              </button>
              <button className="rounded-md border border-outline-variant px-2 py-1 text-xs hover:bg-surface-container-low">
                X
              </button>
              <button className="rounded-md border border-outline-variant px-2 py-1 text-xs hover:bg-surface-container-low">
                IN
              </button>
            </div>
          </div>

          <div>
            <h6 className="text-xs font-semibold uppercase tracking-[0.14em] text-astu-navy">
              {t("footer.resources")}
            </h6>
            <ul className="mt-3 space-y-2 text-xs text-on-surface-variant">
              <li>
                <button
                  className="hover:text-astu-navy"
                  onClick={() => navigate("/alumni")}
                >
                  {t("landing.careerPortal")}
                </button>
              </li>
              <li>
                <button
                  className="hover:text-astu-navy"
                  onClick={() => navigate("/alumni")}
                >
                  {t("landing.tracerSurvey")}
                </button>
              </li>
              <li>
                <button
                  className="hover:text-astu-navy"
                  onClick={() => navigate("/alumni")}
                >
                  {t("landing.mentorship")}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="text-xs font-semibold uppercase tracking-[0.14em] text-astu-navy">
              {t("landing.university")}
            </h6>
            <ul className="mt-3 space-y-2 text-xs text-on-surface-variant">
              <li>
                <button className="hover:text-astu-navy">
                  {t("landing.officialWebsite")}
                </button>
              </li>
              <li>
                <button className="hover:text-astu-navy">
                  {t("home.researchCenters")}
                </button>
              </li>
              <li>
                <button className="hover:text-astu-navy">{t("landing.accreditation")}</button>
              </li>
            </ul>
          </div>

          <div>
            <h6 className="text-xs font-semibold uppercase tracking-[0.14em] text-astu-navy">
              {t("landing.support")}
            </h6>
            <ul className="mt-3 space-y-2 text-xs text-on-surface-variant">
              <li>
                <button
                  className="hover:text-astu-navy"
                  onClick={() => navigate("/registrar/dashboard")}
                >
                  {t("dashboard.helpCenter")}
                </button>
              </li>
              <li>
                <button
                  className="hover:text-astu-navy"
                  onClick={() => navigate("/admin/dashboard")}
                >
                  {t("landing.privacyPolicy")}
                </button>
              </li>
              <li>
                <button
                  className="hover:text-astu-navy"
                  onClick={() => navigate("/registrar/dashboard")}
                >
                  {t("home.contactUs")}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-[1440px] flex-col justify-between gap-2 border-t border-outline-variant px-4 pt-5 text-xs text-on-surface-variant md:flex-row md:px-8">
          <p>
            {t("footer.copyright")}
          </p>
          <p>{t("landing.designedFor")}</p>
        </div>
      </footer>
    </div>
  );
}
