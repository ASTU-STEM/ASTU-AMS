import React from 'react';

const logoPath = (filename: string) => `/images/partners/${filename}`;

const wrapperClass = 'flex h-full w-full items-center justify-center overflow-hidden select-none';
const imgClass = 'max-h-full max-w-full object-contain transition-transform duration-300';

export const EthioTelecomLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('ethio-telecom.png')} alt="Ethio Telecom" className={`${imgClass} ${imgClassName}`} />
  </div>
);

export const INSALogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('insa.png')} alt="INSA" className={`${imgClass} ${imgClassName}`} />
  </div>
);

export const EthiopianAirlinesLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('ethiopian-airlines.svg')} alt="Ethiopian Airlines" className={`${imgClass} ${imgClassName}`} />
  </div>
);

export const SafaricomLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('safaricom.png')} alt="Safaricom" className={`${imgClass} ${imgClassName}`} />
  </div>
);

export const HuaweiLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('huawei.svg')} alt="Huawei" className={`${imgClass} ${imgClassName}`} />
  </div>
);

export const CBELogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img src={logoPath('cbe.png')} alt="Commercial Bank of Ethiopia" className={`${imgClass} ${imgClassName}`} />
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
