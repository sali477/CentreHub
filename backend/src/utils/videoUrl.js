/** Validate external video lesson URLs (Google Drive, etc.) */
export const validateVideoUrl = (url) => {
  const trimmed = String(url || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'Video URL is required' };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, message: 'Invalid URL. Paste a full link starting with https://' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, message: 'URL must use http or https' };
  }

  const host = parsed.hostname.toLowerCase();
  const isGoogleDrive =
    host.includes('drive.google.com') ||
    host.includes('docs.google.com') ||
    host.includes('google.com');

  if (!isGoogleDrive) {
    return {
      valid: false,
      message: 'Please use a Google Drive link (drive.google.com or docs.google.com)',
    };
  }

  return { valid: true, url: trimmed };
};
