import React from 'react';
import { ictTabList, ictTabActive, ictTabIdle, ictTabUnderlineList, ictTabUnderlineActive, ictTabUnderlineIdle } from './ictUi';

export interface IctTabItem<T extends string> {
  key: T;
  label: string;
  /** Optional count shown next to the label */
  count?: number;
  /** Optional status dot, e.g. to flag a tab holding critical work */
  dot?: 'ok' | 'info' | 'warning' | 'danger' | 'none';
}

const DOT: Record<string, string> = {
  ok: 'bg-[var(--ict-ok)]',
  info: 'bg-[var(--ict-info)]',
  warning: 'bg-[var(--ict-warn)]',
  danger: 'bg-[var(--ict-crit)] ict-pulse',
  none: 'bg-transparent',
};

function TabContent<T extends string>({ item, active }: { item: IctTabItem<T>; active: boolean }) {
  return (
    <>
      {item.dot && item.dot !== 'none' && (
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[item.dot]}`} aria-hidden />
      )}
      <span>{item.label}</span>
      {typeof item.count === 'number' && item.count > 0 && (
        <span
          className={`ict-num rounded-[3px] px-1 py-px text-[10px] font-extrabold ${
            active
              ? 'bg-[var(--ict-accent)]/15 text-[var(--ict-accent-text)]'
              : 'bg-[var(--ict-surface-inset)] text-[var(--text-muted)] '
          }`}
        >
          {item.count}
        </span>
      )}
    </>
  );
}

/** Segmented control — for filters and view switches inside a module */
export function IctTabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel = 'Tabs',
  className = '',
}: {
  items: IctTabItem<T>[];
  value: T;
  onChange: (key: T) => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div className={`${ictTabList} ${className}`} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = value === item.key;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={`inline-flex items-center gap-1.5 ${active ? ictTabActive : ictTabIdle}`}
          >
            <TabContent item={item} active={active} />
          </button>
        );
      })}
    </div>
  );
}

/** Underline strip — for tabs that switch major views inside a page */
export function IctUnderlineTabs<T extends string>({
  items,
  value,
  onChange,
  ariaLabel = 'Sections',
  className = '',
}: {
  items: IctTabItem<T>[];
  value: T;
  onChange: (key: T) => void;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <div className={`${ictTabUnderlineList} ${className}`} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = value === item.key;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={`inline-flex items-center gap-1.5 ${
              active ? ictTabUnderlineActive : ictTabUnderlineIdle
            }`}
          >
            <TabContent item={item} active={active} />
          </button>
        );
      })}
    </div>
  );
}

export default IctTabs;
