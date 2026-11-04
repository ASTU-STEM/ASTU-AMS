import React from 'react';

const logoPath = (filename: string) => `/images/partners/${filename}`;

/** Direct file map — used by the homepage marquee (no card chrome). */
export const partnerLogoSrc: Record<string, string> = {
  'Ethio Telecom': logoPath('ethio-telecom.png'),
  INSA: logoPath('insa.png'),
  'Ethiopian Airlines': logoPath('ethiopian-airlines.svg'),
  Safaricom: logoPath('safaricom.png'),
  'Safaricom Ethiopia': logoPath('safaricom.png'),
  Huawei: logoPath('huawei.svg'),
  'Huawei Ethiopia': logoPath('huawei.svg'),
  'Commercial Bank of Ethiopia': logoPath('cbe.png'),
  CBE: logoPath('cbe.png'),
};

const normalizePartnerName = (name: string) =>
  name.trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export const getPartnerLogoSrc = (name: string): string | undefined => {
  if (partnerLogoSrc[name]) return partnerLogoSrc[name];
  const normalizedName = normalizePartnerName(name);
  return Object.entries(partnerLogoSrc).find(
    ([key]) => normalizePartnerName(key) === normalizedName
  )?.[1];
};

const wrapperClass = 'flex items-center justify-center select-none bg-transparent';
const imgClass = 'partner-logo-img h-12 w-auto max-w-[160px] object-contain bg-transparent';

export const EthioTelecomLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('ethio-telecom.png')} alt="Ethio Telecom" className={`${imgClass} ${imgClassName}`} loading="lazy" />
  </div>
);

export const INSALogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('insa.png')} alt="INSA" className={`${imgClass} ${imgClassName}`} loading="lazy" />
  </div>
);

export const EthiopianAirlinesLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('ethiopian-airlines.svg')} alt="Ethiopian Airlines" className={`${imgClass} ${imgClassName}`} loading="lazy" />
  </div>
);

export const SafaricomLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('safaricom.png')} alt="Safaricom" className={`${imgClass} ${imgClassName}`} loading="lazy" />
  </div>
);

export const HuaweiLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('huawei.svg')} alt="Huawei" className={`${imgClass} ${imgClassName}`} loading="lazy" />
  </div>
);

export const CBELogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('cbe.png')} alt="Commercial Bank of Ethiopia" className={`${imgClass} ${imgClassName}`} loading="lazy" />
  </div>
);

export const MInTLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <span className="whitespace-nowrap text-sm font-bold tracking-wide text-astu-navy dark:text-slate-200">MInT</span>
  </div>
);

export const EAIILogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <span className="whitespace-nowrap text-sm font-bold tracking-wide text-astu-navy dark:text-slate-200">EAII</span>
  </div>
);

export const partnerLogos: Record<string, React.FC<{ className?: string; imgClassName?: string }>> = {
  'Ethio Telecom': EthioTelecomLogo,
  INSA: INSALogo,
  'Ethiopian Airlines': EthiopianAirlinesLogo,
  Safaricom: SafaricomLogo,
  'Safaricom Ethiopia': SafaricomLogo,
  Huawei: HuaweiLogo,
  'Huawei Ethiopia': HuaweiLogo,
  'Commercial Bank of Ethiopia': CBELogo,
  CBE: CBELogo,
  'Ministry of Innovation & Technology (MInT)': MInTLogo,
  'Ministry of Innovation and Technology': MInTLogo,
  'Artificial Intelligence Institute': EAIILogo,
  'Ethiopian Artificial Intelligence Institute': EAIILogo,
};

