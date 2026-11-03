import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  QrCode,
  Sparkles,
  ExternalLink,
  Smartphone,
  TrendingUp,
  Heart,
} from 'lucide-react';
import {
  FaTelegram,
  FaLinkedin,
  FaWhatsapp,
  FaTwitter,
  FaFacebook,
  FaEnvelope,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface CampaignPreview {
  id: string;
  title: string;
  category?: string;
  description?: string;
  raised?: number;
  goal?: number;
  donorCount?: number;
  image?: string;
  contentType?: string;
  url?: string;
}

interface ShareCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CampaignPreview | null;
}

export default function ShareCampaignModal({
  isOpen,
  onClose,
  campaign,
}: ShareCampaignModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setShowQR(false);
    }
  }, [isOpen]);

  if (!isOpen || !campaign) return null;

  // Build the direct shareable campaign URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://astu-ams.et';
  const shareUrl = campaign.url
    ? (campaign.url.startsWith('http') ? campaign.url : `${origin}${campaign.url}`)
    : `${origin}/donations?cause=${encodeURIComponent(campaign.id)}`;

  const percent = campaign.goal && campaign.goal > 0
    ? Math.min(100, Math.round(((campaign.raised || 0) / campaign.goal) * 100))
    : 0;

  const shareText = `Support "${campaign.title}" at Adama Science and Technology University (ASTU). Every contribution empowers our student engineers, postgraduate research labs, and innovators:`;

  const handleCopyLink = async () => {
    let success = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        success = true;
      }
    } catch {
      // Fall through to fallback
    }

    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopied(true);
      toast.success('Campaign link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error('Could not copy link automatically. Please select and copy manually.');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `ASTU Giving: ${campaign.title}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const socialChannels = [
    {
      name: 'Telegram',
      icon: FaTelegram,
      bgColor: 'bg-[#229ED9] hover:bg-[#1d8ec4]',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      badge: 'Popular in ET',
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      bgColor: 'bg-[#0A66C2] hover:bg-[#084e96]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      badge: 'Alumni Network',
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      bgColor: 'bg-[#25D366] hover:bg-[#1ebc59]',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      badge: 'Direct Message',
    },
    {
      name: 'X (Twitter)',
      icon: FaTwitter,
      bgColor: 'bg-slate-900 dark:bg-black hover:bg-slate-800',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}&hashtags=ASTUGiving,ASTUAlumni,EthiopiaSTEM`,
      badge: 'Post Update',
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      bgColor: 'bg-[#1877F2] hover:bg-[#1464cc]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      badge: 'Community',
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      bgColor: 'bg-slate-700 hover:bg-slate-800',
      url: `mailto:?subject=${encodeURIComponent('ASTU Initiative: ' + campaign.title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
      badge: 'Colleagues',
    },
  ];

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareUrl)}&margin=10`;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-astu-navy via-[#003875] to-blue-800 p-5 sm:p-6 text-white relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-sky-300">
                <Share2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 block">
                  Spread The Word
                </span>
                <h3 className="text-base font-black text-white leading-tight">
                  Share This Cause
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/15 transition-colors text-white/80 hover:text-white"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-white/80 leading-relaxed max-w-md">
            Invite your fellow alumni, colleagues, and friends to support this critical ASTU initiative.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Campaign Preview Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-3.5 flex items-center gap-3.5 shadow-2xs">
            {campaign.image ? (
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shrink-0 font-black text-lg">
                ASTU
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                {campaign.category && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-sky-950/60 dark:text-sky-300 border border-blue-200 dark:border-sky-800">
                    {campaign.category}
                  </span>
                )}
                <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {percent}% funded
                </span>
              </div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                {campaign.title}
              </h4>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                {(campaign.raised || 0).toLocaleString()} ETB raised
                {campaign.goal ? ` of ${campaign.goal.toLocaleString()} ETB` : ''}
              </p>
            </div>
          </div>

          {/* Social Channels 1-Click Sharing Grid */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              1-Click Social Sharing
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {socialChannels.map((ch) => {
                const Icon = ch.icon;
                return (
                  <a
                    key={ch.name}
                    href={ch.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group/ch flex items-center gap-2.5 p-2.5 rounded-xl text-white ${ch.bgColor} shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs font-black cursor-pointer`}
                  >
                    <Icon className="h-4 w-4 shrink-0 group-hover/ch:scale-110 transition-transform" />
                    <div className="min-w-0 text-left">
                      <p className="truncate leading-tight">{ch.name}</p>
                      <p className="text-[9px] text-white/70 font-medium truncate">{ch.badge}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Direct Link Copy Bar */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
              Direct Campaign Share Link
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 truncate"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                    : 'bg-astu-navy dark:bg-sky-600 hover:bg-[#003875] text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* QR Code & Mobile Share Actions */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowQR(!showQR)}
                className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
              >
                <QrCode className="h-4 w-4 text-blue-600 dark:text-sky-400" />
                <span>{showQR ? 'Hide QR Code' : 'Show QR Code (Scan to Give)'}</span>
              </button>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-blue-600 dark:text-sky-400 hover:underline"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Device Share</span>
                </button>
              )}
            </div>

            {showQR && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 text-center space-y-2 animate-in fade-in duration-200">
                <div className="inline-block p-2 bg-white rounded-xl shadow-md border border-slate-200">
                  <img
                    src={qrCodeUrl}
                    alt="Campaign QR Code"
                    className="w-36 h-36 mx-auto object-contain"
                  />
                </div>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Scan with your smartphone camera to open directly
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Ideal for live events, campus presentations, and alumni reunions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            100% Directed Impact to ASTU
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
