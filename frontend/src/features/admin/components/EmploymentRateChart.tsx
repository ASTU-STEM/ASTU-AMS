import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const fallbackData = [
  { label: 'Jan', value: 72 },
  { label: 'Feb', value: 74 },
  { label: 'Mar', value: 77 },
  { label: 'Apr', value: 80 },
  { label: 'May', value: 83 },
  { label: 'Jun', value: 86 },
];

export default function EmploymentRateChart({
  data = fallbackData,
}: {
  data?: Array<{ label: string; value: number }>;
}) {
  return (
    <div className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Employment Rate</h3>
      <p className="mt-1 text-xs text-[var(--text-muted)]">Tracked alumni employment growth over time</p>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="employment-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#003580" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#003580" stopOpacity={0.02} />
              </linearGradient>
            </defs>
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
            <Area type="monotone" dataKey="value" stroke="#003580" strokeWidth={2} fill="url(#employment-fill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
