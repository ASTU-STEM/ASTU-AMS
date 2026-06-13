import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HiHome,
  HiMagnifyingGlass,
  HiXMark,
  HiBars3,
  HiChevronDown,
} from "react-icons/hi2";
import { MdCampaign, MdDashboardCustomize } from "react-icons/md";
import { FaInfoCircle, FaUsers } from "react-icons/fa";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";
import authService from "../features/auth/services/auth.service";
import AnnouncementPanel from "./AnnouncementPanel";
import astuLogo from "../assets/logos/astu-icon.jpeg";

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
    icon: FaInfoCircle,
    items: [
      { label: "About ASTU", sectionId: "impact", description: "Mission, vision & history" },
      { label: "Campuses", sectionId: "campuses", description: "Our campuses & facilities" },
      { label: "Campus Life", sectionId: "campus-life", description: "Student activities & culture" },
      { label: "Research", sectionId: "research", description: "Innovation & discoveries" },
      { label: "Success Stories", sectionId: "success-stories", description: "Alumni achievements" },
    ],
  },
  {
    label: "Services",
    icon: MdDashboardCustomize,
    items: [
      { label: "Stakeholders", sectionId: "stakeholders", description: "Partners & collaborators" },
      { label: "Career Opportunities", sectionId: "career-opportunities", description: "Jobs & internships" },
      { label: "Testimonials", sectionId: "testimonials", description: "What alumni say" },
    ],
  },
  {
    label: "Media",
    icon: MdCampaign,
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
  { label: "Home", sectionId: "home", icon: HiHome },
  { label: "Partners", route: "/partners", icon: FaUsers },
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
    navigateToSection(item.sectionId);
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
    toast.success("Successfully signed out!");
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
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="hidden bg-[#003580] text-white md:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-1.5">
          <div className="flex items-center gap-4 text-xs text-white/80">
            <a
              href="mailto:alumni.office@astu.edu.et"
              className="hover:text-white transition-colors"
            >
              alumni.office@astu.edu.et
            </a>
            <span className="text-white/20">|</span>
            <span>+251-221-110000</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link
              to="/login"
              className="text-white/80 hover:text-white transition-colors"
            >
              Login
            </Link>
            <span className="text-white/20">|</span>
            <Link
              to="/register"
              className="text-white/80 hover:text-white transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-3 py-4">
          <div className="flex items-center gap-2.5">
            <img
              src={astuLogo}
              alt="ASTU"
              className="h-10 w-10 rounded-lg object-contain"
            />
            <div className="hidden sm:block">
              <p className="text-base font-bold text-[#003580] leading-tight">
                ASTU-AMS
              </p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#1D9E75] font-semibold">
                Alumni Management System
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
                className="flex items-center gap-2 px-4 py-4 text-sm font-medium text-slate-600 hover:text-[#003580] transition-colors"
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
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
                    isOpen
                      ? "text-[#003580]"
                      : "text-slate-600 hover:text-[#003580]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {menu.label}
                  <HiChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute left-0 top-full">
                    <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg min-w-[240px]">
                      <div className="p-1">
                        {menu.items.map((item) => (
                          <button
                            key={item.sectionId}
                            onClick={() => handleMegaItemClick(item.sectionId)}
                            className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left transition-colors hover:bg-slate-50"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {item.label}
                              </p>
                              {item.description && (
                                <p className="text-xs text-slate-500 mt-0.5">
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

        <div className="flex items-center gap-3">
          <div ref={searchWrapRef} className="relative hidden lg:block">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              className="w-48 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:w-64 focus:border-[#003580] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#003580] transition-all placeholder:text-slate-400"
              placeholder="Search..."
              type="text"
            />
            {isSearchOpen && filteredSearch.length > 0 && (
              <div className="absolute right-0 top-11 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                {filteredSearch.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSearchSelect(item)}
                    className="flex w-full items-center border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 transition-colors hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-700">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            aria-label="announcements"
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#003580] transition-colors"
            onClick={() => setIsAnnouncementOpen(true)}
            title="Announcements"
          >
            <Bell className="h-5 w-5" />
          </button>

          <Link
            to="/register"
            className="hidden sm:inline-flex rounded-lg bg-[#003580] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#004499]"
          >
            Join Network
          </Link>

          <button
            aria-label="mobile navigation"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
          >
            {isMobileNavOpen ? (
              <HiXMark className="h-6 w-6" />
            ) : (
              <HiBars3 className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {isMobileNavOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
          {/* Mobile Quick Action Headers */}
          <div className="mb-4 pb-4 border-b border-slate-200">
            {!user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-[#003580] text-center hover:bg-slate-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="rounded-lg bg-[#003580] px-4 py-2.5 text-sm font-medium text-white text-center hover:bg-[#004499] transition-colors"
                >
                  Join Network
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Logged in</span>
                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    handleLogout();
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <div className="relative flex-1">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-base focus:outline-none focus:border-[#003580] focus:ring-1 focus:ring-[#003580] transition-all placeholder:text-slate-400"
                placeholder="Search..."
                type="text"
              />
            </div>
            {filteredSearch.length > 0 && (
              <div className="mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto">
                {filteredSearch.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSearchSelect(item)}
                    className="flex w-full items-center border-b border-slate-100 px-4 py-3 text-left text-sm last:border-b-0 transition-colors hover:bg-slate-50"
                  >
                    <span className="font-medium text-slate-700">
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
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <Icon className="h-5 w-5 text-slate-400" />
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
                    onClick={() =>
                      setOpenMega(isOpen ? null : menu.label)
                    }
                    className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-slate-400" />
                      {menu.label}
                    </span>
                    <HiChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform ${
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
                          className="flex w-full items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors text-left"
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
