import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

// ── Color palette ──────────────────────────────────────────────────────────────
const COLORS = {
  navy:    '#002244',
  green:   '#008080',
  red:     '#B22222',
  gold:    '#D4A017',
  sky:     '#38BDF8',
  purple:  '#8B5CF6',
};

// ── Shared tooltip style ───────────────────────────────────────────────────────
const CustomTooltipStyle = {
  contentStyle: {
    backgroundColor: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: '12px',
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: 600,
  },
  itemStyle: { color: '#94A3B8' },
  labelStyle: { color: '#CBD5E1', fontWeight: 700 },
};

// ── Prop types ─────────────────────────────────────────────────────────────────
export type ChartType = 'area' | 'bar' | 'line' | 'pie';

interface DataPoint { [key: string]: string | number }

interface AnalyticsChartProps {
  type: ChartType;
  data: DataPoint[];
  /** Key for x-axis / pie name */
  xKey?: string;
  /** Keys to plot as series */
  series: { key: string; label: string; color?: string }[];
  title?: string;
  subtitle?: string;
  height?: number;
  darkMode?: boolean;
  className?: string;
}

// ── Chart component ────────────────────────────────────────────────────────────
export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  type,
  data,
  xKey = 'name',
  series,
  title,
  subtitle,
  height = 240,
  darkMode = false,
  className = '',
}) => {
  const seriesColors = [COLORS.navy, COLORS.green, COLORS.red, COLORS.gold, COLORS.sky, COLORS.purple];

  const resolveColor = (s: { key: string; label: string; color?: string }, i: number) =>
    s.color ?? seriesColors[i % seriesColors.length];

  const card = `rounded-3xl border p-6 transition-all duration-300 ${
    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200/60 shadow-sm'
  } ${className}`;

  const axisColor = darkMode ? '#475569' : '#CBD5E1';
  const gridColor = darkMode ? '#1E293B' : '#F1F5F9';

  return (
    <div className={card}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
          )}
          {subtitle && (
            <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{subtitle}</p>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        {type === 'area' ? (
          <AreaChart data={data}>
            <defs>
              {series.map((s, i) => (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={resolveColor(s, i)} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={resolveColor(s, i)} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...CustomTooltipStyle} />
            {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {series.map((s, i) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={resolveColor(s, i)}
                fill={`url(#grad-${s.key})`}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </AreaChart>
        ) : type === 'bar' ? (
          <BarChart data={data} barSize={20}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...CustomTooltipStyle} />
            {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {series.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={resolveColor(s, i)} radius={[6, 6, 0, 0]} />
            ))}
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...CustomTooltipStyle} />
            {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
            {series.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={resolveColor(s, i)}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: resolveColor(s, i) }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        ) : (
          // PIE
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={height * 0.22}
              outerRadius={height * 0.36}
              paddingAngle={3}
              dataKey={series[0]?.key ?? 'value'}
              nameKey={xKey}
            >
              {data.map((_, i) => (
                <Cell key={`cell-${i}`} fill={seriesColors[i % seriesColors.length]} />
              ))}
            </Pie>
            <Tooltip {...CustomTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
