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

export const buildSearchUrl = ({
  q = '',
  city = '',
  neighborhood = '',
  subject = '',
  rating = '',
  deliveryMode = '',
  price = '',
  popularity = '',
} = {}) => {
  const params = new URLSearchParams();
  const query = String(q).trim();
  if (query) params.set('q', query);
  if (city && city !== 'All cities') params.set('city', city);
  if (neighborhood?.trim()) params.set('neighborhood', neighborhood.trim());
  if (subject) params.set('subject', subject);
  if (rating) params.set('rating', String(rating));
  if (deliveryMode && deliveryMode !== 'all') params.set('deliveryMode', deliveryMode);
  if (price) params.set('price', price);
  if (popularity) params.set('popularity', 'true');
  const qs = params.toString();
  return qs ? `/search?${qs}` : '/search';
};

export const parseSearchParams = (searchParams) => ({
  q: searchParams.get('q') || searchParams.get('search') || '',
  city: searchParams.get('city') || '',
  neighborhood: searchParams.get('neighborhood') || '',
  subject: searchParams.get('subject') || '',
  rating: searchParams.get('rating') || '',
  deliveryMode: searchParams.get('deliveryMode') || '',
  price: searchParams.get('price') || '',
  popularity: searchParams.get('popularity') || '',
});

export const buildSearchApiParams = (filters, overrides = {}) => {
  const params = { ...overrides };
  const q = (overrides.q ?? filters.q ?? '').trim();
  if (q) params.q = q;
  if (filters.city && filters.city !== 'All cities') params.city = filters.city;
  if (filters.neighborhood?.trim()) params.neighborhood = filters.neighborhood.trim();
  if (filters.subject) params.subject = filters.subject;
  if (filters.rating) params.rating = filters.rating;
  if (filters.deliveryMode && filters.deliveryMode !== 'all') {
    params.deliveryMode = filters.deliveryMode;
  }
  if (filters.price) params.price = filters.price;
  if (filters.popularity === 'true' || filters.popularity === true) {
    params.popularity = 'true';
  }
  return params;
};
