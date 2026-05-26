import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "#home" },
  { label: "Alumni", href: "#alumni" },
  { label: "Jobs", href: "#jobs" },
  { label: "Events", href: "#events" },
  { label: "News", href: "#news" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <a href="#home" className="flex items-center gap-2">
          <div className="rounded-full bg-astu-navy p-2 text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-astu-navy">ASTU AMS</span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((item) => (
            <a key={item.label} href={item.href} className="text-sm font-semibold text-on-surface-variant hover:text-astu-navy">
              {item.label}
            </a>
          ))}
          <Link to="/login" className="text-sm font-semibold text-astu-navy">Login</Link>
          <Link to="/register" className="rounded-md bg-astu-navy px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
            Register
          </Link>
        </nav>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-outline-variant bg-white p-4 md:hidden">
          <div className="space-y-2">
            {links.map((item) => (
              <a key={item.label} href={item.href} className="block rounded-md border border-outline-variant px-3 py-2 text-sm font-semibold" onClick={() => setOpen(false)}>
                {item.label}
              </a>
            ))}
            <Link to="/login" className="block rounded-md border border-outline-variant px-3 py-2 text-sm font-semibold" onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link to="/register" className="block rounded-md bg-astu-navy px-3 py-2 text-sm font-semibold text-white" onClick={() => setOpen(false)}>
              Register
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
