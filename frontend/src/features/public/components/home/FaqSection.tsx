import React, { useEffect, useState } from "react";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";
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

  useEffect(() => {
    setOpenId(null);
  }, [page]);

  if (!pageItems.length) return null;

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
          label="View All"
          visible={items.length > 0}
          onClick={() => onNavigate("/info/faq")}
        />
      }
    >
      <div className="mx-auto max-w-3xl space-y-3">
        {pageItems.map((item, idx) => {
          const id = item.id || `faq-${page}-${idx}`;
          const open = openId === id;
          const panelId = `${id}-panel`;
          return (
            <div
              key={id}
              className={`home-surface ${
                open
                  ? "border-astu-navy/35 shadow-md dark:border-sky-500/40"
                  : "hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <button
                type="button"
                className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-astu-navy/40 dark:focus-visible:ring-sky-400/40 md:px-6"
                onClick={() => setOpenId(open ? null : id)}
                aria-expanded={open}
                aria-controls={panelId}
              >
                <span className="flex items-start gap-3">
                  <MessageCircleQuestion
                    className={`mt-0.5 h-5 w-5 shrink-0 transition ${
                      open ? "text-astu-red" : "text-slate-400 dark:text-slate-500"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="text-base font-semibold text-slate-900 dark:text-white">
                    {item.question}
                  </span>
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-500 transition duration-300 ${
                    open ? "rotate-180 text-astu-red" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={id}
                className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300 md:px-6 md:pl-14 md:text-base">
                    {item.answer}
                  </div>
                </div>
              </div>
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
