import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  FileText,
  GalleryHorizontal,
  GraduationCap,
  Lightbulb,
  Menu,
  PlayCircle,
  Search,
  Star,
  Trophy,
  UsersRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import authService from "../features/auth/services/auth.service";

const searchItems = [
  { label: "Home", type: "route", route: "/" },
  { label: "Announcements", type: "route", route: "/info/announcements" },
  { label: "Quick Links", type: "route", route: "/info/quick-links" },
  { label: "About & Impact", type: "route", route: "/info/about" },
  { label: "Platform Services", type: "route", route: "/info/services" },
  { label: "Community & Events", type: "route", route: "/info/events" },
  { label: "Media & Research", type: "route", route: "/info/media" },
  { label: "FAQ", type: "route", route: "/info/faq" },
  { label: "Alumni Portal", type: "route", route: "/alumni/dashboard" },
  { label: "Employer Portal", type: "route", route: "/employer/dashboard" },
  { label: "Registrar Portal", type: "route", route: "/registrar/dashboard" },
  { label: "Department Portal", type: "route", route: "/department/dashboard" },
  { label: "Admin Portal", type: "route", route: "/admin/dashboard" },
];

const navSections = [
  { label: "Home", route: "/" },
  { label: "Announcements", route: "/info/announcements" },
];

const megaMenuCategories = [
  {
    title: "About & Impact",
    items: [
      { label: "ASTU-AMS Overview", route: "/info/about", icon: BookOpen },
      { label: "Impact Numbers", route: "/info/about", icon: UsersRound },
      { label: "Impact & Accreditation", route: "/info/about", icon: Building2 },
      { label: "University Achievements", route: "/info/about", icon: Trophy },
    ],
  },
  {
    title: "Portal Services",
    items: [
      { label: "Alumni", route: "/alumni/dashboard", icon: GraduationCap },
      { label: "Employer", route: "/employer/dashboard", icon: Building2 },
      { label: "Registrar", route: "/registrar/dashboard", icon: FileText },
      { label: "Department", route: "/department/dashboard", icon: Trophy },
    ],
  },
  {
    title: "Community & Events",
    items: [
      { label: "Community Feed", route: "/info/events", icon: Star },
      { label: "Announcements", route: "/info/announcements", icon: Bell },
      { label: "Upcoming Events", route: "/info/events", icon: CalendarDays },
      { label: "Upcoming Workshops", route: "/info/events", icon: CalendarDays },
      { label: "Partner Companies", route: "/info/events", icon: UsersRound },
    ],
  },
  {
    title: "Media & Research",
    items: [
      { label: "Photo Gallery", route: "/info/media", icon: GalleryHorizontal },
      { label: "Video Gallery", route: "/info/media", icon: PlayCircle },
      { label: "Campus Life", route: "/info/media", icon: BookOpen },
      { label: "Campuses", route: "/info/media", icon: Building2 },
      { label: "Research & Innovation", route: "/info/media", icon: Lightbulb },
      { label: "Testimonials", route: "/info/media", icon: Star },
      { label: "Career Opportunities", route: "/info/events", icon: Briefcase },
      { label: "FAQ", route: "/info/faq", icon: CircleHelp },
    ],
  },
];

const utilityLinks = [
  { label: "FAQ", route: "/info/faq" },
  { label: "Contact", route: "/info/contact" },
];

interface NavbarProps {
  activeSection?: string;
}

export default function Navbar({ activeSection = "home" }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [openNavGroup, setOpenNavGroup] = useState<string | null>(null);

  const getDashboardRoute = (role: string) => {
    switch (role) {
      case 'ALUMNI': return '/alumni/dashboard';
      case 'EMPLOYER': return '/employer/dashboard';
      case 'REGISTRAR': return '/registrar/dashboard';
      case 'DEPARTMENT_HEAD': return '/department/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ALUMNI': return 'Verified Alumni';
      case 'EMPLOYER': return 'Employer Partner';
      case 'REGISTRAR': return 'Registrar Officer';
      case 'DEPARTMENT_HEAD': return 'Department Head';
      case 'ADMIN': return 'System Admin';
      default: return 'User';
    }
  };

  // Sync user session
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

  // Dropdown click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Search outside listener
  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("click", closeOnOutside);
    return () => window.removeEventListener("click", closeOnOutside);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setIsDropdownOpen(false);
    toast.success("Successfully signed out!");
    navigate("/");
  };

  const filteredSearch = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    return searchItems
      .filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 6);
  }, [searchQuery]);

  const goToSection = (id: string) => {
    setIsMobileNavOpen(false);
    setIsMegaMenuOpen(false);
    setOpenNavGroup(null);

    if (location.pathname !== "/") {
      // Navigate to homepage with section hash
      navigate(`/#${id}`);
      // Wait for navigation and then scroll
      setTimeout(() => {
        const node = document.getElementById(id);
        if (node) {
          node.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return;
    }

    const node = document.getElementById(id);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSearchSelect = (item: any) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    if (item.type === "section") {
      goToSection(item.id);
      return;
    }

    if (item.type === "route") {
      if (item.route === "/" || item.route?.startsWith("/info") || item.route === "/employers") {
        navigate(item.route);
        return;
      }
      if (localStorage.getItem("user")) {
        navigate(item.route);
      } else {
        toast("Please log in to access this portal.", { icon: "🔒" });
        navigate("/login");
      }
    }
  };

  const handleGroupedNavSelect = (item: { id?: string; route?: string }) => {
    setOpenNavGroup(null);
    setIsMobileNavOpen(false);
    if (item.id) {
      goToSection(item.id);
      return;
    }

    if (item.route) {
      if (item.route.startsWith("/info") || item.route === "/" || item.route === "/employers") {
        navigate(item.route);
        return;
      }
      if (localStorage.getItem("user")) {
        navigate(item.route);
      } else {
        toast("Please log in to access this portal.", { icon: "🔒" });
        navigate("/login");
      }
    }
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && filteredSearch.length > 0) {
      handleSearchSelect(filteredSearch[0]);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-white/95 backdrop-blur-md">
      <div className="bg-astu-navy text-white">
        <div className="mx-auto flex min-h-9 max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 text-[11px] font-semibold md:px-8">
          <div className="flex flex-wrap items-center gap-3 text-white/80">
            <span>Adama Science and Technology University</span>
            <span className="hidden h-3 w-px bg-white/25 sm:inline-block" />
            <span className="hidden sm:inline">Alumni, Tracer Studies & Employer Partnership Platform</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/info/announcements")}
              className="inline-flex items-center gap-1.5 text-white transition-colors hover:text-white/85"
            >
              <img src="/images/announcementIcon.svg" alt="announcement" loading="lazy" width="100" height="100" className="h-5 w-5" />
              Notice
            </button>
            {utilityLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => {
                  if (link.route) navigate(link.route);
                }}
                className="text-white/80 transition-colors hover:text-white"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-20 max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        {/* Brand Identity logo */}
        <Link to="/" className="flex min-w-fit items-center gap-3">
          <div className="rounded-md border border-outline-variant bg-white p-1 shadow-sm">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH"
              alt="ASTU logo"
              className="h-11 w-11 rounded-md object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/astu-logo.jpeg";
              }}
            />
          </div>
          <div>
            <p className="text-lg font-black leading-none text-astu-navy md:text-xl">ASTU-AMS</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Alumni Management System</p>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div ref={searchWrapRef} className="relative hidden flex-1 max-w-xl md:block">
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
            placeholder="Search sections or portals..."
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

        {/* Action Buttons & Dropdown */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            aria-label="notifications"
            className="rounded-full p-2.5 hover:bg-surface-container-low"
            onClick={() => {
              if (user) {
                navigate(getDashboardRoute(user.role));
              } else {
                toast("Please log in to check notifications.", { icon: "🔒" });
                navigate("/login");
              }
            }}
          >
            <Bell className="h-5 w-5" />
          </button>

          <button
            aria-label="mobile navigation"
            className="rounded-full p-2.5 hover:bg-surface-container-low xl:hidden"
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
          >
            {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {!user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                to="/employers"
                className="rounded-md border border-outline-variant px-4 py-2 text-sm font-bold text-astu-navy transition-all duration-200 hover:bg-surface-container-low hover:text-astu-red"
              >
                Employers
              </Link>
              <Link
                to="/login"
                className="rounded-md border border-outline-variant px-4 py-2 text-sm font-bold text-astu-navy transition-all duration-200 hover:bg-surface-container-low hover:text-astu-red"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-astu-navy px-4 py-2 text-sm font-bold text-white transition-all duration-200 hover:brightness-110 hover:shadow-md"
              >
                Join Alumni Network
              </Link>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 rounded-full border border-outline-variant p-1 pr-3 transition-all duration-200 hover:bg-surface-container-low"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-astu-navy text-xs font-bold uppercase text-white shadow-inner">
                  {user.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'U'}
                </div>
                <span className="hidden max-w-[100px] truncate text-xs font-bold text-on-surface-variant md:block">
                  {user.fullName ? user.fullName.split(' ')[0] : 'User'}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl border border-outline-variant bg-white p-4 shadow-xl ring-1 ring-black ring-opacity-5 animate-[mega-menu-fade-in_200ms_ease-out_both] focus:outline-none">
                  <div className="border-b border-outline-variant/60 pb-3">
                    <p className="truncate text-sm font-bold leading-none text-astu-navy">{user.fullName}</p>
                    <p className="mt-1 truncate text-xs leading-none text-on-surface-variant/80">{user.email}</p>
                    <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${user.role === 'ALUMNI' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        user.role === 'EMPLOYER' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          user.role === 'REGISTRAR' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            user.role === 'DEPARTMENT_HEAD' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                              'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate(getDashboardRoute(user.role));
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-astu-navy"
                    >
                      <GraduationCap className="h-4 w-4" />
                      My Portal Dashboard
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-astu-red transition-colors hover:bg-astu-red/5"
                    >
                      <X className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="hidden border-t border-outline-variant bg-white xl:block">
        <nav className="mx-auto flex h-12 max-w-[1440px] items-center justify-between px-8">
          <div className="flex h-full items-center gap-1">
{navSections.map((item) => (
               <button
                 key={item.route}
                 className={`flex h-full items-center px-3 text-sm font-bold tracking-wide transition-all duration-200 border-b-2 ${activeSection === item.route
                     ? "text-astu-navy border-astu-red scale-105"
                     : "text-on-surface-variant border-transparent hover:text-astu-navy hover:border-astu-navy/50"
                   }`}
                 onClick={() => navigate(item.route)}
               >
              {item.label}
              </button>
            ))}
            {megaMenuCategories.map((group) => (
              <div key={group.title} className="relative h-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsMegaMenuOpen(false);
                    setOpenNavGroup((current) => current === group.title ? null : group.title);
                  }}
                  className={`flex h-full items-center gap-1 border-b-2 px-3 text-sm font-bold tracking-wide transition-all ${
                    openNavGroup === group.title
                      ? "border-astu-red text-astu-navy"
                      : "border-transparent text-on-surface-variant hover:border-astu-navy/50 hover:text-astu-navy"
                  }`}
                >
                  {group.title}
                  <ChevronDown className={`h-4 w-4 transition-transform ${openNavGroup === group.title ? "rotate-180" : ""}`} />
                </button>
                {openNavGroup === group.title && (
                  <div className="absolute left-0 top-12 z-50 w-72 rounded-b-xl border border-t-0 border-outline-variant bg-white p-3 shadow-xl animate-[mega-menu-fade-in_200ms_ease-out_both]">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => handleGroupedNavSelect(item)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-astu-navy transition-colors hover:bg-surface-container-low"
                        >
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-astu-navy/10 text-astu-navy">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => navigate(user ? getDashboardRoute(user.role) : "/login")}
            className="rounded-md bg-astu-red px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition-all hover:brightness-110"
          >
            Portal Access
          </button>
        </nav>
      </div>

      {/* Mobile drawer panel */}
      {isMobileNavOpen ? (
        <div className="border-t border-outline-variant bg-white px-4 py-4 xl:hidden">
          <div className="space-y-2">
{navSections.map((item) => (
               <button
                 key={item.route}
                 onClick={() => navigate(item.route)}
                 className="block w-full rounded-md border border-outline-variant px-3 py-2 text-left text-sm font-semibold text-astu-navy"
               >
                {item.label}
              </button>
            ))}
            {megaMenuCategories.map((group) => (
              <div key={`mobile-group-${group.title}`} className="rounded-md border border-outline-variant p-2">
                <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{group.title}</p>
                <div className="grid gap-1">
                  {group.items.map((item) => (
                    <button
                      key={`mobile-${group.title}-${item.label}`}
                      onClick={() => handleGroupedNavSelect(item)}
                      className="block w-full rounded-md px-2 py-2 text-left text-sm font-semibold text-astu-navy hover:bg-surface-container-low"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant/60">
            {!user ? (
              <div className="grid gap-2">
                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    navigate("/employers");
                  }}
                  className="rounded-md border border-outline-variant px-3 py-2 text-sm font-semibold text-astu-navy text-center"
                >
                  Employers
                </button>
                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    navigate("/login");
                  }}
                  className="rounded-md border border-outline-variant px-3 py-2 text-sm font-semibold text-astu-navy text-center"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    navigate("/register");
                  }}
                  className="rounded-md bg-astu-navy px-3 py-2 text-sm font-semibold text-white text-center"
                >
                  Join Alumni Network
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="px-3">
                  <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-bold text-astu-navy truncate">{user.fullName}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-astu-navy/10 text-astu-navy">
                    {getRoleLabel(user.role)}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      navigate(getDashboardRoute(user.role));
                    }}
                    className="rounded-md bg-astu-navy px-3 py-2 text-sm font-semibold text-white text-center"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      handleLogout();
                    }}
                    className="rounded-md border border-astu-red px-3 py-2 text-sm font-semibold text-astu-red hover:bg-astu-red/5 text-center"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
