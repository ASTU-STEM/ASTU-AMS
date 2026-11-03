import React from 'react';
import { DashboardStatCard, type DashboardStatCardProps } from './DashboardStatCard';

type Cols = 2 | 3 | 4 | 5;

const colClass: Record<Cols, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 xl:grid-cols-3',
  4: 'sm:grid-cols-2 xl:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
};

export interface DashboardStatGridProps {
  stats: DashboardStatCardProps[];
  cols?: Cols;
  compact?: boolean;
  className?: string;
}

export function DashboardStatGrid({
  stats,
  cols = 4,
  compact = false,
  className = '',
}: DashboardStatGridProps) {
  if (!stats?.length) return null;

  return (
    <div className={`grid grid-cols-1 gap-3 sm:gap-4 ${colClass[cols]} ${className}`}>
      {stats.map((stat, index) => (
        <DashboardStatCard
          key={`${stat.label}-${index}`}
          {...stat}
          compact={stat.compact ?? compact}
        />
      ))}
    </div>
  );
}

export default DashboardStatGrid;
