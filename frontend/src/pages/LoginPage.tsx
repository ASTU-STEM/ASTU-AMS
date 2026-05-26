import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <h1 className="text-2xl font-bold text-astu-navy">Login</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Screen 7 will be fully implemented next.</p>
        <input className="mt-4 w-full rounded-md border border-outline-variant px-3 py-2" placeholder="Email" />
        <input className="mt-3 w-full rounded-md border border-outline-variant px-3 py-2" placeholder="Password" type="password" />
        <button onClick={() => navigate("/alumni/dashboard")} className="mt-4 w-full rounded-md bg-astu-navy py-2 font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg">Login</button>
      </div>
    </div>
  );
}
