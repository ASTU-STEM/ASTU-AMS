import React from 'react';

const logoPath = (filename: string) => `/images/partners/${filename}`;

const wrapperClass = 'flex h-full w-full items-center justify-center overflow-hidden select-none';
const imgClass = 'max-h-12 w-auto max-w-[140px] object-contain transition-transform duration-300 group-hover:scale-105';

export const EthioTelecomLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img
      src={logoPath('ethio-telecom.png')}
      alt="Ethio Telecom"
      className={`${imgClass} ${imgClassName}`}
      loading="lazy"
    />
  </div>
);

export const INSALogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img
      src={logoPath('insa.png')}
      alt="INSA"
      className={`${imgClass} ${imgClassName}`}
      loading="lazy"
    />
  </div>
);

export const EthiopianAirlinesLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img
      src={logoPath('ethiopian-airlines.svg')}
      alt="Ethiopian Airlines"
      className={`${imgClass} ${imgClassName}`}
      loading="lazy"
    />
  </div>
);

export const SafaricomLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img
      src={logoPath('safaricom.png')}
      alt="Safaricom"
      className={`${imgClass} ${imgClassName}`}
      loading="lazy"
    />
  </div>
);

export const HuaweiLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img
      src={logoPath('huawei.svg')}
      alt="Huawei"
      className={`${imgClass} ${imgClassName}`}
      loading="lazy"
    />
  </div>
);

export const CBELogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
  imgClassName = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <img
      src={logoPath('cbe.png')}
      alt="Commercial Bank of Ethiopia"
      className={`${imgClass} ${imgClassName}`}
      loading="lazy"
    />
  </div>
);

export const MInTLogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#001f3f] text-amber-400 font-black text-xs">
        M
      </div>
      <div className="text-left leading-none">
        <span className="block text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight">MInT</span>
        <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Innovation &amp; Tech</span>
      </div>
    </div>
  </div>
);

export const EAIILogo: React.FC<{ className?: string; imgClassName?: string }> = ({
  className = '',
}) => (
  <div className={`${wrapperClass} ${className}`}>
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 text-white font-black text-xs">
        AI
      </div>
      <div className="text-left leading-none">
        <span className="block text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight">EAII</span>
        <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">AI Institute</span>
      </div>
    </div>
  </div>
);

// Backward-compatible badge export
export const PartnerLogoBadge: React.FC<{
  name: string;
  src?: string;
  className?: string;
}> = ({ name, src, className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    {src ? (
      <img src={src} alt={`${name} logo`} className="h-12 w-auto max-w-[140px] object-contain" />
    ) : (
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#003366] text-xs font-bold text-white">
        {name.slice(0, 2).toUpperCase()}
      </span>
    )}
  </div>
);

export const partnerLogos: Record<string, React.FC<{ className?: string; imgClassName?: string }>> = {
  'Ethio Telecom': EthioTelecomLogo,
  'INSA': INSALogo,
  'Ethiopian Airlines': EthiopianAirlinesLogo,
  'Safaricom': SafaricomLogo,
  'Safaricom Ethiopia': SafaricomLogo,
  'Huawei': HuaweiLogo,
  'Huawei Ethiopia': HuaweiLogo,
  'Commercial Bank of Ethiopia': CBELogo,
  'CBE': CBELogo,
  'Ministry of Innovation & Technology (MInT)': MInTLogo,
  'Ministry of Innovation and Technology': MInTLogo,
  'Artificial Intelligence Institute': EAIILogo,
  'Ethiopian Artificial Intelligence Institute': EAIILogo,
};
