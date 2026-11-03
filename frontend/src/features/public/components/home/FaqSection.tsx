import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { EmptySection, HOME_PREVIEW_COUNT, SectionShell, ViewAllButton } from "./homeShared";

export interface HomeFaqItem {
  id?: string;
  question: string;
  answer: string;
}

interface FaqSectionProps {
  items: HomeFaqItem[];
  headers?: { eyebrow?: string; title?: string; description?: string };
  onNavigate: (path: string) => void;
}

export default function FaqSection({ items, headers, onNavigate }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const preview = items.slice(0, HOME_PREVIEW_COUNT);

  return (
    <SectionShell
      id="faq"
      tone="muted"
      eyebrow={headers?.eyebrow || "FAQ"}
      title={headers?.title || "Frequently Asked Questions"}
      description={
        headers?.description ||
        "Common questions about ASTU-AMS, tracer studies, and alumni services."
      }
      action={
        <ViewAllButton
          label="View All FAQs"
          visible={items.length > 0}
          onClick={() => onNavigate("/info/faq")}
        />
      }
    >
      {!preview.length ? (
        <EmptySection message="FAQ entries will appear here once published." />
      ) : (
        <div className="mx-auto max-w-3xl space-y-2">
          {preview.map((item, idx) => {
            const id = item.id || `faq-${idx}`;
            const open = openId === id;
            return (
              <div
                key={id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-astu-navy/25 dark:border-slate-700 dark:bg-slate-900/50"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                  onClick={() => setOpenId(open ? null : id)}
                  aria-expanded={open}
                >
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-500 transition duration-300 ${open ? "rotate-180 text-astu-red" : ""}`}
                    aria-hidden="true"
                  />
                </button>
                {open ? (
                  <div className="border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">
                    {item.answer}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
