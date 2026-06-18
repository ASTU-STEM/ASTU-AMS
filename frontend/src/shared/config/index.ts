const config = {
  apiUrl: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
