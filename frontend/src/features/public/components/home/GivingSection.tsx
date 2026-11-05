import React from "react";
import { Heart } from "lucide-react";
import {
  getHomeCampaignImage,
  HOME_PREVIEW_COUNT,
  SectionPager,
  SectionShell,
  useSectionPager,
  ViewAllButton,
} from "./homeShared";

export interface HomeCampaign {
  id: string;
  title: string;
  image?: string | null;
  goal?: number;
  raised?: number;
  status?: string;
  featured?: boolean;
}

interface GivingSectionProps {
  campaigns: HomeCampaign[];
  headers?: { title?: string; subtitle?: string; buttonText?: string };
  onNavigate: (path: string) => void;
  onDonate?: (campaign: HomeCampaign) => void;
}

export default function GivingSection({
  campaigns,
  headers,
  onNavigate,
  onDonate,
}: GivingSectionProps) {
  const { pageItems, page, totalPages, goPrev, goNext } = useSectionPager(
    campaigns,
    HOME_PREVIEW_COUNT
  );

  if (!pageItems.length) return null;

  return (
    <SectionShell
      id="giving"
      tone="band"
      eyebrow="Giving"
      title={headers?.title || "Support Future Innovators & Campus Research"}
      description={
        headers?.subtitle ||
        "Active campaigns organized by the ASTU Alumni & Advancement Office. Gifts support undergraduate scholarships, research labs, student welfare, and campus innovation."
      }
      action={
        <ViewAllButton
          label={headers?.buttonText || "View All"}
          visible={campaigns.length > 0}
          onClick={() => onNavigate("/donations")}
        />
      }
    >
      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {pageItems.map((campaign) => {
          const goal = Number(campaign.goal) || 0;
          const raised = Number(campaign.raised) || 0;
          const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
          return (
            <div
              key={`${campaign.id}-${page}`}
              className="home-surface group focus-within:ring-2 focus-within:ring-astu-navy/25 motion-reduce:hover:translate-y-0"
            >
              <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={getHomeCampaignImage(campaign)}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="space-y-4 p-5 md:p-6">
                <h3 className="line-clamp-2 text-lg font-bold text-slate-900 dark:text-white">
                  {campaign.title}
                </h3>
                {goal > 0 ? (
                  <div>
                    <div className="mb-2 flex justify-between gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                      <span>{raised.toLocaleString()} ETB raised</span>
                      <span className="tabular-nums text-astu-green">{pct}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-astu-green to-emerald-400 transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ) : null}
                <button
                  type="button"
                  className="home-btn home-btn--accent home-btn--sm w-full"
                  onClick={() =>
                    onDonate
                      ? onDonate(campaign)
                      : onNavigate(`/donations?cause=${encodeURIComponent(campaign.id)}`)
                  }
                >
                  <Heart className="home-btn__icon" aria-hidden="true" />
                  <span>Donate Now</span>
                </button>
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
        label="campaigns"
      />
    </SectionShell>
  );
}
