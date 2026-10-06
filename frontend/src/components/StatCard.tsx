import React from "react";

export default function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-[var(--bg-card)] p-5 text-center shadow-sm">
      <p className="text-3xl font-bold text-astu-navy">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-on-surface-variant">{label}</p>
    </div>
  );
}
