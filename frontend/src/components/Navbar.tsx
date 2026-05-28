import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  GraduationCap,
  Menu,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import authService from "../features/auth/services/auth.service";

const searchItems = [
  { label: "Home Section", type: "section", id: "home" },
  { label: "Stakeholder Portals", type: "section", id: "stakeholders" },
  { label: "Impact & Accreditation", type: "section", id: "impact" },
  { label: "Campus Gallery", type: "section", id: "gallery" },
  { label: "Community Feed", type: "section", id: "community" },
  { label: "Upcoming Events", type: "section", id: "events" },
  { label: "Open Alumni Portal", type: "route", route: "/alumni/dashboard" },
  { label: "Open Employer Portal", type: "route", route: "/employer/dashboard" },
  { label: "Open Registrar Portal", type: "route", route: "/registrar/dashboard" },
  { label: "Open Department Portal", type: "route", route: "/department/dashboard" },
  { label: "Open Admin Portal", type: "route", route: "/admin/dashboard" },
];

const navSections = [
  { label: "Home", id: "home" },
  { label: "Stakeholders", id: "stakeholders" },
  { label: "Impact", id: "impact" },
  { label: "Gallery", id: "gallery" },
  { label: "Community", id: "community" },
  { label: "Events", id: "events" },
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
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-4 md:px-8">
        {/* Brand Identity logo */}
        <Link to="/" className="flex min-w-fit items-center gap-3">
          <div className="rounded-full border border-outline-variant bg-white p-1">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6deuYLZHNJiVCdbEUR2-fizVXzbqqy4MUBUQxxpgQcUdXNPyUaH_PmuawCgALD_doph1Fn2l0Qm3sEDaMoPuc2lMztO55CYrFDQZJjGQzLnLeSbraPgATab7DFeDHzQBXZ701F8IpJHwziWElvPY8ZCQ3zP6XJTuIzhgJQf-M-iSJw2mdrDUtfp4ha63XRYBjxmAonsb8n_vVPC8oR_VPGkiQfTNFY90SVNbxfDuq0vglrtVAwyP7P6GW9uQKJ7XaUGNCpUhOEFwH"
              alt="ASTU logo"
              className="h-9 w-9 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/astu-logo.jpeg";
              }}
            />
          </div>
          <div>
            <p className="text-base font-bold leading-none text-astu-navy md:text-lg">ASTU-AMS</p>
            <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">Alumni Ecosystem</p>
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
                  className="flex w-full items-center justify-between border-b border-outline-variant px-3 py-2 text-left text-sm last:border-b-0 hover:bg-surface-container-low"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-on-surface-variant" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Desktop Navigation Section Links with Sized Font */}
        <nav className="hidden items-center gap-7 xl:flex">
          {navSections.map((item) => (
            <button
              key={item.id}
              className={`text-sm md:text-[15px] font-bold tracking-wide transition-all duration-200 ${activeSection === item.id
                  ? "text-astu-navy scale-105"
                  : "text-on-surface-variant hover:text-astu-navy hover:scale-105"
                }`}
              onClick={() => goToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

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
                className="rounded-md border border-outline-variant px-5 py-2 text-sm md:text-[15px] font-bold text-astu-navy hover:bg-surface-container-low hover:text-astu-red transition-all duration-200"
              >
                Employers
              </Link>
              <Link
                to="/login"
                className="rounded-md border border-outline-variant px-5 py-2 text-sm md:text-[15px] font-bold text-astu-navy hover:bg-surface-container-low hover:text-astu-red transition-all duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-astu-navy px-5 py-2 text-sm md:text-[15px] font-bold text-white hover:brightness-110 hover:shadow-md transition-all duration-200"
              >
                Join Alumni Network
              </Link>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 rounded-full border border-outline-variant p-1 pr-3 hover:bg-surface-container-low transition-all duration-200"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-astu-navy text-xs font-bold text-white uppercase shadow-inner">
                  {user.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'U'}
                </div>
                <span className="hidden text-xs font-bold text-on-surface-variant md:block max-w-[100px] truncate">
                  {user.fullName ? user.fullName.split(' ')[0] : 'User'}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-outline-variant bg-white p-4 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="border-b border-outline-variant/60 pb-3">
                    <p className="text-sm font-bold text-astu-navy leading-none truncate">{user.fullName}</p>
                    <p className="mt-1 text-xs text-on-surface-variant/80 leading-none truncate">{user.email}</p>
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
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low hover:text-astu-navy transition-colors"
                    >
                      <GraduationCap className="h-4 w-4" />
                      My Portal Dashboard
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-astu-red hover:bg-astu-red/5 transition-colors"
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

      {/* Mobile drawer panel */}
      {isMobileNavOpen ? (
        <div className="border-t border-outline-variant bg-white px-4 py-4 xl:hidden">
          <div className="space-y-2">
            {navSections.map((item) => (
              <button
                key={item.id}
                onClick={() => goToSection(item.id)}
                className="block w-full rounded-md border border-outline-variant px-3 py-2 text-left text-sm font-semibold text-astu-navy"
              >
                {item.label}
              </button>
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
