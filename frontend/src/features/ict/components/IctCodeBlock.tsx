import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { ictCodeBlock } from './ictUi';

interface IctCodeBlockProps {
  code: string;
  /** Optional syntax label shown in the block header */
  language?: string;
  /** Set false when there is no copy affordance on the page already */
  copyable?: boolean;
  tone?: 'neutral' | 'before' | 'after';
  className?: string;
  maxHeight?: string;
}

const HEADER_TONE: Record<string, string> = {
  neutral: 'text-[var(--text-muted)]',
  before: 'text-[var(--ict-crit)]',
  after: 'text-[var(--ict-ok)]',
};

/** Terminal / JSON presentation with an optional copy affordance. */
export default function IctCodeBlock({
  code,
  language,
  copyable = true,
  tone = 'neutral',
  className = '',
  maxHeight = '18rem',
}: IctCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — leave the block unchanged */
    }
  };

  return (
    <div className={`ict-card overflow-hidden ${className}`}>
      {(language || copyable) && (
        <div className="flex items-center justify-between gap-2 border-b border-[var(--ict-hairline)] bg-[var(--ict-surface-inset)] px-2.5 py-1.5">
          <span className={`ict-mono text-[10px] font-bold uppercase tracking-[0.08em] ${HEADER_TONE[tone]}`}>
            {language}
          </span>
          {copyable && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? 'Copied' : 'Copy to clipboard'}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] ict-focus"
            >
              {copied ? <Check className="h-3 w-3 text-[var(--ict-ok)]" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      )}
      <pre
        className={`${ictCodeBlock} ict-scroll rounded-none border-0 bg-[var(--ict-surface-inset)]`}
        style={{ maxHeight }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
