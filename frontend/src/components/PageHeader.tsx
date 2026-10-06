import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions
}) => {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-3">
          <button className="hover:text-[var(--text-secondary)] transition-colors">
            <Home className="h-4 w-4" />
          </button>
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
              {item.path || item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="hover:text-[var(--text-secondary)] transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-[var(--text-primary)] font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Title and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
