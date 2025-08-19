const getApiBaseUrl = () => {
  // Avoid referencing window in SSR and pass linter
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).__API_BASE_URL__) {
      return (globalThis as any).__API_BASE_URL__;
    }
  } catch {}
  return 'http://localhost:3001';
};

export const environment = {
  // PUBLIC_INTERFACE
  // Backend base URL. Configure via .env at deploy time; for local dev, change here if needed.
  // For CI/preview environments, a reverse-proxy or same-origin dev server is recommended.
  apiBaseUrl: getApiBaseUrl(),
  // PUBLIC_INTERFACE
  // Local storage key for JWT
  tokenKey: 'ttt_jwt_token'
};
