import React from 'react';
import config from '../../../config';
import { useSystemSettings } from '../../../context/SystemSettingsContext';

interface BrandMarkProps {
  className?: string;
  tone?: 'light' | 'dark';
}

/**
 * Renders the university mark from GET /admin/settings/public.
 *
 * There is deliberately no bundled fallback image: when no logo has been
 * uploaded the monogram built from the configured abbreviation is shown, and
 * when even that is absent nothing is rendered.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ className = '', tone = 'light' }) => {
  const { settings } = useSystemSettings();
  const logoUrl = config.mediaUrl(settings.appearance?.logoUrl);
  const monogram = (settings.general?.abbreviation || '').trim().slice(0, 4);
  const label = settings.general?.siteName || settings.general?.universityName || 'University logo';

  if (logoUrl) {
    return <img src={logoUrl} alt={label} className={className} />;
  }

  if (monogram) {
    return (
      <span
        aria-label={label}
        role="img"
        className={`inline-flex items-center justify-center font-extrabold tracking-tight ${
          tone === 'dark' ? 'bg-white/15 text-white border border-white/20' : 'bg-[#003366] text-white'
        } ${className}`}
      >
        {monogram}
      </span>
    );
  }

  return null;
};

export default BrandMark;