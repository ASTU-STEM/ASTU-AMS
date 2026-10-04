import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  ChevronDown,
  Home,
  Info,
  Menu,
  Megaphone,
  Moon,
  Search,
  Sun,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import authService from "../features/auth/services/auth.service";
import AnnouncementPanel from "./AnnouncementPanel";
import { useSystemSettings } from "../context/SystemSettingsContext";
import { useTheme } from "../hooks/useTheme";

interface MegaMenuItem {
  label: string;
  sectionId: string;
  description?: string;
}

interface MegaMenu {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MegaMenuItem[];
}

const megaMenus: MegaMenu[] = [
  {
    label: "About",
    icon: Info,
    items: [
      { label: "About ASTU", sectionId: "impact", description: "Mission, vision and institutional impact" },
      { label: "Campuses", sectionId: "campuses", description: "Campuses and facilities" },
      { label: "Campus Life", sectionId: "campus-life", description: "Student activities and culture" },
      { label: "Research", sectionId: "research", description: "Research and innovation highlights" },
      { label: "Success Stories", sectionId: "success-stories", description: "Alumni achievements" },
    ],
  },
  {
    label: "Services",
    icon: Building2,
    items: [
      { label: "How It Works", sectionId: "how-it-works", description: "Portals for alumni, employers and departments" },
      { label: "Career Opportunities", sectionId: "career-opportunities", description: "Jobs and internships" },
      { label: "Partners", sectionId: "partners", description: "Industry and institutional partners" },
      { label: "Community Voices", sectionId: "testimonials", description: "What alumni and partners say" },
    ],
  },
  {
    label: "Media",
    icon: Megaphone,
    items: [
      { label: "Events", sectionId: "events", description: "Upcoming gatherings" },
      { label: "Workshops", sectionId: "workshops", description: "Skill-building sessions" },
      { label: "News", sectionId: "news", description: "Latest updates" },
      { label: "Announcements", sectionId: "announcements", description: "Official notices" },
      { label: "Gallery", sectionId: "gallery", description: "Photo moments" },
      { label: "Video Gallery", sectionId: "video-gallery", description: "Video highlights" },
    ],
  },
];

interface SimpleNavItem {
  label: string;
  sectionId?: string;
  route?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const simpleItems: SimpleNavItem[] = [
  { label: "Home", sectionId: "home", icon: Home },
  { label: "Partners", route: "/partners", icon: Users },
];

const searchItems = [
  ...megaMenus.flatMap((m) => m.items),
  ...simpleItems.map((s) => ({ label: s.label, sectionId: s.sectionId })),
].map((item) => ({
  label: item.label,
  sectionId: item.sectionId,
}));

function scrollToSection(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const { settings } = useSystemSettings();
  const { darkMode, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const checkUserSession = () => {
      try {
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    };
    checkUserSession();
    window.addEventListener("storage", checkUserSession);
    return () => window.removeEventListener("storage", checkUserSession);
  }, []);

  const filteredSearch = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchItems
      .filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 6);
  }, [searchQuery]);

  const handleSearchSelect = (item: (typeof searchItems)[number]) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    if (item.sectionId) navigateToSection(item.sectionId);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredSearch.length > 0) {
      handleSearchSelect(filteredSearch[0]);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sectionId = params.get("scrollTo");
    if (sectionId && location.pathname === "/") {
      const timer = setTimeout(() => {
        scrollToSection(sectionId);
        window.history.replaceState({}, "", "/");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    toast.success("Successfully signed out");
    navigate("/");
  };

  const navigateToSection = (sectionId: string) => {
    setIsMobileNavOpen(false);
    setOpenMega(null);
    if (location.pathname === "/") {
      scrollToSection(sectionId);
    } else {
      navigate(`/?scrollTo=${sectionId}`);
    }
  };

  const handleNavClick = (item: SimpleNavItem) => {
    setIsMobileNavOpen(false);
    setOpenMega(null);
    if (item.route) {
      navigate(item.route);
    } else if (item.sectionId) {
      navigateToSection(item.sectionId);
    }
  };

  const handleMegaItemClick = (sectionId: string) => {
    setIsMobileNavOpen(false);
    setOpenMega(null);
    navigateToSection(sectionId);
  };

  const handleMegaEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMega(label);
  };

  const handleMegaLeave = () => {
    closeTimer.current = setTimeout(() => setOpenMega(null), 120);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 dark:bg-slate-900/95 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-colors">
      <div className="hidden bg-astu-navy dark:bg-slate-950 text-white md:block border-b border-white/10 dark:border-slate-800">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-1">
          <div className="flex items-center gap-4 text-xs text-white/80">
            <a
              href={`mailto:${settings.general?.contactEmail || "admin@astu.edu.et"}`}
              className="hover:text-white transition-colors font-medium"
            >
              {settings.general?.contactEmail || "admin@astu.edu.et"}
            </a>
            <span className="text-white/20">|</span>
            <span className="font-medium">{settings.general?.phoneNumber || "+251-221-110000"}</span>
          </div>
          <div className="flex items-center gap-3 text-[13px]">
            <Link
              to="/login"
              className="text-white/80 hover:text-white transition-colors font-medium"
            >
              Login
            </Link>
            <span className="text-white/20">|</span>
            <Link
              to="/register"
              className="text-white/80 hover:text-white transition-colors font-medium"
            >
              Register
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-3 py-3 group">
          <div className="flex items-center gap-2.5">
            <img
              src={settings.appearance?.logoUrl || "/images/astu-seal-logo.png"}
              alt={`${settings.general?.abbreviation || "ASTU"} Logo`}
              className="h-10 w-10 object-contain scale-110 shrink-0"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-astu-navy dark:text-white leading-tight">
                {settings.general?.abbreviation || "ASTU"}-AMS
              </p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-astu-green font-semibold">
                {settings.general?.portalTitle || "Alumni Management System"}
              </p>
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {simpleItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.sectionId || item.route}
                onClick={() => handleNavClick(item)}
                className="relative flex items-center gap-1.5 px-4 py-4 text-[15px] font-bold tracking-wide text-slate-700 hover:text-astu-navy dark:text-slate-300 dark:hover:text-amber-400 transition-colors duration-200"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}

          {megaMenus.map((menu) => {
            const Icon = menu.icon;
            const isOpen = openMega === menu.label;
            return (
              <div
                key={menu.label}
                className="relative"
                onMouseEnter={() => handleMegaEnter(menu.label)}
                onMouseLeave={handleMegaLeave}
              >
                <button
                  className={`relative flex items-center gap-1.5 px-4 py-4 text-[15px] font-bold tracking-wide transition-colors duration-200 ${
                    isOpen
                      ? "text-astu-navy dark:text-amber-400"
                      : "text-slate-700 hover:text-astu-navy dark:text-slate-300 dark:hover:text-amber-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {menu.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute left-0 top-full animate-[mega-menu-fade-in_150ms_ease-out_both]">
                    <div className="mt-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl min-w-[260px]">
                      <div className="p-2">
                        {menu.items.map((item) => (
                          <button
                            key={item.sectionId}
                            onClick={() => handleMegaItemClick(item.sectionId)}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <div>
                              <p className="text-sm font-bold text-astu-navy dark:text-amber-400">
                                {item.label}
                              </p>
                              {item.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div ref={searchWrapRef} className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              className="w-48 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white py-2.5 pl-8 pr-3 text-sm focus:w-60 focus:border-astu-navy focus:outline-none focus:ring-2 focus:ring-astu-navy/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Search sections..."
              type="text"
            />
            {isSearchOpen && filteredSearch.length > 0 && (
              <div className="absolute right-0 top-11 w-64 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl animate-[mega-menu-fade-in_150ms_ease-out_both]">
                {filteredSearch.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSearchSelect(item)}
                    className="flex w-full items-center border-b border-slate-100 dark:border-slate-800 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-800 dark:text-slate-200"
                  >
                    <span className="font-semibold">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-astu-navy dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-400 transition-all"
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            aria-label="Announcements"
            className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-astu-navy dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-amber-400 transition-all"
            onClick={() => setIsAnnouncementOpen(true)}
            title="Announcements"
          >
            <Bell className="h-5 w-5" />
          </button>

          <Link
            to="/register"
            className="hidden sm:inline-flex rounded-lg bg-astu-navy px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-astu-navy/90 hover:shadow-lg"
          >
            Join Network
          </Link>

          <button
            aria-label="Open navigation menu"
            className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
          >
            {isMobileNavOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {isMobileNavOpen && (
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 lg:hidden shadow-xl text-slate-800 dark:text-slate-200">
          <div className="mb-4 pb-4 border-b border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Appearance</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
                <span>{darkMode ? "Dark Theme" : "Light Theme"}</span>
              </button>
            </div>
            {!user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-sm font-bold text-astu-navy dark:text-amber-400 text-center hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="rounded-lg bg-astu-navy px-3 py-2.5 text-sm font-bold text-white text-center hover:brightness-95"
                >
                  Join Network
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Signed in</span>
                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    handleLogout();
                  }}
                  className="rounded-lg border border-rose-200 dark:border-rose-900/60 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full rounded-full border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-3 text-base focus:outline-none"
                placeholder="Search sections..."
                type="text"
              />
            </div>
            {filteredSearch.length > 0 && (
              <div className="mt-1 overflow-hidden rounded-xl border border-outline-variant bg-white shadow-md max-h-60 overflow-y-auto">
                {filteredSearch.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSearchSelect(item)}
                    className="flex w-full items-center border-b border-outline-variant/50 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-astu-navy/5 transition-colors"
                  >
                    <span className="font-semibold text-on-surface">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            {simpleItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.sectionId || item.route}
                  onClick={() => handleNavClick(item)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base font-bold text-on-surface hover:bg-astu-navy/5 transition-all text-left"
                >
                  <Icon className="h-5 w-5 text-astu-navy/60" />
                  {item.label}
                </button>
              );
            })}

            {megaMenus.map((menu) => {
              const Icon = menu.icon;
              const isOpen = openMega === menu.label;
              return (
                <div key={menu.label}>
                  <button
                    onClick={() => setOpenMega(isOpen ? null : menu.label)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-bold text-on-surface hover:bg-astu-navy/5 transition-all text-left"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-astu-navy/60" />
                      {menu.label}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-on-surface-variant transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="ml-8 space-y-1 pb-1">
                      {menu.items.map((item) => (
                        <button
                          key={item.sectionId}
                          onClick={() => handleMegaItemClick(item.sectionId)}
                          className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-astu-navy/5 transition-all text-left"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AnnouncementPanel
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
      />
    </header>
  );
}
