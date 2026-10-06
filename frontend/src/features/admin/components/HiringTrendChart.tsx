import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const fallbackData = [
  { label: 'Jan', value: 14 },
  { label: 'Feb', value: 18 },
  { label: 'Mar', value: 22 },
  { label: 'Apr', value: 24 },
  { label: 'May', value: 29 },
  { label: 'Jun', value: 33 },
];

export default function HiringTrendChart({
  data = fallbackData,
}: {
  data?: Array<{ label: string; value: number }>;
}) {
  return (
    <div className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Hiring Trend</h3>
      <p className="mt-1 text-xs text-[var(--text-muted)]">New positions posted by partner employers</p>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #E8EDF5',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}
            />
            <Line type="monotone" dataKey="value" stroke="#1D9E75" strokeWidth={3} dot={{ r: 3, fill: '#1D9E75' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
