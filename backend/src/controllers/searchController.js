import asyncHandler from 'express-async-handler';
import { globalSearch } from '../services/searchService.js';
import { isNearMeQuery } from '../utils/searchHelpers.js';

const parseSearchFilters = (query) => ({
  subject: query.subject || '',
  rating: query.rating || '',
  price: query.price || '',
  popularity: query.popularity || '',
  city: query.city || '',
  neighborhood: query.neighborhood || '',
  deliveryMode: query.deliveryMode || '',
});

// @desc    Search centers, courses, and teachers
// @route   GET /api/search
export const searchAll = asyncHandler(async (req, res) => {
  const q = req.query.q || req.query.search || '';
  const lat = req.query.lat;
  const lng = req.query.lng;
  const radius = req.query.radius || req.query.distance || 50;
  const limit = req.query.limit || 12;
  const page = req.query.page || 1;
  const filters = parseSearchFilters(req.query);

  const useGeo =
    req.query.near === 'true' ||
    req.query.nearMe === 'true' ||
    (lat && lng && (req.query.useGeo === 'true' || isNearMeQuery(q) || !String(q).trim()));

  const hasFilters = Object.values(filters).some(Boolean);

  if (!q.trim() && !useGeo && !hasFilters) {
    return res.json({
      success: true,
      query: q,
      data: { centers: [], courses: [], teachers: [] },
      meta: {
        centerCount: 0,
        courseCount: 0,
        teacherCount: 0,
        locationUsed: false,
      },
    });
  }

  const result = await globalSearch({
    q,
    lat,
    lng,
    radius,
    limit,
    page,
    useGeo,
    ...filters,
  });

  res.json({
    success: true,
    query: q,
    data: result,
    meta: result.meta,
  });
});
