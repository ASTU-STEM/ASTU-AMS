import toast from 'react-hot-toast';

export type SharePayload = {
  title: string;
  text?: string;
  /** Absolute or site-relative path. Defaults to the current page URL. */
  url?: string;
  successMessage?: string;
};

/**
 * Build a shareable absolute URL. Prefer the provided path; otherwise use the
 * current location. Relative paths are resolved against window.location.origin.
 */
export function buildShareUrl(pathOrUrl?: string): string {
  if (typeof window === 'undefined') {
    return pathOrUrl || '';
  }
  const raw = (pathOrUrl || window.location.href).trim();
  if (!raw) return window.location.href;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return `${window.location.origin}${raw}`;
  return `${window.location.origin}/${raw.replace(/^\/+/, '')}`;
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to legacy path.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Copy a link with confirmed success/error feedback. Never claims success on failure.
 */
export async function copyShareLink(
  pathOrUrl?: string,
  successMessage = 'Link copied to clipboard'
): Promise<boolean> {
  const url = buildShareUrl(pathOrUrl);
  const ok = await writeClipboard(url);
  if (ok) {
    toast.success(successMessage);
    return true;
  }
  toast.error('Could not copy link. Select and copy it manually.');
  window.prompt('Copy this link:', url);
  return false;
}

/**
 * Prefer the native Web Share API; fall back to copy-link when unavailable or cancelled.
 */
export async function shareContent(payload: SharePayload): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  const url = buildShareUrl(payload.url);
  const title = payload.title || 'ASTU Alumni';
  const text = payload.text || title;

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (err: unknown) {
      const name = err && typeof err === 'object' && 'name' in err ? String((err as { name: string }).name) : '';
      if (name === 'AbortError') return 'cancelled';
      // Continue to clipboard fallback for unsupported payloads / insecure contexts.
    }
  }

  const copied = await copyShareLink(url, payload.successMessage);
  return copied ? 'copied' : 'failed';
}

export function openSocialShare(
  network: 'telegram' | 'linkedin' | 'whatsapp' | 'twitter' | 'facebook' | 'email',
  payload: SharePayload
): void {
  const url = buildShareUrl(payload.url);
  const text = payload.text || payload.title;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const targets: Record<typeof network, string> = {
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent(payload.title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
  };

  window.open(targets[network], '_blank', 'noopener,noreferrer');
}
