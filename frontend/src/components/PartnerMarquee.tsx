import React, { useState, useMemo } from 'react';
import { partnerLogos } from './PartnerLogos';
import { defaultPartnersList, Partner } from '../features/admin/services/homepageCms.service';
import { mediaUrl } from '../config';

export interface PartnerMarqueeProps {
  partners?: Partner[];
  onPartnerClick?: (partner: Partner) => void;
  className?: string;
  speedSeconds?: number;
  pauseOnHover?: boolean;
}

export const PartnerMarquee: React.FC<PartnerMarqueeProps> = ({
  partners,
  onPartnerClick,
  className = '',
  speedSeconds = 32,
  pauseOnHover = true,
}) => {
  const [failedLogos, setFailedLogos] = useState<Set<string>>(() => new Set());

  // Use provided partners or fall back to default verified strategic partners
  const activePartners = useMemo(() => {
    const source = partners && partners.length > 0 ? partners : defaultPartnersList;
    const filtered = source.filter((p) => p.active !== false);
    return filtered.length > 0 ? filtered : defaultPartnersList;
  }, [partners]);

  // Build a mathematically seamless infinite track:
  // Each half of the track must have at least 12 items so it is wider than wide viewports (>2400px),
  // and the second half is an exact duplicate of the first half for seamless translateX(-50%) wrapping.
  const marqueeItems = useMemo(() => {
    if (activePartners.length === 0) return [];
    let halfTrack = [...activePartners];
    while (halfTrack.length < 12) {
      halfTrack = [...halfTrack, ...activePartners];
    }
    return [...halfTrack, ...halfTrack];
  }, [activePartners]);

  if (marqueeItems.length === 0) return null;

  return (
    <div
      className={`partner-marquee-outer group/marquee ${pauseOnHover ? '' : 'no-pause'} ${className}`}
      role="list"
      aria-label="Partner logos continuous showcase"
    >
      {/* Edge gradient fade masks */}
      <div className="partner-marquee-fade partner-marquee-fade--left" aria-hidden="true" />
      <div className="partner-marquee-fade partner-marquee-fade--right" aria-hidden="true" />

      {/* Infinite scrolling track */}
      <div
        className="partner-marquee-track"
        style={{ animationDuration: `${speedSeconds}s` }}
      >
        {marqueeItems.map((partner, idx) => {
          const partnerKey = `${partner.id || partner.name}-${idx}`;
          const logoFailed = failedLogos.has(partnerKey);
          const rawLogo = partner.logo ? mediaUrl(partner.logo) : '';
          const PartnerLogoComp = partnerLogos[partner.name];
          const isClickable = Boolean(onPartnerClick);

          return (
            <article
              key={partnerKey}
              role="listitem"
              title={partner.name}
              aria-label={partner.name}
              onClick={() => onPartnerClick?.(partner)}
              className={`partner-marquee-card group/card ${
                isClickable ? 'cursor-pointer hover:border-blue-500/50' : 'cursor-default'
              }`}
            >
              {rawLogo && !logoFailed ? (
                <img
                  src={rawLogo}
                  alt={`${partner.name} logo`}
                  loading="lazy"
                  decoding="async"
                  className="partner-logo-img"
                  onError={() =>
                    setFailedLogos((prev) => new Set(prev).add(partnerKey))
                  }
                />
              ) : PartnerLogoComp ? (
                <PartnerLogoComp className="partner-logo-svg" />
              ) : (
                <span className="partner-logo-text">{partner.name}</span>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default PartnerMarquee;
