import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  HOME_PREVIEW_COUNT,
  SectionPager,
  SectionShell,
  useSectionPager,
  ViewAllButton,
} from "./homeShared";

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
  const { pageItems, page, totalPages, goPrev, goNext } = useSectionPager(
    items,
    HOME_PREVIEW_COUNT
  );

  if (!pageItems.length) return null;

  return (
    <SectionShell
      id="faq"
      tone="muted"
      eyebrow={headers?.eyebrow}
      title={headers?.title || "Frequently Asked Questions"}
      description={headers?.description}
      action={
        <ViewAllButton
          label="View All"
          visible={items.length > 0}
          onClick={() => onNavigate("/info/faq")}
        />
      }
    >
      <div className="mx-auto max-w-3xl space-y-2">
        {pageItems.map((item, idx) => {
          const id = item.id || `faq-${page}-${idx}`;
          const open = openId === id;
          return (
            <div
              key={id}
              className="overflow-hidden border-b border-slate-200 bg-transparent dark:border-slate-700"
            >
              <button
                type="button"
                className="flex min-h-12 w-full items-center justify-between gap-3 py-4 text-left transition hover:text-astu-navy dark:hover:text-sky-300"
                onClick={() => setOpenId(open ? null : id)}
                aria-expanded={open}
              >
                <span className="font-semibold text-slate-900 dark:text-white">
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-500 transition duration-300 ${
                    open ? "rotate-180 text-astu-red" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {open ? (
                <div className="pb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {item.answer}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <SectionPager
        page={page}
        totalPages={totalPages}
        onPrev={goPrev}
        onNext={goNext}
        label="questions"
      />
    </SectionShell>
  );
}
