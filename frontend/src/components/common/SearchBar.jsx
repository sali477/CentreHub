import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiMapPin, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setSearchQuery } from '../../store/slices/uiSlice';
import { smartSearchCenters } from '../../store/slices/centerSlice';
import api from '../../api/axios.js';
import { searchAPI } from '../../api/index';
import { getCurrentLocation, isNearMeQuery } from '../../utils/helpers';
import { buildSearchApiParams, buildSearchUrl } from '../../utils/searchUrl';
import SearchDropdown from './SearchDropdown';

const SearchBar = ({
  onSearch,
  placeholder,
  instant = false,
  showDropdown = false,
  searchType = 'all',
  minChars = 2,
  dropdownLimit = 6,
  dropdownTheme = 'dark',
  reserveLayout = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { searchQuery, filters } = useSelector((state) => state.ui);
  const resolvedPlaceholder = placeholder ?? t('search.defaultPlaceholder');
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [dropdownCenters, setDropdownCenters] = useState([]);
  const [dropdownCourses, setDropdownCourses] = useState([]);
  const [dropdownTeachers, setDropdownTeachers] = useState([]);
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const debounceRef = useRef(null);
  const dropdownDebounceRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const closeDropdown = useCallback(() => setDropdownOpen(false), []);

  const fetchDropdownResults = useCallback(
    async (query, options = {}) => {
      const trimmed = query.trim();
      if (!trimmed || trimmed.length < minChars) {
        setDropdownCenters([]);
        setDropdownCourses([]);
        setDropdownTeachers([]);
        setDropdownLoading(false);
        if (!trimmed) closeDropdown();
        return;
      }

      setDropdownLoading(true);
      setDropdownOpen(true);

      try {
        const params = buildSearchApiParams(filters, {
          q: trimmed,
          limit: dropdownLimit,
        });

        if (options.nearMe && options.location) {
          params.lat = options.location.lat;
          params.lng = options.location.lng;
          params.near = true;
          params.radius = filters.distance || 50;
        }

        const { data } = await searchAPI.query(params);

        setDropdownCenters(data.data?.centers || []);
        setDropdownCourses(data.data?.courses || []);
        setDropdownTeachers(data.data?.teachers || []);
      } catch {
        setDropdownCenters([]);
        setDropdownCourses([]);
        setDropdownTeachers([]);
      } finally {
        setDropdownLoading(false);
      }
    },
    [minChars, dropdownLimit, closeDropdown, filters]
  );

  const runSearch = useCallback(
    async (query, options = {}) => {
      const trimmed = query.trim();
      if (!trimmed && !options.nearMe) {
        onSearch?.('', { clear: true });
        closeDropdown();
        return;
      }

      dispatch(setSearchQuery(trimmed || 'centers near me'));
      setLocationError(null);

      if (useAI || options.forceAI) {
        setLoading(true);
        setDropdownOpen(true);
        setDropdownLoading(true);
        try {
          let location = options.location || null;
          if ((options.nearMe || isNearMeQuery(trimmed)) && !location) {
            try {
              location = await getCurrentLocation();
            } catch (err) {
              setLocationError(err.message);
            }
          }

          const { data: result } = await api.post('/ai/smart-search', {
            query: trimmed || 'educational centers near me',
            lat: location?.lat,
            lng: location?.lng,
          });

          setDropdownCenters(result.data || []);
          setDropdownCourses([]);

          if (!showDropdown) {
            await dispatch(
              smartSearchCenters({
                query: trimmed || 'educational centers near me',
                lat: location?.lat,
                lng: location?.lng,
              })
            ).unwrap();
          }

          onSearch?.(trimmed, { ...options, location, ai: true });
        } finally {
          setLoading(false);
          setDropdownLoading(false);
        }
        return;
      }

      if (showDropdown) {
        await fetchDropdownResults(trimmed, options);
      }

      onSearch?.(trimmed, options);
    },
    [dispatch, onSearch, useAI, showDropdown, fetchDropdownResults, closeDropdown]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() && !useAI) return;

    setLoading(true);
    try {
      const nearMe = isNearMeQuery(searchQuery);
      let location = null;

      if (nearMe) {
        try {
          location = await getCurrentLocation();
        } catch (err) {
          setLocationError(err.message);
          return;
        }
      }

      await runSearch(searchQuery, { nearMe, location });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async () => {
    setLoading(true);
    setLocationError(null);
    try {
      const location = await getCurrentLocation();
      dispatch(setSearchQuery('centers near me'));
      if (showDropdown) {
        await fetchDropdownResults('centers near me', { nearMe: true, location });
      }
      await runSearch('centers near me', { nearMe: true, location, forceAI: useAI });
    } catch (err) {
      setLocationError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((!instant && !showDropdown) || useAI) return undefined;

    if (dropdownDebounceRef.current) clearTimeout(dropdownDebounceRef.current);

    dropdownDebounceRef.current = setTimeout(() => {
      const trimmed = searchQuery.trim();
      if (showDropdown && trimmed.length >= minChars) {
        fetchDropdownResults(trimmed);
      } else if (!trimmed) {
        closeDropdown();
        setDropdownCenters([]);
        setDropdownCourses([]);
        onSearch?.('', { clear: true });
      }
    }, 300);

    return () => {
      if (dropdownDebounceRef.current) clearTimeout(dropdownDebounceRef.current);
    };
  }, [
    searchQuery,
    instant,
    showDropdown,
    minChars,
    fetchDropdownResults,
    closeDropdown,
    onSearch,
    useAI,
  ]);

  useEffect(() => {
    if (!instant || !onSearch || showDropdown) return undefined;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const trimmed = searchQuery.trim();
      if (trimmed.length >= minChars) {
        runSearch(trimmed);
      } else if (!trimmed) {
        onSearch('', { clear: true });
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, instant, onSearch, minChars, runSearch, showDropdown]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeDropdown();
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeDropdown();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeDropdown]);

  const viewAllHref = buildSearchUrl({
    q: searchQuery,
    city: filters.city,
    neighborhood: filters.neighborhood,
    subject: filters.subject,
    rating: filters.rating || '',
    deliveryMode: filters.deliveryMode,
    price: filters.price,
    popularity: filters.popularity,
  });

  const isDropdownVisible =
    showDropdown && dropdownOpen && (dropdownLoading || searchQuery.trim().length >= minChars);

  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!showDropdown || !isDropdownVisible) {
      setDropdownStyle(null);
      return undefined;
    }

    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition, true);

    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition, true);
    };
  }, [showDropdown, isDropdownVisible, searchQuery, updateDropdownPosition]);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto z-30 isolate">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative${reserveLayout ? ' search-bar-form' : ''}`}
      >
        <div className="search-shell">
          <div className="flex flex-1 items-center min-w-0">
            <FiSearch className="ml-4 text-muted-foreground w-5 h-5 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setLocationError(null);
                dispatch(setSearchQuery(e.target.value));
                if (showDropdown && e.target.value.trim().length >= minChars) {
                  setDropdownOpen(true);
                }
              }}
              onFocus={() => {
                if (showDropdown && searchQuery.trim().length >= minChars) {
                  setDropdownOpen(true);
                }
              }}
              placeholder={resolvedPlaceholder}
              className="flex-1 min-w-0 px-4 py-3.5 sm:py-4 outline-none text-foreground placeholder:text-muted-foreground bg-transparent"
              aria-label={t('common.searchAria')}
              aria-expanded={isDropdownVisible}
              aria-autocomplete="list"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handleLocationSearch}
              disabled={loading || dropdownLoading}
              className="p-3 text-muted-foreground hover:text-primary transition-colors shrink-0"
              title={t('common.findNearMe')}
            >
              {loading || dropdownLoading ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : (
                <FiMapPin className="w-5 h-5" />
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || dropdownLoading}
            className="btn-primary rounded-none sm:rounded-none px-6 sm:px-8 py-3.5 sm:py-4 shrink-0 min-w-[7.75rem]"
          >
            <span className="inline-block min-w-[5.5rem] text-center">
              {loading || dropdownLoading ? t('common.searching') : t('common.search')}
            </span>
          </button>
        </div>

        <label
          className={`flex items-center gap-2 mt-3 text-sm cursor-pointer justify-center sm:justify-start ${
            dropdownTheme === 'light' ? 'text-primary-foreground' : 'text-muted-foreground'
          }`}
        >
          <input
            type="checkbox"
            checked={useAI}
            onChange={(e) => setUseAI(e.target.checked)}
            className="rounded border-border text-primary focus:ring-primary"
          />
          {t('common.useAiSearch')}
        </label>
      </motion.form>

      <SearchDropdown
        open={isDropdownVisible}
        loading={dropdownLoading || (loading && useAI)}
        query={searchQuery}
        centers={dropdownCenters}
        courses={dropdownCourses}
        teachers={dropdownTeachers}
        searchType={searchType}
        onClose={closeDropdown}
        viewAllHref={viewAllHref}
        style={showDropdown ? dropdownStyle : undefined}
      />

      {locationError && !isDropdownVisible && (
        <div className="absolute left-0 right-0 top-full mt-2 z-[90] flex items-start gap-2 text-sm text-destructive-muted-foreground bg-destructive-muted border border-destructive-muted rounded-xl px-4 py-3 shadow-premium">
          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{locationError}</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
