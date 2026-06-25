import { useState, useCallback, useRef, useLayoutEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { FiSearch, FiMapPin } from 'react-icons/fi';

import { useDispatch } from 'react-redux';

import { useTranslation } from 'react-i18next';

import { setSearchQuery } from '../../store/slices/uiSlice';

import { searchAPI } from '../../api/index';

import { isNearMeQuery, getCurrentLocation } from '../../utils/helpers';

import { buildSearchApiParams, buildSearchUrl } from '../../utils/searchUrl';

import SearchDropdown from '../common/SearchDropdown';

import HeroIllustration from './HeroIllustration';

import { MOROCCO_CITIES, QUICK_FILTERS, PLATFORM_STATS } from './constants';

import { fadeUp } from './motionVariants';



const ALL_CITIES_VALUE = '';



const STAT_LABEL_KEYS = {

  Centers: 'home.stats.centers',

  Courses: 'home.stats.courses',

  Students: 'home.stats.students',

  Teachers: 'home.stats.teachers',

};



const HeroSection = () => {

  const { t } = useTranslation();

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [query, setQuery] = useState('');

  const [city, setCity] = useState(ALL_CITIES_VALUE);

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [dropdownLoading, setDropdownLoading] = useState(false);

  const [dropdownCenters, setDropdownCenters] = useState([]);

  const [dropdownCourses, setDropdownCourses] = useState([]);

  const [dropdownTeachers, setDropdownTeachers] = useState([]);

  const [dropdownStyle, setDropdownStyle] = useState(null);

  const searchRef = useRef(null);

  const debounceRef = useRef(null);



  const cityFilter = city || '';



  const fetchResults = useCallback(

    async (text) => {

      const trimmed = text.trim();

      if (!trimmed || trimmed.length < 2) {

        setDropdownCenters([]);

        setDropdownCourses([]);

        setDropdownTeachers([]);

        setDropdownOpen(false);

        return;

      }



      setDropdownLoading(true);

      setDropdownOpen(true);



      try {

        const params = buildSearchApiParams(

          { city: cityFilter },

          { q: trimmed, limit: 6 }

        );

        if (isNearMeQuery(text)) {

          try {

            const loc = await getCurrentLocation();

            params.lat = loc.lat;

            params.lng = loc.lng;

            params.near = true;

          } catch {

            /* optional */

          }

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

    [cityFilter]

  );



  const handleSearch = (e) => {

    e?.preventDefault();

    const trimmed = query.trim();

    if (!trimmed && !cityFilter) return;

    dispatch(setSearchQuery(trimmed));

    setDropdownOpen(false);

    navigate(buildSearchUrl({

      q: trimmed,

      city: cityFilter,

    }));

  };



  const handleQuickFilter = (value) => {

    if (value === 'near me') {

      setQuery('centers near me');

      dispatch(setSearchQuery('centers near me'));

      fetchResults('centers near me');

      return;

    }

    setQuery(value);

    dispatch(setSearchQuery(value));

    fetchResults(value);

  };



  useLayoutEffect(() => {

    if (!dropdownOpen || !searchRef.current) return undefined;

    const update = () => {

      const rect = searchRef.current.getBoundingClientRect();

      setDropdownStyle({ top: rect.bottom + 8, left: rect.left, width: rect.width });

    };

    update();

    window.addEventListener('resize', update);

    window.addEventListener('scroll', update, true);

    return () => {

      window.removeEventListener('resize', update);

      window.removeEventListener('scroll', update, true);

    };

  }, [dropdownOpen, query, city]);



  return (

    <section className="relative overflow-hidden">

      {/* Decorative background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/40" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(91,164,230,0.12),transparent)]" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_80%,rgba(143,197,247,0.15),transparent)]" />

        <div className="absolute -top-32 left-[5%] h-96 w-96 rounded-full bg-primary/15 blur-3xl" />

        <div className="absolute bottom-0 right-[0%] h-[28rem] w-[28rem] rounded-full bg-secondary/25 blur-3xl" />

        <div className="absolute top-1/4 right-[35%] h-56 w-56 rounded-full bg-highlight/10 blur-2xl" />

        <div className="absolute top-[18%] right-[12%] h-64 w-64 rounded-full border border-primary/10 opacity-60" />

        <div className="absolute bottom-[22%] left-[8%] h-40 w-40 rounded-3xl border border-secondary/30 rotate-12 opacity-50" />

        <div

          className="absolute top-[12%] left-[18%] h-3 w-3 rounded-full bg-primary/40"

          aria-hidden

        />

        <div

          className="absolute top-[42%] right-[8%] h-2 w-2 rounded-full bg-highlight/60"

          aria-hidden

        />

        <div

          className="absolute bottom-[35%] left-[42%] h-2.5 w-2.5 rounded-full bg-success/50"

          aria-hidden

        />

      </div>



      <div className="page-container relative py-10 sm:py-12 lg:py-14">

        <motion.div
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-7 lg:gap-8"
        >
          {/* Top row — headline + illustration */}
          <div className="grid lg:grid-cols-[3fr_2fr] gap-x-2 sm:gap-x-2 lg:gap-x-2 xl:gap-x-3 gap-y-6 items-start">
            <div className="text-center lg:text-left min-w-0 lg:ml-auto lg:max-w-[33rem] xl:max-w-[36rem] lg:pr-2 xl:pr-3">
              <motion.p
                variants={fadeUp}
                custom={0}
                className="mb-5 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
              >
                <FiMapPin className="h-3.5 w-3.5 text-primary" />
                {t('home.badge')}
              </motion.p>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-[1.12] sm:leading-[1.08] lg:leading-[1.05]"
              >
                {t('home.heroTitle1')}
                <span className="block text-primary mt-2 sm:mt-3">{t('home.heroTitle2')}</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-foreground/75 max-w-xl mx-auto lg:mx-0 leading-relaxed"
              >
                {t('home.heroSubtitle')}
              </motion.p>

              <motion.div variants={fadeUp} custom={2.5} className="mt-6 lg:hidden flex justify-center">
                <HeroIllustration className="max-w-[18rem] sm:max-w-xs" />
              </motion.div>
            </div>

            <div className="hidden lg:flex items-start justify-start min-w-0 pt-1 lg:-ml-1 xl:-ml-2">
              <HeroIllustration className="w-full max-w-[22rem] xl:max-w-[24rem]" />
            </div>
          </div>

          {/* Second row — full-width centered search */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="relative w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto"
            ref={searchRef}
          >
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 p-4 sm:p-5 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-premium-lg ring-2 ring-primary/10"
            >
              <div className="flex flex-1 items-center gap-3 px-4 py-4 sm:py-5 rounded-xl bg-muted/60 min-w-0">
                <FiSearch className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    const v = e.target.value;
                    setQuery(v);
                    dispatch(setSearchQuery(v));
                    if (debounceRef.current) clearTimeout(debounceRef.current);
                    debounceRef.current = setTimeout(() => fetchResults(v), 300);
                  }}
                  onFocus={() => query.trim().length >= 2 && setDropdownOpen(true)}
                  placeholder={t('home.searchPlaceholder')}
                  className="flex-1 min-w-0 bg-transparent text-base sm:text-lg lg:text-xl text-foreground placeholder:text-muted-foreground outline-none"
                  autoComplete="off"
                />
              </div>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="hero-city-select px-4 py-4 sm:py-5 rounded-xl text-base sm:text-lg outline-none cursor-pointer sm:min-w-[12rem]"
                aria-label={t('filters.city')}
              >
                <option value={ALL_CITIES_VALUE}>{t('home.allCities')}</option>
                {MOROCCO_CITIES.filter((c) => c !== 'All cities').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-8 sm:px-10 py-4 sm:py-5 rounded-xl bg-primary text-primary-foreground text-base sm:text-lg font-semibold shadow-premium hover:opacity-90 transition-opacity shrink-0"
              >
                {t('common.search')}
              </button>
            </form>

            <SearchDropdown
              open={dropdownOpen && (dropdownLoading || query.trim().length >= 2)}
              loading={dropdownLoading}
              query={query}
              centers={dropdownCenters}
              courses={dropdownCourses}
              teachers={dropdownTeachers}
              searchType="all"
              onClose={() => setDropdownOpen(false)}
              viewAllHref={buildSearchUrl({
                q: query.trim(),
                city: cityFilter,
              })}
              style={dropdownStyle}
            />

            <div className="flex flex-wrap justify-center gap-2.5 mt-5 sm:mt-6">
              {QUICK_FILTERS.map(({ labelKey, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleQuickFilter(value)}
                  className="px-4 py-2 rounded-full text-sm font-medium border border-border bg-card/70 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-colors backdrop-blur-sm"
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>



        {/* Platform stats */}

        <motion.div

          initial="hidden"

          animate="visible"

          variants={fadeUp}

          custom={4}

          className="mt-12 sm:mt-14 lg:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-4xl lg:max-w-none mx-auto"

        >

          {PLATFORM_STATS.map(({ value, label }) => (

            <div

              key={label}

              className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md px-5 py-6 sm:px-6 sm:py-7 text-center shadow-premium"

            >

              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">{value}</p>

              <p className="text-sm sm:text-base text-muted-foreground mt-2 sm:mt-2.5 font-medium">

                {t(STAT_LABEL_KEYS[label] || label)}

              </p>

            </div>

          ))}

        </motion.div>

      </div>

    </section>

  );

};



export default HeroSection;

