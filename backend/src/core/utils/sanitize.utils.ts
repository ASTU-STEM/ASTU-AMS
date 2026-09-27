/**
 * Helpers for putting user-controlled strings into HTML or URLs.
 *
 * Outbound email bodies are built by string interpolation, so any value that
 * originates from a request body or a user-editable profile field has to be
 * escaped first. Without this, a profile `fullName` of
 * `<img src=x onerror=...>` becomes live markup in the recipient's mail client.
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
  '/': '&#x2F;',
};

/** Escape a value for interpolation into HTML text or a quoted attribute. */
export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[&<>"'`/]/g, (c) => HTML_ENTITIES[c] ?? c);
}

/**
 * Return `candidate` only if it is an absolute http(s) URL with no credentials.
 *
 * This is what stops an attacker-supplied `meetingLink` from turning the
 * invitation button into a `javascript:` payload, a `data:` document, or a
 * `https://evil.example` credential-harvesting clone of the login page.
 */
export function sanitizeExternalUrl(candidate: unknown): string | null {
  if (typeof candidate !== 'string' || candidate.trim() === '') return null;
  let parsed: URL;
  try {
    parsed = new URL(candidate.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  if (parsed.username || parsed.password) return null;
  return parsed.toString();
}

/** Collapse a value to a single safe line, for use in email subject headers. */
export function sanitizeHeaderValue(input: unknown, maxLength = 120): string {
  if (input === null || input === undefined) return '';
  // Strip CR/LF so a value cannot inject extra headers, then flatten whitespace.
  return String(input)
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

const EMAIL_RE = /^[^\s@,;:<>()[\]\\"]+@[^\s@.,;:<>()[\]\\"]+(\.[^\s@.,;:<>()[\]\\"]+)+$/;

/** Pragmatic single-address check. Avoids depending on a validator here. */
export function isValidEmail(candidate: unknown): candidate is string {
  return typeof candidate === 'string' && candidate.length <= 254 && EMAIL_RE.test(candidate.trim());
}
