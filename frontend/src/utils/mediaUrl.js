/**
 * Resolve PDF (and other uploaded) URLs from API (Cloudinary or local /uploads paths).
 * Video lessons use external Google Drive URLs as-is.
 */
export const resolveMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}`;
};
