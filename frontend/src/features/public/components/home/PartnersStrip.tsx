import React, { useMemo, useState } from "react";
import type { Partner } from "../../../admin/services/homepageCms.service";
import { getPartnerLogoSrc } from "../../../../components/PartnerLogos";
import config from "../../../../config";
import { partnerMonogram, SectionShell, ViewAllButton } from "./homeShared";

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
      className="flex h-16 w-[148px] shrink-0 items-center justify-center rounded-xl border border-transparent bg-white/70 px-3 transition hover:border-slate-200 hover:bg-white hover:shadow-sm dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-900"
      aria-label={partner.name}
      title={partner.name}
    >
      {showMonogram ? (
        <span className="text-sm font-black tracking-wide text-slate-500 dark:text-slate-400">
          {partnerMonogram(partner.name)}
        </span>
      ) : (
        <img
          src={logo}
          alt={partner.name}
          className="max-h-10 max-w-[120px] object-contain opacity-80"
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
  const active = useMemo(
    () => partners.filter((p) => p && p.active !== false && p.name),
    [partners]
  );
  const loop = useMemo(() => (active.length ? [...active, ...active] : []), [active]);

  if (!loading && !active.length) return null;

  return (
    <SectionShell
      id="partners"
      tone="plain"
      eyebrow={headers?.eyebrow}
      title={headers?.title || "Partners"}
      description={headers?.description}
      action={
        <ViewAllButton
          label="View All"
          visible={active.length > 0}
          onClick={() => onNavigate("/partners")}
        />
      }
    >
      {loading ? (
        <div className="flex h-14 items-center justify-center gap-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-24 animate-pulse rounded bg-slate-200/70 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="partners-marquee relative overflow-hidden py-1">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--bg-page)] to-transparent sm:w-20"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--bg-page)] to-transparent sm:w-20"
            aria-hidden="true"
          />
          <div
            className={`flex w-max items-center gap-12 ${
              active.length > 2 ? "animate-scroll" : "mx-auto justify-center"
            }`}
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
        </div>
      )}
    </SectionShell>
  );
}
