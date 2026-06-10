import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="max-w-md rounded-2xl border border-outline-variant bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-astu-red">404</p>
        <h1 className="mt-2 text-3xl font-bold text-astu-navy">Page Not Found</h1>
        <p className="mt-3 text-sm text-on-surface-variant">
          The page you requested does not exist in this ASTU-AMS build.
        </p>
        <button
          className="mt-6 rounded-md bg-astu-navy px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
          onClick={() => navigate("/")}
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}
