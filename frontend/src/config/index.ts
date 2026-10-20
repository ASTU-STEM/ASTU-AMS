const API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/** Origin that serves uploaded files (the API URL without its trailing /api). */
export const apiOrigin = API_URL.replace(/\/api\/?$/, '');

/**
 * Resolve a CMS-managed media path to something the browser can load.
 *
 * CMS authors store a mix of absolute URLs, bundled public assets
 * (`/images/...`) and backend uploads (`/uploads/...`). Only the uploads live
 * on the API origin, so prefixing everything would break bundled art, while
 * prefixing nothing leaves uploaded images broken off-origin.
 */
export const mediaUrl = (path?: string | null): string => {
  if (!path) return '';
  const value = String(path).trim();
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value;
  }
  if (value.startsWith('/uploads/')) return `${apiOrigin}${value}`;
  return value;
};

const config = {
  apiUrl: API_URL,
  apiOrigin,
  mediaUrl,
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

export default config;
