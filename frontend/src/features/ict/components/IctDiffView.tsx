import React from 'react';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import IctCodeBlock from './IctCodeBlock';
import { ictTh } from './ictUi';

type DiffRow = {
  key: string;
  before?: string;
  after?: string;
  state: 'added' | 'removed' | 'changed' | 'same';
};

function stringifyValue(value: unknown): string {
  if (value === undefined) return '—';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

/** Derive a key-level diff from the two state snapshots the log already carries. */
function buildDiff(before: Record<string, unknown>, after: Record<string, unknown>): DiffRow[] {
  const keys = Array.from(new Set([...Object.keys(before || {}), ...Object.keys(after || {})]));
  return keys.map((key) => {
    const hasBefore = before && key in before;
    const hasAfter = after && key in after;
    const b = hasBefore ? stringifyValue(before[key]) : undefined;
    const a = hasAfter ? stringifyValue(after[key]) : undefined;

    let state: DiffRow['state'] = 'same';
    if (!hasBefore) state = 'added';
    else if (!hasAfter) state = 'removed';
    else if (b !== a) state = 'changed';

    return { key, before: b, after: a, state };
  });
}

const ROW_TONE: Record<DiffRow['state'], { row: string; icon: React.ReactNode }> = {
  added: { row: 'bg-[var(--ict-diff-add)]', icon: <Plus className="h-3 w-3 text-[var(--ict-ok)]" aria-hidden /> },
  removed: { row: 'bg-[var(--ict-diff-remove)]', icon: <Minus className="h-3 w-3 text-[var(--ict-crit)]" aria-hidden /> },
  changed: { row: 'bg-[var(--ict-diff-change)]', icon: <ArrowRight className="h-3 w-3 text-[var(--ict-warn)]" aria-hidden /> },
  same: { row: '', icon: null },
};

/**
 * Before/after state inspector.
 * Shows a field-level diff computed from the snapshots already on the log
 * record, plus the raw JSON exactly as stored.
 */
export default function IctDiffView({
  before,
  after,
  emptyBeforeLabel = '// No prior state — entity created',
  emptyAfterLabel = '// No after state — entity deleted',
}: {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  emptyBeforeLabel?: string;
  emptyAfterLabel?: string;
}) {
  const hasSnapshot = Boolean(before || after);
  const rows = hasSnapshot ? buildDiff(before || {}, after || {}) : [];
  const changed = rows.filter((r) => r.state !== 'same').length;

  if (!hasSnapshot) {
    return (
      <div className="ict-card p-6 text-center">
        <p className="text-sm font-extrabold text-[var(--text-primary)] ">No state snapshot recorded</p>
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
          This event did not mutate stored state, so there is no before/after diff to inspect.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="ict-label">Fields changed</span>
        <span className="ict-num font-extrabold text-[var(--text-primary)] ">
          {changed} of {rows.length}
        </span>
      </div>

      <div className="ict-card overflow-hidden">
        <div className="ict-table-scroll">
          <table className="w-full min-w-[540px] border-collapse text-xs">
            <caption className="sr-only">Field level before and after state diff</caption>
            <thead>
              <tr>
                <th scope="col" className={`${ictTh} w-8`} />
                <th scope="col" className={ictTh}>Field</th>
                <th scope="col" className={ictTh}>Before</th>
                <th scope="col" className={ictTh}>After</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const tone = ROW_TONE[row.state];
                return (
                  <tr key={row.key} className={`border-b border-[var(--ict-hairline)] last:border-b-0  ${tone.row}`}>
                    <td className="px-2 py-1.5 text-center align-middle">{tone.icon}</td>
                    <td className="ict-mono px-3 py-1.5 font-bold text-[var(--text-primary)] ">{row.key}</td>
                    <td className="ict-mono px-3 py-1.5 text-[var(--text-muted)] line-through decoration-rose-400/50">
                      {row.before ?? '—'}
                    </td>
                    <td className="ict-mono px-3 py-1.5 font-semibold text-[var(--text-primary)] ">
                      {row.after ?? '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <p className="ict-label flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ict-crit)]" aria-hidden />
            Before state
          </p>
          <IctCodeBlock
            language="JSON · previous"
            tone="before"
            code={before ? JSON.stringify(before, null, 2) : emptyBeforeLabel}
          />
        </div>
        <div className="space-y-1.5">
          <p className="ict-label flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ict-ok)]" aria-hidden />
            After state
          </p>
          <IctCodeBlock
            language="JSON · mutated"
            tone="after"
            code={after ? JSON.stringify(after, null, 2) : emptyAfterLabel}
          />
        </div>
      </div>
    </div>
  );
}
