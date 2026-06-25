import Center from '../models/Center.js';
import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import {
  buildFlexibleSearch,
  buildPartialRegexFilter,
  buildDeliveryModeFilter,
  detectCityFromQuery,
  detectSubjectFromQuery,
  mergeFilters,
  attachDistance,
  escapeRegex,
} from '../utils/searchHelpers.js';

const CENTER_STRING_FIELDS = [
  'name',
  'description',
  'address.city',
  'address.neighborhood',
  'address.street',
  'address.state',
  'address.country',
];

const CENTER_POPULATE = [
  { path: 'owner', select: 'name email avatar' },
  {
    path: 'courses',
    select: 'title subject price thumbnail rating isPublished',
    match: { isPublished: true, isIndependent: false },
  },
];

const COURSE_POPULATE = [
  { path: 'teacher', populate: { path: 'user', select: 'name avatar' } },
  { path: 'center', select: 'name logo address deliveryMode' },
];

const TEACHER_POPULATE = [
  { path: 'user', select: 'name avatar email' },
  { path: 'center', select: 'name logo address rating deliveryMode' },
  {
    path: 'courses',
    select: 'title subject thumbnail rating isPublished',
    match: { isPublished: true, isIndependent: true },
  },
];

export const buildCourseSearchFilter = (query) => {
  if (!query?.trim()) return null;
  return buildFlexibleSearch(
    query,
    ['title', 'description', 'subject', 'level'],
    ['tags']
  );
};

const findMatchingUserIds = async (query) => {
  if (!query?.trim()) return [];
  const users = await User.find({
    name: { $regex: escapeRegex(query.trim()), $options: 'i' },
  })
    .select('_id')
    .limit(50)
    .lean();
  return users.map((u) => u._id);
};

const findCenterIdsFromCourses = async (query) => {
  const courseFilter = buildCourseSearchFilter(query);
  if (!courseFilter) return [];

  const ids = await Course.find({
    isPublished: true,
    ...courseFilter,
  }).distinct('center');

  return ids.filter(Boolean);
};

const findCenterIdsFromTeachers = async (query) => {
  if (!query?.trim()) return [];

  const userIds = await findMatchingUserIds(query);
  const orClauses = [];

  if (userIds.length) {
    orClauses.push({ user: { $in: userIds } });
  }

  const subjectFilter = buildFlexibleSearch(query, [], ['subjects', 'qualifications']);
  if (subjectFilter?.$or) orClauses.push(...subjectFilter.$or);
  else if (subjectFilter) orClauses.push(subjectFilter);

  if (!orClauses.length) return [];

  const teachers = await Teacher.find({
    isActive: true,
    $or: orClauses,
  })
    .select('center')
    .lean();

  return teachers.map((t) => t.center).filter(Boolean);
};

export const buildCenterTextFilter = (query, extraCenterIds = []) => {
  const orClauses = [];

  const textFilter = buildFlexibleSearch(query, CENTER_STRING_FIELDS, ['subjects']);

  if (textFilter?.$or) orClauses.push(...textFilter.$or);
  else if (textFilter) orClauses.push(textFilter);

  if (extraCenterIds.length) {
    orClauses.push({ _id: { $in: extraCenterIds } });
  }

  if (!orClauses.length) return null;
  return { $or: orClauses };
};

const buildLocationFilters = ({ city, neighborhood, search }) => {
  const filters = [];

  if (city?.trim()) {
    filters.push(buildPartialRegexFilter(city, 'address.city'));
  } else if (search?.trim()) {
    const detectedCity = detectCityFromQuery(search);
    if (detectedCity) {
      filters.push(buildPartialRegexFilter(detectedCity, 'address.city'));
    }
  }

  if (neighborhood?.trim()) {
    filters.push(buildPartialRegexFilter(neighborhood, 'address.neighborhood'));
  }

  return filters.filter(Boolean);
};

export const searchCenters = async ({
  search,
  lat,
  lng,
  radius = 50,
  limit = 20,
  page = 1,
  subject,
  rating,
  price,
  popularity,
  sort,
  useGeo = false,
  city,
  neighborhood,
  deliveryMode,
} = {}) => {
  const filters = [{ isActive: true }];

  const resolvedSubject = subject || detectSubjectFromQuery(search);
  if (resolvedSubject) filters.push({ subjects: { $in: [resolvedSubject] } });
  if (rating) filters.push({ rating: { $gte: parseFloat(rating) } });
  if (price) {
    const [min, max] = String(price).split('-').map(Number);
    filters.push({
      'priceRange.min': { $gte: min || 0 },
      'priceRange.max': { $lte: max || Infinity },
    });
  }

  const deliveryFilter = buildDeliveryModeFilter(deliveryMode);
  if (deliveryFilter) filters.push(deliveryFilter);

  filters.push(...buildLocationFilters({ city, neighborhood, search }));

  if (search?.trim()) {
    const [courseCenterIds, teacherCenterIds] = await Promise.all([
      findCenterIdsFromCourses(search),
      findCenterIdsFromTeachers(search),
    ]);
    const extraIds = [...new Set([...courseCenterIds, ...teacherCenterIds].map(String))];
    const searchFilter = buildCenterTextFilter(search, extraIds);
    if (searchFilter) filters.push(searchFilter);
  }

  const baseFilter = mergeFilters(...filters);
  const limitNum = parseInt(limit, 10) || 20;
  const skip = ((parseInt(page, 10) || 1) - 1) * limitNum;
  const radiusKm = parseFloat(radius) || 50;
  const hasGeo = useGeo && lat != null && lng != null;

  let query = Center.find(baseFilter);

  if (hasGeo) {
    query = query.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: radiusKm * 1000,
        },
      },
    });
  } else if (popularity === 'true' || popularity === true) {
    query = query.sort('-popularity');
  } else if (sort) {
    query = query.sort(sort.split(',').join(' '));
  } else {
    query = query.sort('-rating -popularity');
  }

  let centers = await query.skip(skip).limit(limitNum).populate(CENTER_POPULATE);

  if (hasGeo) {
    centers = attachDistance(centers, lat, lng);
  }

  const total = await Center.countDocuments(baseFilter);

  return {
    data: centers,
    total,
    page: parseInt(page, 10) || 1,
    pages: Math.ceil(total / limitNum) || 1,
    count: centers.length,
  };
};

export const searchCourses = async ({
  search,
  limit = 20,
  page = 1,
  subject,
  center,
  teacher,
  rating,
  sort,
  city,
  independentOnly = false,
} = {}) => {
  const filters = [{ isPublished: true }];

  const resolvedSubject = subject || detectSubjectFromQuery(search);
  if (resolvedSubject) filters.push({ subject: resolvedSubject });
  if (teacher) filters.push({ teacher });

  if (center) {
    filters.push({ center });
    filters.push({ isIndependent: false });
  } else if (independentOnly) {
    filters.push({ isIndependent: true });
  }

  if (rating) filters.push({ rating: { $gte: parseFloat(rating) } });

  if (search?.trim()) {
    const searchFilter = buildCourseSearchFilter(search);
    if (searchFilter) filters.push(searchFilter);
  }

  if (city?.trim() && !independentOnly) {
    const cityCenters = await Center.find(
      buildPartialRegexFilter(city, 'address.city') || {}
    )
      .select('_id')
      .lean();
    const centerIds = cityCenters.map((c) => c._id);
    filters.push({ center: { $in: centerIds.length ? centerIds : [null] } });
  }

  const baseFilter = mergeFilters(...filters);
  const limitNum = parseInt(limit, 10) || 20;
  const skip = ((parseInt(page, 10) || 1) - 1) * limitNum;

  let query = Course.find(baseFilter);

  if (sort) {
    query = query.sort(sort.split(',').join(' '));
  } else {
    query = query.sort('-rating -popularity');
  }

  const courses = await query.skip(skip).limit(limitNum).populate(COURSE_POPULATE);
  const total = await Course.countDocuments(baseFilter);

  return {
    data: courses,
    total,
    page: parseInt(page, 10) || 1,
    pages: Math.ceil(total / limitNum) || 1,
    count: courses.length,
  };
};

export const searchTeachers = async ({
  search,
  limit = 12,
  page = 1,
  subject,
  rating,
  city,
} = {}) => {
  const filters = [{ isActive: true }];

  const resolvedSubject = subject || detectSubjectFromQuery(search);
  if (resolvedSubject) filters.push({ subjects: { $in: [resolvedSubject] } });
  if (rating) filters.push({ rating: { $gte: parseFloat(rating) } });

  if (search?.trim()) {
    const userIds = await findMatchingUserIds(search);
    const orClauses = [];

    if (userIds.length) {
      orClauses.push({ user: { $in: userIds } });
    }

    const textFilter = buildFlexibleSearch(search, [], ['subjects', 'qualifications']);
    if (textFilter?.$or) orClauses.push(...textFilter.$or);
    else if (textFilter) orClauses.push(textFilter);

    const courseFilter = buildCourseSearchFilter(search);
    if (courseFilter) {
      const courseTeachers = await Course.find({
        isPublished: true,
        ...courseFilter,
      }).distinct('teacher');
      if (courseTeachers.length) {
        orClauses.push({ _id: { $in: courseTeachers } });
      }
    }

    if (orClauses.length) filters.push({ $or: orClauses });
  }

  if (city?.trim()) {
    const cityCenters = await Center.find(
      buildPartialRegexFilter(city, 'address.city') || {}
    )
      .select('_id')
      .lean();
    const centerIds = cityCenters.map((c) => c._id);
    filters.push({ center: { $in: centerIds.length ? centerIds : [null] } });
  }

  const baseFilter = mergeFilters(...filters);
  const limitNum = parseInt(limit, 10) || 12;
  const skip = ((parseInt(page, 10) || 1) - 1) * limitNum;

  const teachers = await Teacher.find(baseFilter)
    .sort('-rating -numReviews')
    .skip(skip)
    .limit(limitNum)
    .populate(TEACHER_POPULATE);

  const total = await Teacher.countDocuments(baseFilter);

  return {
    data: teachers,
    total,
    page: parseInt(page, 10) || 1,
    pages: Math.ceil(total / limitNum) || 1,
    count: teachers.length,
  };
};

export const globalSearch = async ({
  q,
  lat,
  lng,
  radius = 50,
  limit = 12,
  page = 1,
  useGeo = false,
  subject,
  rating,
  price,
  popularity,
  city,
  neighborhood,
  deliveryMode,
} = {}) => {
  const search = String(q || '').trim();
  const shared = {
    search,
    lat,
    lng,
    radius,
    limit,
    page,
    useGeo,
    subject,
    rating,
    price,
    popularity,
    city,
    neighborhood,
    deliveryMode,
  };

  const [centersResult, coursesResult, teachersResult] = await Promise.all([
    searchCenters({ ...shared, limit: Math.max(limit, 12) }),
    searchCourses({ ...shared, limit, independentOnly: true }),
    searchTeachers({ ...shared, limit: Math.min(limit, 8) }),
  ]);

  return {
    centers: centersResult.data,
    courses: coursesResult.data,
    teachers: teachersResult.data,
    meta: {
      centerCount: centersResult.total,
      courseCount: coursesResult.total,
      teacherCount: teachersResult.total,
      locationUsed: Boolean(useGeo && lat != null && lng != null),
      radiusKm: parseFloat(radius) || 50,
      detectedCity: city || detectCityFromQuery(search) || null,
      detectedSubject: subject || detectSubjectFromQuery(search) || null,
    },
  };
};
