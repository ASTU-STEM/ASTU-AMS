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
import { useSystemSettings } from "../context/SystemSettingsContext";

interface MegaMenuItem {
  label: string;
  sectionId?: string;
  route?: string;
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
      { label: "About ASTU", route: "/info/overview", description: "Mission, vision & history" },
      { label: "Campuses", route: "/info/campuses", description: "Our campuses & facilities" },
      { label: "Campus Life", route: "/info/campus-life", description: "Student activities & culture" },
      { label: "Research", route: "/info/research", description: "Innovation & discoveries" },
      { label: "Success Stories", route: "/info/alumni-stories", description: "Alumni achievements" },
    ],
  },
  {
    label: "Services",
    icon: MdDashboardCustomize,
    items: [
      { label: "Stakeholders", route: "/partners", description: "Partners & collaborators" },
      { label: "Career Opportunities", route: "/employers", description: "Jobs & recruitment" },
      { label: "Testimonials", route: "/community", description: "What alumni say" },
    ],
  },
  {
    label: "Media",
    icon: MdCampaign,
    items: [
      { label: "Events", route: "/events", description: "Upcoming gatherings" },
      { label: "Workshops", route: "/workshops", description: "Skill-building sessions" },
      { label: "News", route: "/news", description: "Latest updates" },
      { label: "Announcements", route: "/announcements", description: "Official notices" },
      { label: "Gallery", route: "/gallery", description: "Photo moments" },
      { label: "Video Gallery", route: "/info/video-gallery", description: "Video highlights" },
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
  ...simpleItems.map((s) => ({ label: s.label, sectionId: s.sectionId, route: s.route })),
].map((item) => ({
  label: item.label,
  sectionId: item.sectionId,
  route: item.route,
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
    if (item.route) {
      navigate(item.route);
    } else if (item.sectionId) {
      navigateToSection(item.sectionId);
    }
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

  const navigateToSection = (sectionId?: string, fallbackRoute?: string) => {
    setIsMobileNavOpen(false);
    setOpenMega(null);
    if (!sectionId && fallbackRoute) {
      navigate(fallbackRoute);
      return;
    }
    if (sectionId) {
      if (location.pathname === "/") {
        const el = document.getElementById(sectionId);
        if (el) {
          scrollToSection(sectionId);
        } else if (fallbackRoute) {
          navigate(fallbackRoute);
        }
      } else {
        navigate(`/?scrollTo=${sectionId}`);
      }
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

  const handleMegaItemClick = (item: MegaMenuItem) => {
    setIsMobileNavOpen(false);
    setOpenMega(null);
    if (item.route) {
      navigate(item.route);
      return;
    }
    if (item.sectionId) {
      navigateToSection(item.sectionId);
    }
  };

  const handleMegaEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMega(label);
  };

  const handleMegaLeave = () => {
    closeTimer.current = setTimeout(() => setOpenMega(null), 120);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-3 py-2 group">
          <div className="flex items-center gap-2.5">
            <img
              src={settings.appearance?.logoUrl || "/images/astu-seal-logo.png"}
              alt={`${settings.general?.abbreviation || 'ASTU'} Logo`}
              className="h-10 w-10 object-contain scale-110 shrink-0"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-astu-navy leading-tight">
                {settings.general?.abbreviation || 'ASTU'}-AMS
              </p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 font-semibold">
                {settings.general?.portalTitle || 'Alumni Management System'}
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
                className="relative flex items-center gap-1.5 px-4 py-4 text-[15px] font-bold tracking-wide text-on-surface-variant hover:text-astu-navy transition-colors duration-200"
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
                  className={`relative flex items-center gap-1.5 px-4 py-4 text-[15px] font-bold tracking-wide transition-colors duration-200 ${isOpen
                    ? "text-astu-navy"
                    : "text-on-surface-variant hover:text-astu-navy"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {menu.label}
                  <HiChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isOpen && (
                  <div className="absolute left-0 top-full animate-[mega-menu-fade-in_150ms_ease-out_both]">
                    <div className="mt-1 overflow-hidden rounded-xl border border-outline-variant bg-white shadow-xl min-w-[240px]">
                      <div className="p-2">
                        {menu.items.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => handleMegaItemClick(item)}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-astu-navy/5"
                          >
                            <div>
                              <p className="text-sm font-bold text-astu-navy">
                                {item.label}
                              </p>
                              {item.description && (
                                <p className="text-xs text-on-surface-variant/70 mt-0.5">
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
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              className="w-44 rounded-full border border-outline-variant bg-surface-container-low py-2 pl-8 pr-3 text-sm focus:w-56 focus:border-astu-navy focus:bg-white focus:outline-none transition-all placeholder:text-on-surface-variant/60"
              placeholder="Search sections..."
              type="text"
            />
            {isSearchOpen && filteredSearch.length > 0 && (
              <div className="absolute right-0 top-11 w-64 overflow-hidden rounded-xl border border-outline-variant bg-white shadow-xl animate-[mega-menu-fade-in_150ms_ease-out_both]">
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

          <button
            aria-label="announcements"
            className="relative rounded-full p-2 text-on-surface-variant hover:bg-astu-navy/5 hover:text-astu-navy transition-all"
            onClick={() => setIsAnnouncementOpen(true)}
            title="Announcements"
          >
            <Bell className="h-5 w-5" />
          </button>

          {!user ? (
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center text-sm font-semibold text-[#003580] hover:text-[#C8102E] transition-colors px-2 py-1"
            >
              Login
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center text-sm font-semibold text-slate-600 hover:text-[#C8102E] transition-colors px-2 py-1 cursor-pointer"
            >
              Sign Out
            </button>
          )}

          <Link
            to="/register"
            className="hidden sm:inline-flex items-center justify-center h-11 sm:h-12 rounded-md bg-[#C8102E] hover:bg-[#A60D26] px-5 text-sm font-bold text-white transition-colors shadow-sm"
          >
            Join Network
          </Link>

          <button
            aria-label="mobile navigation"
            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low lg:hidden"
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
        <div className="border-t border-outline-variant bg-white px-4 py-4 lg:hidden shadow-lg">
          {/* Mobile Quick Action Headers */}
          <div className="mb-4 pb-4 border-b border-outline-variant/60">
            {!user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="rounded-lg border border-outline-variant px-3 py-2.5 text-sm font-bold text-astu-navy text-center hover:bg-astu-navy/5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center justify-center h-12 rounded-lg bg-[#C8102E] hover:bg-[#A60D26] px-3 text-sm font-bold text-white text-center transition-colors shadow-sm"
                >
                  Join Network
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant font-medium">Logged in</span>
                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    handleLogout();
                  }}
                  className="rounded-lg border border-astu-red px-3 py-1.5 text-xs font-bold text-astu-red hover:bg-astu-red/5"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 mb-4">
            <div className="relative flex-1">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
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
                    onClick={() =>
                      setOpenMega(isOpen ? null : menu.label)
                    }
                    className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-bold text-on-surface hover:bg-astu-navy/5 transition-all text-left"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-astu-navy/60" />
                      {menu.label}
                    </span>
                    <HiChevronDown
                      className={`h-4 w-4 text-on-surface-variant transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="ml-8 space-y-1 pb-1">
                      {menu.items.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleMegaItemClick(item)}
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
