import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Home, SearchX, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="app-shell min-h-screen bg-slate-50 dark:bg-[var(--bg-page)] text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col">
      <Navbar />
      <div className="relative flex-1 flex items-center justify-center p-6 py-20 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,53,128,0.08),_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.08),_transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative max-w-lg w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 text-center shadow-xl shadow-slate-200/60 dark:shadow-slate-950/40">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-astu-navy to-blue-700 text-white shadow-lg shadow-blue-900/20">
            <SearchX className="h-8 w-8" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-astu-red dark:text-rose-400">
            Error 404
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-astu-navy dark:text-white">
            Page Not Found
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            The page you requested is unavailable or may have been moved. Continue through the ASTU
            alumni network from one of the destinations below.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-astu-navy px-5 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astu-navy/40 focus-visible:ring-offset-2"
              onClick={() => navigate("/")}
            >
              <Home className="h-4 w-4" aria-hidden="true" /> Go to Homepage
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astu-navy/30"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Go Back
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 dark:hover:bg-slate-800 transition-colors"
            >
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Events
            </button>
            <button
              type="button"
              onClick={() => navigate("/community")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 dark:hover:bg-slate-800 transition-colors"
            >
              <Users className="h-3.5 w-3.5" aria-hidden="true" /> Community
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
