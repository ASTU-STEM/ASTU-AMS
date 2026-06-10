import React from 'react';
import { CartesianGrid, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const fallbackData = [
  { label: 'Cloud', value: 88 },
  { label: 'Testing', value: 72 },
  { label: 'Data', value: 61 },
  { label: 'UI/UX', value: 44 },
];

export default function SkillGapChart({
  data = fallbackData,
}: {
  data?: Array<{ label: string; value: number }>;
}) {
  return (
    <div className="rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h3 className="text-sm font-semibold text-slate-900">Skill Gap Analysis</h3>
      <p className="mt-1 text-xs text-slate-500">Employer-flagged skills needing curriculum attention</p>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF5" />
            <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #E8EDF5',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}
            />
            <Bar dataKey="value" fill="#E24B4A" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
