import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';

interface ChartProps {
  data: Record<string, unknown>[];
  className?: string;
  height?: number;
}

interface BarChartProps extends ChartProps {
  xKey: string;
  bars: { key: string; color: string; name?: string }[];
}

interface LineChartProps extends ChartProps {
  xKey: string;
  lines: { key: string; color: string; name?: string }[];
}

interface PieChartProps extends ChartProps {
  dataKey: string;
  nameKey: string;
  colors?: string[];
}

const DEFAULT_COLORS = ['#003366', '#008C44', '#E31E24', '#FFD700', '#4B74B4', '#6B7280', '#8B5CF6', '#EC4899'];

export function BarChartComponent({ data, xKey, bars, height = 300, className = '' }: BarChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e8edf5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
          {bars.map(bar => (
            <Bar key={bar.key} dataKey={bar.key} fill={bar.color} radius={[4, 4, 0, 0]} name={bar.name || bar.key} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineChartComponent({ data, xKey, lines, height = 300, className = '' }: LineChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e8edf5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
          {lines.map(line => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              name={line.name || line.key}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChartComponent({ data, dataKey, nameKey, colors = DEFAULT_COLORS, height = 300, className = '' }: PieChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            paddingAngle={4}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e8edf5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AreaChartComponent({ data, xKey, lines, height = 300, className = '' }: LineChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e8edf5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
          {lines.map(line => (
            <Area
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.color}
              fill={line.color}
              fillOpacity={0.1}
              strokeWidth={2}
              name={line.name || line.key}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
