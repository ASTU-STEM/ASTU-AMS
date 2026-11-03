import React from "react";
import { Heart } from "lucide-react";
import {
  EmptySection,
  getHomeCampaignImage,
  HOME_PREVIEW_COUNT,
  SectionShell,
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
  const preview = campaigns.slice(0, HOME_PREVIEW_COUNT);

  return (
    <SectionShell
      id="giving"
      tone="band"
      eyebrow="Giving"
      title={headers?.title || "Support Future Innovators"}
      description={
        headers?.subtitle ||
        "Active campaigns organized by the ASTU Alumni & Advancement Office."
      }
      action={
        <ViewAllButton
          label={headers?.buttonText || "View All Causes"}
          visible={campaigns.length > 0}
          onClick={() => onNavigate("/donations")}
        />
      }
    >
      {!preview.length ? (
        <EmptySection message="No active donation campaigns are published at the moment." />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {preview.map((campaign) => {
            const goal = Number(campaign.goal) || 0;
            const raised = Number(campaign.raised) || 0;
            const pct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
            return (
              <div
                key={campaign.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/50 motion-reduce:transform-none"
              >
                <div className="aspect-[16/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={getHomeCampaignImage(campaign)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <h3 className="line-clamp-2 font-bold text-slate-900 dark:text-white">
                    {campaign.title}
                  </h3>
                  {goal > 0 ? (
                    <div>
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>{raised.toLocaleString()} ETB raised</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-astu-green"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="home-btn home-btn--primary home-btn--sm w-full"
                    onClick={() =>
                      onDonate
                        ? onDonate(campaign)
                        : onNavigate(`/donations?cause=${encodeURIComponent(campaign.id)}`)
                    }
                  >
                    <Heart className="home-btn__icon" aria-hidden="true" />
                    Donate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
