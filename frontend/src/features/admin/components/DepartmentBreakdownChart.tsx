import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const fallbackData = [
  { name: 'Engineering', value: 42 },
  { name: 'Computing', value: 26 },
  { name: 'Business', value: 18 },
  { name: 'Science', value: 14 },
];

const colors = ['#003580', '#1D9E75', '#E8A020', '#E24B4A'];

export default function DepartmentBreakdownChart({
  data = fallbackData,
}: {
  data?: Array<{ name: string; value: number }>;
}) {
  return (
    <div className="rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-card)] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Department Breakdown</h3>
      <p className="mt-1 text-xs text-[var(--text-muted)]">Distribution of alumni across primary departments</p>
      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #E8EDF5',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              }}
            />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
