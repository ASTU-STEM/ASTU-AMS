import React from 'react';
import AdminStatCard from './AdminStatCard';
import type { AdminStatCardData } from '../types/admin.types';

type Cols = 2 | 3 | 4 | 5;

const colClass: Record<Cols, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 xl:grid-cols-3',
  4: 'sm:grid-cols-2 xl:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
};

export interface AdminStatGridProps {
  stats: AdminStatCardData[];
  cols?: Cols;
  compact?: boolean;
  className?: string;
}

export default function AdminStatGrid({
  stats,
  cols = 4,
  compact = false,
  className = '',
}: AdminStatGridProps) {
  if (!stats?.length) return null;

  return (
    <div className={`grid grid-cols-1 gap-3 sm:gap-4 ${colClass[cols]} ${className}`}>
      {stats.map((stat, index) => (
        <AdminStatCard
          key={`${stat.title ?? stat.label ?? 'stat'}-${index}`}
          {...stat}
          compact={stat.compact ?? compact}
        />
      ))}
    </div>
  );
}
