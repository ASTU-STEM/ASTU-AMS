import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface AdminNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  exact?: boolean;
}

export interface AdminBreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminStatCardData {
  label?: string;
  title?: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  trend?: string;
  tone?: 'blue' | 'gold' | 'green' | 'red' | 'amber' | 'purple';
  accentColor?: string;
  trendDirection?: 'up' | 'down' | 'flat';
}

export interface AdminTableColumn<T> {
  key: string;
  header: string;
  accessor?: keyof T | ((row: T) => ReactNode);
  className?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface AdminModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
}

export interface AdminBadgeProps {
  children?: ReactNode;
  label?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'published' | 'draft' | 'scheduled' | 'featured' | 'pinned' | 'needs-review' | 'archived' | 'amber' | 'purple-soft' | 'emerald';
  className?: string;
}

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: AdminBreadcrumbItem[];
  breadcrumbs?: AdminBreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export interface AdminDataTableProps<T extends Record<string, unknown>> {
  columns: AdminTableColumn<T>[];
  data: T[];
  emptyState?: string;
  emptyIcon?: LucideIcon;
  isLoading?: boolean;
  pageSize?: number;
  getRowId?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  bulkSelection?: boolean;
  selectedRowIds?: string[];
  onSelectedRowIdsChange?: (ids: string[]) => void;
}
