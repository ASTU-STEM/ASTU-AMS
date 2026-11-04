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
      className="group flex h-[5.25rem] w-[180px] shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-astu-navy/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-astu-navy/40 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-sky-500/40 dark:focus-visible:ring-sky-400/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      aria-label={`View ${partner.name}`}
      title={partner.name}
    >
      {showMonogram ? (
        <span className="text-sm font-black tracking-wide text-astu-navy dark:text-sky-300">
          {partnerMonogram(partner.name)}
        </span>
      ) : (
        <img
          src={logo}
          alt=""
          className="max-h-11 max-w-[128px] object-contain opacity-85 transition duration-300 group-hover:opacity-100"
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
      eyebrow={headers?.eyebrow || "Our Partners"}
      title={headers?.title || "Partner Companies"}
      description={
        headers?.description ||
        "Institutional partners supporting employability, internships, and research collaboration."
      }
      action={
        <ViewAllButton
          label="View All Partners"
          visible={active.length > 0}
          onClick={() => onNavigate("/partners")}
        />
      }
    >
      {loading ? (
        <div className="flex h-16 items-center justify-center gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-14 w-36 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : (
        <div className="partners-marquee relative overflow-hidden py-2">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--bg-page)] to-transparent sm:w-24"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--bg-page)] to-transparent sm:w-24"
            aria-hidden="true"
          />
          <div
            className={`flex w-max items-center gap-5 sm:gap-8 ${
              active.length > 2 ? "animate-scroll" : "mx-auto justify-center"
            }`}
            role="list"
            aria-label="Partner logos"
          >
            {loop.map((partner, idx) => (
              <div key={`${partner.id}-${idx}`} role="listitem">
                <PartnerLogoItem
                  partner={partner}
                  failed={failed.has(partner.id)}
                  onNavigate={() =>
                    onNavigate(
                      `/partners?partner=${encodeURIComponent(partner.id || partner.name)}`
                    )
                  }
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
