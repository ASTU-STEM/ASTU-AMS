import React from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-astu-navy">Register</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Screen 7 will be fully implemented next.</p>
        <input className="mt-4 w-full rounded-md border border-outline-variant px-3 py-2" placeholder="Full Name" />
        <input className="mt-3 w-full rounded-md border border-outline-variant px-3 py-2" placeholder="Email" />
        <button onClick={() => navigate("/alumni/dashboard")} className="mt-4 w-full rounded-md bg-astu-navy py-2 font-semibold text-white">Create Account</button>
      </div>
    </div>
  );
}
