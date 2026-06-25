/** Validate Google Drive video lesson URLs */
export const validateVideoUrl = (url) => {
  const trimmed = String(url || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'Video URL is required' };
  }

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, message: 'Invalid URL. Paste a full Google Drive link (https://...)' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, message: 'URL must start with https://' };
  }

  const host = parsed.hostname.toLowerCase();
  const isGoogleDrive =
    host.includes('drive.google.com') ||
    host.includes('docs.google.com');

  if (!isGoogleDrive) {
    return {
      valid: false,
      message: 'Please use a Google Drive link (drive.google.com)',
    };
  }

  return { valid: true, url: trimmed };
};

/** Open external video URL in a new tab (Google Drive or any https link) */
export const openVideoLesson = (video) => {
  const url = video?.url?.trim();
  if (!url) {
    return { ok: false, message: 'This lesson has no video link. Contact your instructor.' };
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { ok: false, message: 'Invalid video link.' };
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    return { ok: true };
  } catch {
    return { ok: false, message: 'Invalid video link.' };
  }
};
