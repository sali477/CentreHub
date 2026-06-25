const PLACEHOLDER_VALUES = new Set([
  '',
  'your_google_maps_api_key',
  'your-google-maps-api-key',
  'xxx',
]);

export const getGoogleMapsApiKey = () =>
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

export const isGoogleMapsConfigured = () => {
  const key = getGoogleMapsApiKey();
  return key.length > 0 && !PLACEHOLDER_VALUES.has(key.toLowerCase());
};

export const GOOGLE_MAPS_SETUP_HINT =
  'Using OpenStreetMap (no API key). For Google Maps, add VITE_GOOGLE_MAPS_API_KEY to frontend/.env — see frontend/.env.example.';
