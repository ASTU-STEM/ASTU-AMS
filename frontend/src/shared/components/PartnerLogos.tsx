import React from 'react';

const logoPath = (filename: string) => `/images/partners/${filename}`;

const wrapperClass = 'flex h-14 w-auto items-center justify-center';
const imgClass = 'max-h-14 w-auto max-w-[140px] object-contain transition-transform duration-500 hover:scale-110';

export const EthioTelecomLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('ethio-telecom.png')} alt="Ethio Telecom" className={imgClass} />
  </div>
);

export const INSALogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('insa.png')} alt="INSA" className={imgClass} />
  </div>
);

export const EthiopianAirlinesLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('ethiopian-airlines.svg')} alt="Ethiopian Airlines" className={imgClass} />
  </div>
);

export const SafaricomLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('safaricom.png')} alt="Safaricom" className={imgClass} />
  </div>
);

export const HuaweiLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('huawei.svg')} alt="Huawei" className={imgClass} />
  </div>
);

export const CBELogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('cbe.png')} alt="Commercial Bank of Ethiopia" className={imgClass} />
  </div>
);

export const partnerLogos: Record<string, React.FC<{ className?: string }>> = {
  "Ethio Telecom": EthioTelecomLogo,
  "INSA": INSALogo,
  "Ethiopian Airlines": EthiopianAirlinesLogo,
  "Safaricom": SafaricomLogo,
  "Huawei": HuaweiLogo,
  "Commercial Bank of Ethiopia": CBELogo,
};
