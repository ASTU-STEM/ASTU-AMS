import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, SearchX } from "lucide-react";
import Navbar from "../components/Navbar";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="app-shell min-h-screen bg-surface dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <div className="flex items-center justify-center p-6 py-24">
        <div className="max-w-md rounded-2xl border border-outline-variant dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm dark:shadow-2xl transition-colors">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-astu-navy/10 dark:bg-blue-900/30 text-astu-navy dark:text-blue-300">
            <SearchX className="h-7 w-7" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-astu-red dark:text-red-400">404</p>
          <h1 className="mt-2 text-3xl font-bold text-astu-navy dark:text-white">Page Not Found</h1>
          <p className="mt-3 text-sm text-on-surface-variant dark:text-slate-400">
            The page you requested is unavailable or may have been moved. Return to the homepage to continue browsing ASTU-AMS.
          </p>
          <button
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-astu-navy px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4" /> Go to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
