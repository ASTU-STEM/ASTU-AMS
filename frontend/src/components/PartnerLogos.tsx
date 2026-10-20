import React from 'react';

const logoPath = (filename: string) => `/images/partners/${filename}`;

const wrapperClass = 'flex h-full w-full items-center justify-center overflow-hidden select-none';
const imgClass = 'h-12 w-12 object-contain transition-transform duration-300';

const partnerBadgeStyles: Record<string, string> = {
  'Ethio Telecom': 'bg-sky-50 ring-sky-200',
  INSA: 'bg-indigo-50 ring-indigo-200',
  'Ethiopian Airlines': 'bg-emerald-50 ring-emerald-200',
  Safaricom: 'bg-green-50 ring-green-200',
  Huawei: 'bg-rose-50 ring-rose-200',
  'Commercial Bank of Ethiopia': 'bg-amber-50 ring-amber-200',
};

/** Shared image treatment for partner marks, including large transparent source canvases. */
export const PartnerLogoImage: React.FC<{
  name: string;
  src: string;
  className?: string;
}> = ({ name, src, className = '' }) => (
  <img
    src={src}
    alt={`${name} logo`}
    loading="lazy"
    decoding="async"
    className={`h-12 w-12 shrink-0 rounded-full object-contain ${className}`}
  />
);

export const PartnerLogoBadge: React.FC<{
  name: string;
  src?: string;
  className?: string;
}> = ({ name, src, className = '' }) => (
  <div className={`flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full ring-1 ring-inset shadow-[0_6px_18px_rgba(0,43,102,0.1)] transition-transform duration-300 group-hover:scale-105 ${partnerBadgeStyles[name] || 'bg-slate-50 ring-slate-200'} ${className}`}>
    {src ? (
      <PartnerLogoImage name={name} src={src} />
    ) : (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#003366] text-xs font-bold text-white">{name.slice(0, 2).toUpperCase()}</span>
    )}
  </div>
);

export const EthioTelecomLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <PartnerLogoBadge name="Ethio Telecom" src={logoPath('ethio-telecom.png')} className={`${imgClass} ${imgClassName}`} />
  </div>
);

export const INSALogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <PartnerLogoBadge name="INSA" src={logoPath('insa.png')} className={`${imgClass} ${imgClassName}`} />
  </div>
);

export const EthiopianAirlinesLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <PartnerLogoBadge name="Ethiopian Airlines" src={logoPath('ethiopian-airlines.svg')} className={`${imgClass} ${imgClassName}`} />
  </div>
);

export const SafaricomLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <PartnerLogoBadge name="Safaricom" src={logoPath('safaricom.png')} className={`${imgClass} ${imgClassName}`} />
  </div>
);

export const HuaweiLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <PartnerLogoBadge name="Huawei" src={logoPath('huawei.svg')} className={`${imgClass} ${imgClassName}`} />
  </div>
);

export const CBELogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <PartnerLogoBadge name="Commercial Bank of Ethiopia" src={logoPath('cbe.png')} className={`${imgClass} ${imgClassName}`} />
  </div>
);

export const partnerLogos: Record<string, React.FC<{ className?: string; imgClassName?: string }>> = {
  'Ethio Telecom': EthioTelecomLogo,
  'INSA': INSALogo,
  'Ethiopian Airlines': EthiopianAirlinesLogo,
  'Safaricom': SafaricomLogo,
  'Huawei': HuaweiLogo,
  'Commercial Bank of Ethiopia': CBELogo,
};
