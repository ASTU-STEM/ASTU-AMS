import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface p-6 md:p-10">
      <div className="mx-auto max-w-5xl rounded-2xl border border-outline-variant bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-astu-red">System Admin Portal</p>
        <h1 className="mt-2 text-3xl font-bold text-astu-navy">ASTU-AMS Administration</h1>
        <p className="mt-3 max-w-3xl text-sm text-on-surface-variant">
          Manage users, role access, surveys, notifications, logs, and accreditation reporting workflows from this control center.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "User Management",
            "Role Permissions",
            "Survey Management",
            "System Analytics",
            "Notifications",
            "Audit Logs",
          ].map((item) => (
            <button
              key={item}
              className="rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-left text-sm font-semibold text-astu-navy hover:bg-surface-container"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            className="rounded-md bg-astu-navy px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            onClick={() => navigate("/")}
          >
            Back to Landing Page
          </button>
          <button
            className="rounded-md border border-outline-variant px-5 py-2.5 text-sm font-semibold hover:bg-surface-container-low"
            onClick={() => navigate("/registrar/dashboard")}
          >
            Open Registrar Portal
          </button>
        </div>
      </div>
    </div>
  );
}
