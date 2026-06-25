import {
  FiCode,
  FiTrendingUp,
  FiGlobe,
  FiBook,
  FiBriefcase,
  FiPenTool,
  FiMusic,
  FiImage,
  FiTarget,
} from 'react-icons/fi';

export const MOROCCO_CITIES = [
  'All cities',
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fes',
  'Tangier',
  'Agadir',
  'Meknes',
  'Oujda',
  'Kenitra',
  'Tetouan',
];

export const QUICK_FILTERS = [
  { labelKey: 'home.quickFilters.programming', value: 'Programming' },
  { labelKey: 'home.quickFilters.languages', value: 'Languages' },
  { labelKey: 'home.quickFilters.mathematics', value: 'Mathematics' },
  { labelKey: 'home.quickFilters.physics', value: 'Physics' },
  { labelKey: 'home.quickFilters.science', value: 'Science' },
];

export const CATEGORY_ITEMS = [
  { nameKey: 'home.categories.programming', searchValue: 'Programming', icon: FiCode, countKey: 'home.categories.coursesCount', countValue: '120' },
  { nameKey: 'home.categories.mathematics', searchValue: 'Mathematics', icon: FiTrendingUp, countKey: 'home.categories.coursesCount', countValue: '85' },
  { nameKey: 'home.categories.languages', searchValue: 'Languages', icon: FiGlobe, countKey: 'home.categories.coursesCount', countValue: '200' },
  { nameKey: 'home.categories.science', searchValue: 'Science', icon: FiBook, countKey: 'home.categories.coursesCount', countValue: '90' },
  { nameKey: 'home.categories.business', searchValue: 'Business', icon: FiBriefcase, countKey: 'home.categories.coursesCount', countValue: '60' },
  { nameKey: 'home.categories.design', searchValue: 'Design', icon: FiPenTool, countKey: 'home.categories.coursesCount', countValue: '45' },
  { nameKey: 'home.categories.music', searchValue: 'Music', icon: FiMusic, countKey: 'home.categories.coursesCount', countValue: '30' },
  { nameKey: 'home.categories.art', searchValue: 'Art', icon: FiImage, countKey: 'home.categories.coursesCount', countValue: '25' },
  { nameKey: 'home.categories.testPrep', searchValue: 'Test Preparation', icon: FiTarget, countKey: 'home.categories.coursesCount', countValue: '70' },
];

export const TESTIMONIALS = [
  {
    quote:
      'CentreHub helped me find the perfect coding bootcamp in Casablanca. The search was fast and the reviews were trustworthy.',
    name: 'Yasmine B.',
    role: 'Computer Science Student',
    city: 'Casablanca',
  },
  {
    quote:
      'As a teacher, I grew my student base by 3x in six months. The platform feels premium and professional.',
    name: 'Karim E.',
    role: 'English Instructor',
    city: 'Rabat',
  },
  {
    quote:
      'We listed our center and started receiving qualified leads within days. Best education marketplace in Morocco.',
    name: 'Sara M.',
    role: 'Center Director',
    city: 'Marrakech',
  },
];

export const PLATFORM_STATS = [
  { value: '500+', label: 'Centers' },
  { value: '2,000+', label: 'Courses' },
  { value: '50K+', label: 'Students' },
  { value: '1,000+', label: 'Teachers' },
];
