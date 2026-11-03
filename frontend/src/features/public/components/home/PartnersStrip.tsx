import React, { useMemo, useState } from "react";
import type { Partner } from "../../../admin/services/homepageCms.service";
import { getPartnerLogoSrc } from "../../../../components/PartnerLogos";
import config from "../../../../config";
import {
  EmptySection,
  HOME_PREVIEW_COUNT,
  partnerMonogram,
  SectionShell,
  ViewAllButton,
} from "./homeShared";

const { mediaUrl } = config;

interface PartnersStripProps {
  partners: Partner[];
  loading?: boolean;
  headers?: { eyebrow?: string; title?: string; description?: string };
  onNavigate: (path: string) => void;
}

function PartnerLogoItem({
  partner,
  failed,
  onFail,
  onNavigate,
}: {
  partner: Partner;
  failed: boolean;
  onFail: () => void;
  onNavigate: () => void;
}) {
  const mapped = getPartnerLogoSrc(partner.name);
  const logo = mediaUrl(partner.logo) || partner.logo || mapped;
  const showMonogram = !logo || failed;

  return (
    <button
      type="button"
      onClick={onNavigate}
      className="group flex h-16 w-[160px] shrink-0 items-center justify-center bg-transparent px-3"
      aria-label={partner.name}
      title={partner.name}
    >
      {showMonogram ? (
        <span className="text-sm font-black tracking-wide text-astu-navy/80 transition group-hover:text-astu-navy dark:text-sky-300/90">
          {partnerMonogram(partner.name)}
        </span>
      ) : (
        <img
          src={logo}
          alt={partner.name}
          className="partner-logo-img max-h-12 max-w-[140px] object-contain opacity-85 transition duration-300 group-hover:scale-105 group-hover:opacity-100"
          loading="lazy"
          onError={onFail}
        />
      )}
    </button>
  );
}

export default function PartnersStrip({
  partners,
  loading,
  headers,
  onNavigate,
}: PartnersStripProps) {
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const preview = useMemo(() => partners.slice(0, HOME_PREVIEW_COUNT), [partners]);
  // Duplicate for a seamless CSS marquee loop (translate -50%).
  const loop = useMemo(() => [...preview, ...preview], [preview]);

  return (
    <SectionShell
      id="partners"
      tone="muted"
      eyebrow={headers?.eyebrow || "Our Partners"}
      title={headers?.title || "Industry Partners"}
      description={
        headers?.description ||
        "Institutional partners supporting employability, internships, and research collaboration."
      }
      action={
        <ViewAllButton
          label="View All Partners"
          visible={partners.length > 0 || !loading}
          onClick={() => onNavigate("/partners")}
        />
      }
    >
      {loading ? (
        <div className="flex h-16 items-center justify-center gap-10">
          {Array.from({ length: HOME_PREVIEW_COUNT }).map((_, i) => (
            <div key={i} className="h-10 w-28 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
          ))}
        </div>
      ) : !preview.length ? (
        <EmptySection message="Published partners will appear here once added by the Alumni Office." />
      ) : (
        <div className="partners-marquee relative overflow-hidden py-2">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-950/50"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-950/50"
            aria-hidden="true"
          />
          <div
            className={`flex w-max items-center gap-10 ${preview.length > 1 ? "animate-scroll" : "mx-auto justify-center"}`}
            role="list"
            aria-label="Partner logos"
          >
            {loop.map((partner, idx) => (
              <div key={`${partner.id}-${idx}`} role="listitem" className="bg-transparent">
                <PartnerLogoItem
                  partner={partner}
                  failed={failed.has(partner.id)}
                  onNavigate={() => onNavigate("/partners")}
                  onFail={() =>
                    setFailed((prev) => {
                      const next = new Set(prev);
                      next.add(partner.id);
                      return next;
                    })
                  }
                />
              </div>
            ))}
          </div>
          {partners.length > HOME_PREVIEW_COUNT ? (
            <div className="mt-6 flex justify-center md:hidden">
              <ViewAllButton
                label="View All Partners"
                onClick={() => onNavigate("/partners")}
              />
            </div>
          ) : null}
        </div>
      )}
    </SectionShell>
  );
}
