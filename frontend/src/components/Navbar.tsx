import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  HiHome,
  HiMagnifyingGlass,
  HiXMark,
  HiBars3,
} from "react-icons/hi2";
import {
  MdCampaign,
  MdDashboardCustomize,
  MdLibraryBooks,
  MdArrowDropDown,
} from "react-icons/md";
import { FaInfoCircle, FaUsers } from "react-icons/fa";
import { Bell, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";
import authService from "../features/auth/services/auth.service";
import AnnouncementPanel from "./AnnouncementPanel";
import astuLogo from "../assets/logos/astu-icon.jpeg";

const searchItems = [
  { label: "Home", type: "route", route: "/" },
  { label: "Announcements", type: "route", route: "/info/announcements" },
  { label: "About & Impact", type: "route", route: "/info/about" },
  { label: "Portal Services", type: "route", route: "/info/services" },
  { label: "Community & Events", type: "route", route: "/info/events" },
  { label: "Media & Research", type: "route", route: "/info/media" },
  { label: "ASTU-AMS Overview", type: "route", route: "/info/overview" },
  { label: "Impact Numbers", type: "route", route: "/info/impact-numbers" },
  { label: "Accreditation", type: "route", route: "/info/accreditation" },
  { label: "Achievements", type: "route", route: "/info/achievements" },
  { label: "Community Feed", type: "route", route: "/info/community-feed" },
  { label: "Featured Employers", type: "route", route: "/info/featured-employers" },
  { label: "Mentorship", type: "route", route: "/info/mentorship" },
  { label: "Career Fair", type: "route", route: "/info/career-fair" },
  { label: "Photo Gallery", type: "route", route: "/info/gallery" },
  { label: "Video Gallery", type: "route", route: "/info/video-gallery" },
  { label: "Research", type: "route", route: "/info/research" },
  { label: "Innovation", type: "route", route: "/info/innovation" },
  { label: "FAQ", type: "route", route: "/info/faq" },
  { label: "Contact", type: "route", route: "/info/contact" },
  { label: "Alumni Portal", type: "route", route: "/info/alumni-portal" },
  { label: "Employer Portal", type: "route", route: "/info/employer-portal" },
  { label: "Registrar Portal", type: "route", route: "/info/registrar-portal" },
  { label: "Department Portal", type: "route", route: "/info/department-portal" },
  { label: "Admin Portal", type: "route", route: "/admin/dashboard" },
];

const navItems = [
  { label: "Home", icon: HiHome, route: "/", hasMegaMenu: false },
  { label: "About", icon: FaInfoCircle, route: "/info/about", hasMegaMenu: true, megaMenuKey: "about" },
  { label: "Services", icon: MdDashboardCustomize, route: "/info/services", hasMegaMenu: true, megaMenuKey: "services" },
  { label: "Community", icon: FaUsers, route: "/info/events", hasMegaMenu: true, megaMenuKey: "community" },
  { label: "Media", icon: MdLibraryBooks, route: "/info/media", hasMegaMenu: true, megaMenuKey: "media" },
];

const megaMenus: Record<string, { title: string; items: { label: string; icon: any; route: string; desc: string }[] }> = {
  about: {
    title: "About & Impact",
    items: [
      { label: "ASTU-AMS Overview", icon: HiHome, route: "/info/overview", desc: "System overview and mission" },
      { label: "Impact Numbers", icon: MdDashboardCustomize, route: "/info/impact-numbers", desc: "Key statistics and outcomes" },
      { label: "Accreditation", icon: MdLibraryBooks, route: "/info/accreditation", desc: "Quality assurance and accreditation" },
      { label: "University Achievements", icon: MdCampaign, route: "/info/achievements", desc: "Awards and recognitions" },
      { label: "FAQ", icon: FaInfoCircle, route: "/info/faq", desc: "Frequently asked questions" },
      { label: "Contact", icon: FaUsers, route: "/info/contact", desc: "Reach ASTU alumni relations" },
    ],
  },
  services: {
    title: "Portal Services",
    items: [
      { label: "Alumni Portal", icon: GraduationCap, route: "/info/alumni-portal", desc: "Career tracking and networking" },
      { label: "Employer Portal", icon: MdDashboardCustomize, route: "/info/employer-portal", desc: "Talent recruitment and hiring" },
      { label: "Registrar Portal", icon: MdLibraryBooks, route: "/info/registrar-portal", desc: "Document and record management" },
      { label: "Department Portal", icon: MdCampaign, route: "/info/department-portal", desc: "Analytics and program insights" },
      { label: "Featured Employers", icon: MdCampaign, route: "/info/featured-employers", desc: "Partner companies and openings" },
    ],
  },
  community: {
    title: "Community & Events",
    items: [
      { label: "Community Feed", icon: FaUsers, route: "/info/community-feed", desc: "Alumni discussions and updates" },
      { label: "Events Calendar", icon: MdCampaign, route: "/info/events", desc: "Workshops, reunions, and conferences" },
      { label: "Mentorship Program", icon: GraduationCap, route: "/info/mentorship", desc: "Connect with experienced alumni" },
      { label: "Career Fair", icon: MdDashboardCustomize, route: "/info/career-fair", desc: "Job opportunities and networking" },
    ],
  },
  media: {
    title: "Media & Research",
    items: [
      { label: "Photo Gallery", icon: MdLibraryBooks, route: "/info/gallery", desc: "Campus life and events" },
      { label: "Video Gallery", icon: MdCampaign, route: "/info/video-gallery", desc: "Research presentations and highlights" },
      { label: "Research Publications", icon: MdLibraryBooks, route: "/info/research", desc: "Academic research outputs" },
      { label: "Innovation Hub", icon: MdDashboardCustomize, route: "/info/innovation", desc: "Student and faculty innovations" },
    ],
  },
};

interface NavbarProps {
  activeSection?: string;
}

export default function Navbar({ activeSection = "home" }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

  useEffect(() => {
    const checkUserSession = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
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
      .filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 6);
  }, [searchQuery]);

  const handleSearchSelect = (item: any) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    if (item.type === "route") {
      navigate(item.route);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredSearch.length > 0) {
      handleSearchSelect(filteredSearch[0]);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    toast.success("Successfully signed out!");
    navigate("/");
  };

  const isActive = (route: string) =>
    route === "/" ? location.pathname === "/" : location.pathname.startsWith(route);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="hidden bg-astu-navy text-white md:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-1">
          <div className="flex items-center gap-4 text-[13px] text-white/80">
            <a href="mailto:alumni.office@astu.edu.et" className="hover:text-white transition-colors font-medium">alumni.office@astu.edu.et</a>
            <span className="text-white/20">|</span>
            <span className="font-medium">+251-221-110000</span>
          </div>
          <div className="flex items-center gap-3 text-[13px]">
            <Link to="/login" className="text-white/80 hover:text-white transition-colors font-medium">Login</Link>
            <span className="text-white/20">|</span>
            <Link to="/register" className="text-white/80 hover:text-white transition-colors font-medium">Register</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-3 py-3 group">
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-outline-variant bg-white p-0.5 shadow-sm overflow-hidden">
              <img
                src={astuLogo}
                alt="ASTU"
                className="h-9 w-9 rounded-md object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-astu-navy leading-tight">ASTU-AMS</p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-astu-green font-semibold">Alumni Management System</p>
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.route);
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => {
                  if (item.hasMegaMenu) setActiveMegaMenu(item.megaMenuKey);
                }}
                onMouseLeave={() => {
                  if (item.hasMegaMenu) setActiveMegaMenu(null);
                }}
              >
                <Link
                  to={item.route}
                  className={`relative flex items-center gap-1.5 px-4 py-4 text-[15px] font-bold tracking-wide transition-colors duration-200 ${
                    active
                      ? "text-astu-navy"
                      : "text-on-surface-variant hover:text-astu-navy"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.hasMegaMenu && (
                    <MdArrowDropDown
                      className={`h-5 w-5 transition-transform duration-200 ${
                        activeMegaMenu === item.megaMenuKey ? "rotate-180" : ""
                      }`}
                    />
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-astu-navy rounded-full" />
                  )}
                </Link>
                {item.hasMegaMenu && activeMegaMenu === item.megaMenuKey && megaMenus[item.megaMenuKey] && (
                  <div
                    className="absolute left-0 top-full z-50 mt-0 w-[320px] rounded-b-xl border border-t-0 border-outline-variant bg-white p-5 shadow-xl animate-[mega-menu-fade-in_150ms_ease-out_both]"
                    onMouseEnter={() => setActiveMegaMenu(item.megaMenuKey)}
                    onMouseLeave={() => setActiveMegaMenu(null)}
                  >
                    <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/50">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-astu-navy/10">
                        <Icon className="h-3.5 w-3.5 text-astu-navy" />
                      </div>
                      <p className="text-[13px] font-bold uppercase tracking-wider text-astu-navy">
                        {megaMenus[item.megaMenuKey].title}
                      </p>
                    </div>
                    <div className="mt-2 space-y-0.5">
                      {megaMenus[item.megaMenuKey].items.map((menuItem) => {
                        const MenuIcon = menuItem.icon;
                        return (
                          <Link
                            key={menuItem.label}
                            to={menuItem.route}
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-astu-navy/5 transition-colors group"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-astu-navy/5 text-astu-navy group-hover:bg-astu-navy/10 transition-colors">
                              <MenuIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-astu-navy text-sm">{menuItem.label}</p>
                              <p className="text-xs text-on-surface-variant mt-0.5 truncate">{menuItem.desc}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
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
              className="w-48 rounded-full border border-outline-variant bg-surface-container-low py-2.5 pl-8 pr-3 text-sm focus:w-60 focus:border-astu-navy focus:outline-none focus:ring-2 focus:ring-astu-navy/20 transition-all placeholder:text-on-surface-variant/60"
              placeholder="Search..."
              type="text"
            />
            {isSearchOpen && filteredSearch.length > 0 && (
              <div className="absolute right-0 top-11 w-72 overflow-hidden rounded-xl border border-outline-variant bg-white shadow-xl animate-[mega-menu-fade-in_150ms_ease-out_both]">
                {filteredSearch.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSearchSelect(item)}
                    className="flex w-full items-center border-b border-outline-variant/50 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-astu-navy/5 transition-colors"
                  >
                    <span className="font-semibold text-on-surface">{item.label}</span>
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

          <Link
            to="/register"
            className="hidden sm:inline-flex rounded-lg bg-astu-navy px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:bg-astu-navy/90 hover:shadow-lg"
          >
            Join Network
          </Link>

          <button
            aria-label="mobile navigation"
            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low lg:hidden"
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
          >
            {isMobileNavOpen ? <HiXMark className="h-6 w-6" /> : <HiBars3 className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileNavOpen && (
        <div className="border-t border-outline-variant bg-white px-4 py-4 lg:hidden shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full rounded-full border border-outline-variant bg-surface-container-low py-2.5 pl-10 pr-3 text-base focus:outline-none"
                placeholder="Search..."
                type="text"
              />
            </div>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.route}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold transition-all ${
                    location.pathname === item.route
                      ? "bg-astu-navy text-white"
                      : "hover:bg-astu-navy/5 text-on-surface"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant/60">
            {!user ? (
              <div className="grid gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="rounded-lg border border-outline-variant px-3 py-3 text-base font-bold text-astu-navy text-center hover:bg-astu-navy/5"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="rounded-lg bg-astu-navy px-3 py-3 text-base font-bold text-white text-center"
                >
                  Join Alumni Network
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  handleLogout();
                }}
                className="w-full rounded-lg border border-astu-red px-3 py-3 text-base font-bold text-astu-red hover:bg-astu-red/5"
              >
                Sign Out
              </button>
            )}
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