import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface NavbarBreadcrumbProps {
  items: BreadcrumbItem[];
  title: string;
}

export default function NavbarBreadcrumb({ items, title }: NavbarBreadcrumbProps) {
  return (
    <div className="min-w-0 space-y-0.5">
      <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)]">
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span>/</span>}
            <button
              onClick={item.onClick}
              className={`${item.onClick ? 'hover:text-[var(--text-primary)] cursor-pointer' : ''}`}
            >
              {item.label}
            </button>
          </React.Fragment>
        ))}
      </div>
      <h1 className="truncate text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">{title}</h1>
    </div>
  );
}
