import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  TooltipProps
} from 'recharts';
import { Inbox } from 'lucide-react';

// ── Color palette (restrained, ASTU-affiliated) ───────────────────────────────
const COLORS = {
  navy:    '#1D3D72',
  green:   '#008C44',
  red:     '#E31E24',
  gold:    '#B8860B',
  sky:     '#4B74B4',
  purple:  '#7C5CBF',
};

interface DataPoint { [key: string]: string | number }

interface AnalyticsChartProps {
  type: 'area' | 'bar' | 'line' | 'pie';
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

const formatNumber = (value: number): string => {
  const n = Math.round(value);
  if (Math.abs(n) >= 1000) return n.toLocaleString('en-US');
  return String(n);
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border px-3 py-2 text-xs shadow-md"
      style={{
        backgroundColor: '#0F172A',
        borderColor: '#1E293B',
        color: '#E2E8F0',
      }}
    >
      {label !== undefined && label !== '' && (
        <p className="mb-1 font-semibold text-slate-200">{String(label)}</p>
      )}
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || COLORS.navy }} />
            {entry.name}
          </span>
          <span className="font-semibold text-white">
            {typeof entry.value === 'number' ? formatNumber(entry.value) : String(entry.value)}
            {typeof entry.value === 'number' && entry.name && /rate|%/i.test(String(entry.name)) ? '%' : ''}
          </span>
        </div>
      ))}
    </div>
  );
};

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

  const card = `rounded-2xl border p-5 transition-colors ${
    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/70'
  } ${className}`;

  const axisColor = darkMode ? '#64748B' : '#94A3B8';
  const gridColor = darkMode ? '#334155' : '#EEF2F7';
  const empty = !data || data.length === 0;

  const renderEmpty = () => (
    <div
      className="flex flex-col items-center justify-center"
      style={{ height }}
      role="img"
      aria-label={title ? `${title} – no data available` : 'No chart data available'}
    >
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
        <Inbox className="h-5 w-5" />
      </div>
      <p className={`mt-2 text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No data available</p>
    </div>
  );

  return (
    <div className={card}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h4>
          )}
          {subtitle && (
            <p className={`mt-0.5 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
          )}
        </div>
      )}

      {empty ? (
        renderEmpty()
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {type === 'area' ? (
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {series.map((s, i) => (
                  <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={resolveColor(s, i)} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={resolveColor(s, i)} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={42} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: axisColor, strokeDasharray: '3 3' }} />
              {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />}
              {series.map((s, i) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={resolveColor(s, i)}
                  fill={`url(#grad-${s.key})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </AreaChart>
          ) : type === 'bar' ? (
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={18}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={42} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
              {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />}
              {series.map((s, i) => (
                <Bar key={s.key} dataKey={s.key} name={s.label} fill={resolveColor(s, i)} radius={[4, 4, 0, 0]} maxBarSize={28} />
              ))}
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} dy={6} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={42} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: axisColor, strokeDasharray: '3 3' }} />
              {series.length > 1 && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />}
              {series.map((s, i) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={resolveColor(s, i)}
                  strokeWidth={2}
                  dot={{ r: 3, fill: resolveColor(s, i), strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={height * 0.24}
                outerRadius={height * 0.38}
                paddingAngle={2}
                dataKey={series[0]?.key ?? 'value'}
                nameKey={xKey}
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={seriesColors[i % seriesColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AnalyticsChart;
