const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
/** Backend origin, i.e. apiUrl without the trailing /api segment. */
const backendOrigin = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '')
  || apiUrl.replace(/\/api\/?$/, '')
  || 'http://localhost:5000';

/** Canonical public ASTU seal used when settings omit or supply an unusable logo. */
const DEFAULT_LOGO_PATH = '/images/astu-seal-logo.png';

/**
 * Turn a backend-stored media path into a loadable URL.
 *
 * Uploaded assets live on the backend (served from /uploads) while the app is
 * served by Vite on another port, so a bare "/uploads/..." path would resolve
 * against the dev server and 404. Absolute URLs are passed through untouched.
 *
 * Relative paths such as `images/foo.png` are normalised to root-absolute
 * `/images/foo.png` so nested React Router URLs do not break asset resolution.
 */
const mediaUrl = (raw?: string | null): string => {
  const value = (raw || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  let normalised = value.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalised) return '';
  if (normalised.startsWith('src/assets/imgs/') || normalised.startsWith('src/assets/images/')) {
    const filename = normalised.split('/').pop();
    return `/images/${filename}`;
  }
  if (normalised.startsWith('uploads/')) return `${backendOrigin}/${normalised}`;
  // Anything else (e.g. /images/...) is a bundled frontend asset.
  return `/${normalised}`;
};

/**
 * Resolve the site/navbar logo for any route depth.
 * Rejects placeholder Google CDN seeds and forces a root-absolute path.
 */
const resolveLogoUrl = (raw?: string | null): string => {
  const value = (raw || '').trim();
  if (!value || /googleusercontent|aida-public/i.test(value)) {
    return DEFAULT_LOGO_PATH;
  }
  return mediaUrl(value) || DEFAULT_LOGO_PATH;
};

const config = {
  apiUrl,
  backendOrigin,
  mediaUrl,
  resolveLogoUrl,
  DEFAULT_LOGO_PATH,
  appName: 'ASTU Alumni Management System',
  appShortName: 'ASTU-AMS',
  version: '1.0.0',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  upload: {
    maxFileSize: 5 * 1024 * 1024,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxFiles: 5,
  },
  auth: {
    tokenExpiry: 3600,
    refreshTokenExpiry: 604800,
    storageKey: 'authToken',
    refreshStorageKey: 'refreshToken',
    userStorageKey: 'user',
  },
  debounceDelay: 300,
  toastDuration: 4000,
};

export { mediaUrl, resolveLogoUrl, DEFAULT_LOGO_PATH };
export default config;
