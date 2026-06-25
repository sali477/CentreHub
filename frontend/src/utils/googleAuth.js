const PLACEHOLDER_VALUES = new Set([
  '',
  'your_google_client_id',
  'your-google-client-id',
  'your_google_client_id.apps.googleusercontent.com',
]);

export const getGoogleClientId = () =>
  (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

export const isGoogleAuthConfigured = () => {
  const id = getGoogleClientId();
  return id.length > 0 && !PLACEHOLDER_VALUES.has(id.toLowerCase());
};

export const GOOGLE_AUTH_SETUP_HINT =
  'Google Sign-In is not configured. Add VITE_GOOGLE_CLIENT_ID to frontend/.env and GOOGLE_CLIENT_ID to backend/.env (Google Cloud Console → OAuth 2.0 Client ID). Restart both servers after editing.';
