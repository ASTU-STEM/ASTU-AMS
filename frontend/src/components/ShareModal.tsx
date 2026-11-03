import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  QrCode,
  Sparkles,
  Smartphone,
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

export interface ShareItem {
  id?: string;
  title: string;
  subtitle?: string;
  text?: string;
  url?: string;
  image?: string;
  badge?: string;
  type?: 'story' | 'event' | 'announcement' | 'page' | 'cause' | 'gallery' | 'video';
}

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShareItem | null;
}

export default function ShareModal({ isOpen, onClose, item }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setShowQR(false);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://astu-ams.et';
  const shareUrl = item.url
    ? item.url.startsWith('http')
      ? item.url
      : `${origin}${item.url}`
    : typeof window !== 'undefined'
    ? window.location.href
    : origin;

  const typeLabel =
    item.type === 'story'
      ? 'Alumni Success Story'
      : item.type === 'event'
      ? 'ASTU Event & Workshop'
      : item.type === 'announcement'
      ? 'ASTU Announcement'
      : item.type === 'cause'
      ? 'ASTU Giving Campaign'
      : item.type === 'gallery'
      ? 'Campus Photo & Moment'
      : item.type === 'video'
      ? 'ASTU Video Highlight'
      : 'ASTU Alumni Portal';

  const shareText =
    item.type === 'story'
      ? `Inspiring journey of ${item.title} (${item.subtitle || 'ASTU Alumnus'}) on the Adama Science and Technology University Alumni Portal:`
      : item.type === 'event'
      ? `Check out "${item.title}" at Adama Science and Technology University (ASTU):`
      : item.type === 'announcement'
      ? `Official ASTU announcement: "${item.title}"`
      : item.type === 'video'
      ? `Watch video highlight: "${item.title}" from Adama Science and Technology University:`
      : item.type === 'gallery'
      ? `Campus moment: "${item.title}" at Adama Science and Technology University:`
      : `Check out "${item.title}" on the Adama Science and Technology University (ASTU) Alumni Portal:`;

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
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error('Could not copy link to clipboard');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: item.title,
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

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${shareText}\n\n${shareUrl}`);

  const socialChannels = [
    {
      name: 'Telegram',
      badge: 'Popular in ET',
      icon: FaTelegram,
      bgColor: 'bg-[#229ED9] hover:bg-[#1a85b8]',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'LinkedIn',
      badge: 'Professional',
      icon: FaLinkedin,
      bgColor: 'bg-[#0077b5] hover:bg-[#005f93]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'WhatsApp',
      badge: 'Direct Message',
      icon: FaWhatsapp,
      bgColor: 'bg-[#25D366] hover:bg-[#1ea851]',
      url: `https://api.whatsapp.com/send?text=${encodedText}`,
    },
    {
      name: 'X (Twitter)',
      badge: 'Global Feed',
      icon: FaTwitter,
      bgColor: 'bg-[#1DA1F2] hover:bg-[#1785c7]',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      badge: 'Community',
      icon: FaFacebook,
      bgColor: 'bg-[#1877F2] hover:bg-[#1460c4]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Email',
      badge: 'Colleagues',
      icon: FaEnvelope,
      bgColor: 'bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600',
      url: `mailto:?subject=${encodeURIComponent(item.title)}&body=${encodedText}`,
    },
  ];

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    shareUrl
  )}&margin=10`;

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
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-sky-300 shadow-xs">
                <Share2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 block">
                  Spread The Word
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  Share {typeLabel}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/15 transition-colors text-white/80 hover:text-white cursor-pointer"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-white/80 leading-relaxed max-w-md">
            Share this achievement and impact across the university network, colleagues, and social channels.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Item Preview Card */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-4 flex items-center gap-3.5 shadow-2xs">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/astu-building.jpg';
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-astu-navy to-blue-700 flex items-center justify-center text-white shrink-0 font-black text-lg shadow-xs">
                {item.title ? item.title.slice(0, 2).toUpperCase() : 'ASTU'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                {item.badge && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-sky-950/60 dark:text-sky-300 border border-blue-200 dark:border-sky-800">
                    {item.badge}
                  </span>
                )}
                <span className="text-[10px] font-bold text-astu-green dark:text-emerald-400 flex items-center gap-1">
                  Verified ASTU
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                {item.title}
              </h4>
              {item.subtitle && (
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate mt-0.5">
                  {item.subtitle}
                </p>
              )}
              {item.text && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic mt-1">
                  &ldquo;{item.text}&rdquo;
                </p>
              )}
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
                    className={`group/ch flex items-center gap-2.5 p-2.5 rounded-xl text-white ${ch.bgColor} shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all text-xs font-black cursor-pointer`}
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
              Direct Share Link
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
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Device Native Share & QR Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <Smartphone className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400" />
                <span>Share via Device Menu</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowQR((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors cursor-pointer ml-auto"
            >
              <QrCode className="h-3.5 w-3.5 text-slate-500" />
              <span>{showQR ? 'Hide QR Code' : 'Show QR Code'}</span>
            </button>
          </div>

          {/* QR Code Container */}
          {showQR && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-center space-y-3 animate-in fade-in-50 zoom-in-95 duration-200">
              <div className="inline-block p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-44 h-44 object-contain mx-auto"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Scan with any smartphone camera to view this story directly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
