import React from 'react';

const wrapperClass = 'flex h-14 w-auto items-center justify-center rounded-lg p-2';
const imgClass =
  'max-h-12 w-auto max-w-[130px] object-contain transition-transform duration-700 hover:scale-110';
const fallbackClass =
  'flex h-12 w-12 items-center justify-center rounded-lg text-white text-xs font-bold shadow-md';

interface PartnerInfo {
  name: string;
  image?: string;
  bgColor: string;
}

const partnersList: PartnerInfo[] = [
  { name: "Ethio Telecom", image: "ethio-telecom.png", bgColor: "#003399" },
  { name: "INSA", image: "insa.png", bgColor: "#1a1a2e" },
  { name: "Ethiopian Airlines", image: "ethiopian-airlines.svg", bgColor: "#00843D" },
  { name: "Safaricom", image: "safaricom.png", bgColor: "#00A651" },
  { name: "Huawei", image: "huawei.svg", bgColor: "#CF0A2C" },
  { name: "Commercial Bank of Ethiopia", image: "cbe.png", bgColor: "#1B2A4A" },
  { name: "Ministry of Transport and Logistics", image: "motl.svg", bgColor: "#0D3B66" },
  { name: "Ethiopian Aviation University", image: "eau.png", bgColor: "#1B3A5C" },
  { name: "Ethiopian Conformity Assessment Enterprise (ECAE)", image: "ecae.png", bgColor: "#2C5282" },
  { name: "Oromia Industrial Parks Development Corporation", image: "oipdc.png", bgColor: "#1E5631" },
  { name: "Adama Industrial Park", bgColor: "#2B6CB0" },
  { name: "Industrial Project Service (IPS)", image: "ips.png", bgColor: "#234E70" },
  { name: "AMG Steel Factory", image: "amg.png", bgColor: "#0c8341" },
  { name: "ETG Designers and Consultants Share Company", image: "etg.png", bgColor: "#1A365D" },
  { name: "Sky Win Aeronautics Industry", image: "skywin.jpg", bgColor: "#1E3A5F" },
  { name: "Ethiopian Civil Service University", image: "ecsu.png", bgColor: "#276749" },
  { name: "Ethiopian Police University", image: "epu.png", bgColor: "#1A365D" },
  { name: "Addis Ababa Science and Technology University", image: "aastu_logo.jpeg", bgColor: "#8B1A1A" },
  { name: "Addis Ababa University", image: "aau.svg", bgColor: "#1B2A4A" },
  { name: "Jimma University", image: "jimma_u.jpeg", bgColor: "#2E7D32" },
  { name: "Adigrat University", image: "adigrat.png", bgColor: "#1565C0" },
  { name: "Debre Berhan University", image: "dbu.png", bgColor: "#1B5E20" },
  { name: "Mada Walabu University", image: "madawalabu.png", bgColor: "#2E7D32" },
  { name: "Ambo University", image: "ambo.png", bgColor: "#0D47A1" },
  { name: "Wollega University", image: "wollega.png", bgColor: "#1B5E20" },
  { name: "Hawassa University", image: "hu.png", bgColor: "#2E7D32" },
  { name: "Hubei University of Technology (China)", image: "hbut.png", bgColor: "#B71C1C" },
  { name: "JinkoSolar Holding Co. (China)", image: "jinkosolar.png", bgColor: "#1565C0" },
  { name: "China-Africa Innovation Cooperation Alliance", image: "caicc.jpeg", bgColor: "#C62828" },
  { name: "HTW Berlin (Germany)", image: "htw.png", bgColor: "#004D99" },
  { name: "IHE Delft (Netherlands)", image: "ihe.png", bgColor: "#003D6B" },
  { name: "Makerere University (Uganda)", image: "mak.png", bgColor: "#1B5E20" },
  { name: "University of Juba (South Sudan)", image: "juba.png", bgColor: "#0D47A1" },
  { name: "Meru University of Science and Technology (Kenya)", image: "meru.png", bgColor: "#1565C0" },
  { name: "Lake Chad Basin Commission (Chad)", image: "lcbc.png", bgColor: "#004D99" },
  { name: "ATREE (India)", image: "atree.png", bgColor: "#2E7D32" },
  { name: "FRENASAP (Costa Rica)", bgColor: "#2E7D32" },
];

const brandBg: Record<string, string> = {};
partnersList.forEach(p => { brandBg[p.name] = p.bgColor; });

const PartnerLogo: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => {
  const partner = partnersList.find(p => p.name === name);

  if (partner?.image) {
    return (
      <div
        className={`${wrapperClass} ${className}`}
        style={{ backgroundColor: partner.bgColor }}
      >
        <img src={`/images/partners/${partner.image}`} alt={name} className={imgClass} />
      </div>
    );
  }

  return (
    <div className={`${wrapperClass} ${className}`}>
      <div className={fallbackClass} style={{ backgroundColor: partner?.bgColor ?? '#1B2A4A' }}>
        {name.slice(0, 2).toUpperCase()}
      </div>
    </div>
  );
};

export const partnerLogos: Record<string, React.FC<{ className?: string }>> = {};
partnersList.forEach(p => {
  partnerLogos[p.name] = ({ className }) => <PartnerLogo name={p.name} className={className} />;
});

export const partnersListData = partnersList;
export { brandBg };
