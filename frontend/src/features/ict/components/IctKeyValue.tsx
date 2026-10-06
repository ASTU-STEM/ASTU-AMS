import React from 'react';

interface IctDetailProps {
  label: string;
  value: React.ReactNode;
  /** Render values in the technical monospace face */
  mono?: boolean;
  className?: string;
}

/** One labelled fact — used inside detail panels and summary grids */
export function IctDetail({ label, value, mono = false, className = '' }: IctDetailProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="ict-label">{label}</dt>
      <dd
        className={`mt-0.5 text-[11px] font-semibold text-[var(--text-primary)]  ${
          mono ? 'ict-mono ict-num break-words' : ''
        }`}
      >
        {value ?? '—'}
      </dd>
    </div>
  );
}

/** Bordered grid of labelled facts */
export default function IctKeyValueGrid({
  items,
  columns = 4,
  className = '',
}: {
  items: IctDetailProps[];
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const cols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  }[columns];

  return (
    <dl className={`ict-inset grid gap-x-4 gap-y-3 p-3 ${cols} ${className}`}>
      {items.map((item, i) => (
        <IctDetail key={`${item.label}-${i}`} {...item} />
      ))}
    </dl>
  );
}
