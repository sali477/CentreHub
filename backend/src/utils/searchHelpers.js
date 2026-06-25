import { MOROCCO_CITIES, SUBJECTS } from './searchConstants.js';

export const escapeRegex = (value = '') =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const parseSearchTerms = (query) =>
  String(query || '')
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);

/**
 * Each term must match at least one field (partial, case-insensitive).
 */
export const buildMultiFieldSearch = (query, fields = []) => {
  const terms = parseSearchTerms(query);
  if (!terms.length || !fields.length) return null;

  return {
    $and: terms.map((term) => {
      const regex = { $regex: escapeRegex(term), $options: 'i' };
      return { $or: fields.map((field) => ({ [field]: regex })) };
    }),
  };
};

/**
 * Full-query partial match on any field, plus multi-term AND for better accuracy.
 */
export const buildFlexibleSearch = (query, stringFields = [], arrayFields = []) => {
  const trimmed = String(query || '').trim();
  if (!trimmed) return null;

  const fields = [...stringFields, ...arrayFields];
  const fullRegex = { $regex: escapeRegex(trimmed), $options: 'i' };

  const orConditions = [
    ...stringFields.map((field) => ({ [field]: fullRegex })),
    ...arrayFields.map((field) => ({ [field]: fullRegex })),
  ];

  const termAnd = buildMultiFieldSearch(trimmed, fields);
  if (termAnd && parseSearchTerms(trimmed).length > 1) {
    return { $or: [...orConditions, termAnd] };
  }

  return orConditions.length ? { $or: orConditions } : null;
};

export const buildPartialRegexFilter = (value, field) => {
  if (!value?.trim()) return null;
  return { [field]: { $regex: escapeRegex(value.trim()), $options: 'i' } };
};

export const buildDeliveryModeFilter = (deliveryMode) => {
  if (!deliveryMode || deliveryMode === 'all') return null;

  if (deliveryMode === 'online') {
    return { deliveryMode: { $in: ['online', 'hybrid'] } };
  }

  if (deliveryMode === 'physical') {
    return { deliveryMode: { $in: ['physical', 'hybrid'] } };
  }

  return { deliveryMode };
};

export const detectCityFromQuery = (query = '') => {
  const trimmed = String(query).trim().toLowerCase();
  if (!trimmed) return null;

  return (
    MOROCCO_CITIES.find(
      (city) =>
        city.toLowerCase() === trimmed ||
        trimmed === city.toLowerCase().replace(/\s+/g, '')
    ) || null
  );
};

export const detectSubjectFromQuery = (query = '') => {
  const trimmed = String(query).trim().toLowerCase();
  if (!trimmed) return null;

  return (
    SUBJECTS.find(
      (subject) =>
        subject.toLowerCase() === trimmed ||
        subject.toLowerCase().includes(trimmed) ||
        trimmed.includes(subject.toLowerCase())
    ) || null
  );
};

export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const attachDistance = (items, lat, lng) => {
  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  if (Number.isNaN(userLat) || Number.isNaN(userLng)) return items;

  return items
    .map((item) => {
      const doc = item.toObject ? item.toObject() : { ...item };
      const coords = doc.location?.coordinates;
      if (!coords || coords.length < 2) {
        return { ...doc, distanceKm: null };
      }

      const distanceKm = haversineKm(userLat, userLng, coords[1], coords[0]);
      return { ...doc, distanceKm: Math.round(distanceKm * 10) / 10 };
    })
    .sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
};

export const mergeFilters = (...filters) => {
  const active = filters.filter(Boolean);
  if (!active.length) return {};
  if (active.length === 1) return active[0];
  return { $and: active };
};

export const isNearMeQuery = (query = '') => {
  const q = String(query).toLowerCase();
  return /\b(near me|nearby|close to me|around me|près de moi|proche)\b/.test(q);
};
