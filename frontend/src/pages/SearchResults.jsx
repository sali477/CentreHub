import { useCallback, useEffect, useState } from 'react';

import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from 'react-i18next';

import { FiBook, FiGrid, FiLoader, FiMapPin, FiStar, FiUser } from 'react-icons/fi';

import { searchAPI } from '../api/index';

import { setFilters, setSearchQuery } from '../store/slices/uiSlice';

import SearchBar from '../components/common/SearchBar';

import FilterPanel from '../components/common/FilterPanel';

import CenterCard from '../components/centers/CenterCard';

import CourseCard from '../components/courses/CourseCard';

import { getEntityId } from '../utils/entityId';

import { resolveMediaUrl } from '../utils/mediaUrl';

import { buildSearchApiParams, buildSearchUrl, parseSearchParams } from '../utils/searchUrl';



const TeacherResultCard = ({ teacher }) => {

  const { t } = useTranslation();

  const id = getEntityId(teacher);

  if (!id) return null;

  const name = teacher.user?.name || t('common.teacher');



  return (

    <Link

      to={`/teachers/${id}`}

      className="card p-4 flex items-center gap-4 hover:shadow-premium transition-shadow group"

    >

      {teacher.user?.avatar ? (

        <img

          src={resolveMediaUrl(teacher.user.avatar)}

          alt=""

          className="w-14 h-14 rounded-xl object-cover shrink-0"

        />

      ) : (

        <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center shrink-0">

          <FiUser className="w-6 h-6 text-primary" />

        </div>

      )}

      <div className="min-w-0 flex-1">

        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">

          {name}

        </h3>

        <p className="text-sm text-muted-foreground truncate">

          {teacher.subjects?.slice(0, 3).join(' • ') || t('common.instructor')}

        </p>

        {teacher.center?.name && (

          <p className="text-xs text-muted-foreground mt-1 truncate">{teacher.center.name}</p>

        )}

      </div>

      <div className="text-right shrink-0">

        <div className="flex items-center gap-1 text-sm">

          <FiStar className="text-primary fill-primary w-3.5 h-3.5" />

          <span className="font-medium">{teacher.rating?.toFixed(1) || '0.0'}</span>

        </div>

        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{t('common.teacher')}</span>

      </div>

    </Link>

  );

};



const SectionBlock = ({ title, icon: Icon, count, children, emptyMessage }) => (

  <section className="space-y-4">

    <div className="flex items-center justify-between gap-3">

      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">

        <Icon className="w-5 h-5 text-primary" />

        {title}

        {count != null && (

          <span className="text-sm font-normal text-muted-foreground">({count})</span>

        )}

      </h2>

    </div>

    {children}

    {!children && (

      <div className="card p-8 text-center text-muted-foreground text-sm">{emptyMessage}</div>

    )}

  </section>

);



const SearchResults = () => {

  const { t } = useTranslation();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const { filters } = useSelector((state) => state.ui);



  const urlFilters = parseSearchParams(searchParams);

  const [results, setResults] = useState({ centers: [], courses: [], teachers: [] });

  const [meta, setMeta] = useState({});

  const [loading, setLoading] = useState(true);



  const runSearch = useCallback(async () => {

    setLoading(true);

    try {

      const params = buildSearchApiParams(

        { ...filters, ...urlFilters },

        { q: urlFilters.q, limit: 24 }

      );

      const { data } = await searchAPI.query(params);

      setResults({

        centers: data.data?.centers || [],

        courses: data.data?.courses || [],

        teachers: data.data?.teachers || [],

      });

      setMeta(data.meta || {});

    } catch {

      setResults({ centers: [], courses: [], teachers: [] });

      setMeta({});

    } finally {

      setLoading(false);

    }

  }, [filters, urlFilters]);



  useEffect(() => {

    if (urlFilters.q) dispatch(setSearchQuery(urlFilters.q));

    dispatch(setFilters({

      city: urlFilters.city,

      neighborhood: urlFilters.neighborhood,

      subject: urlFilters.subject,

      rating: urlFilters.rating ? parseFloat(urlFilters.rating) : 0,

      deliveryMode: urlFilters.deliveryMode,

      price: urlFilters.price,

      popularity: urlFilters.popularity === 'true',

    }));

  }, [dispatch, urlFilters.q, urlFilters.city, urlFilters.neighborhood, urlFilters.subject, urlFilters.rating, urlFilters.deliveryMode, urlFilters.price, urlFilters.popularity]);



  useEffect(() => {

    runSearch();

  }, [runSearch]);



  const handleSearch = (query, options = {}) => {

    if (options.clear) {

      navigate('/search');

      return;

    }

    const next = buildSearchUrl({

      q: query,

      city: filters.city,

      neighborhood: filters.neighborhood,

      subject: filters.subject,

      rating: filters.rating || '',

      deliveryMode: filters.deliveryMode,

      price: filters.price,

      popularity: filters.popularity,

    });

    navigate(next);

  };



  const handleApplyFilters = () => {

    navigate(buildSearchUrl({

      q: urlFilters.q,

      city: filters.city,

      neighborhood: filters.neighborhood,

      subject: filters.subject,

      rating: filters.rating || '',

      deliveryMode: filters.deliveryMode,

      price: filters.price,

      popularity: filters.popularity,

    }));

  };



  const totalResults =

    (meta.centerCount || 0) + (meta.courseCount || 0) + (meta.teacherCount || 0);



  const summaryParts = [

    urlFilters.q && `"${urlFilters.q}"`,

    urlFilters.city && t('common.inCity', { city: urlFilters.city }),

    urlFilters.neighborhood && `(${urlFilters.neighborhood})`,

    urlFilters.subject && `• ${urlFilters.subject}`,

  ].filter(Boolean);



  return (

    <div className="page-shell">

      <div className="mb-8">

        <h1 className="section-title mb-2">{t('search.title')}</h1>

        <p className="text-muted-foreground text-sm">

          {summaryParts.length > 0

            ? summaryParts.join(' ')

            : t('search.subtitle')}

          {totalResults > 0 && !loading && ` — ${t('common.resultsCount', { count: totalResults })}`}

        </p>

      </div>



      <div className="mb-8">

        <SearchBar

          showDropdown

          searchType="all"

          placeholder={t('search.placeholder')}

          onSearch={handleSearch}

        />

      </div>



      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        <aside className="lg:col-span-1">

          <FilterPanel onApply={handleApplyFilters} />

        </aside>



        <div className="lg:col-span-3 space-y-10">

          {loading ? (

            <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">

              <FiLoader className="w-5 h-5 animate-spin text-primary" />

              {t('common.searching')}

            </div>

          ) : (

            <>

              {(meta.detectedCity || meta.detectedSubject) && (

                <div className="flex flex-wrap gap-2">

                  {meta.detectedCity && (

                    <span className="badge bg-accent text-accent-foreground inline-flex items-center gap-1">

                      <FiMapPin className="w-3 h-3" /> {t('common.cityLabel')}: {meta.detectedCity}

                    </span>

                  )}

                  {meta.detectedSubject && (

                    <span className="badge bg-accent text-accent-foreground">

                      {t('common.subjectLabel')}: {meta.detectedSubject}

                    </span>

                  )}

                </div>

              )}



              <SectionBlock

                title={t('search.centers')}

                icon={FiGrid}

                count={meta.centerCount}

                emptyMessage={results.centers.length === 0 ? t('search.noCentersMatch') : null}

              >

                {results.centers.length > 0 && (

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {results.centers.map((center) => (

                      <CenterCard key={getEntityId(center)} center={center} />

                    ))}

                  </div>

                )}

              </SectionBlock>



              <SectionBlock

                title={t('search.teachers')}

                icon={FiUser}

                count={meta.teacherCount}

                emptyMessage={results.teachers.length === 0 ? t('search.noTeachersMatch') : null}

              >

                {results.teachers.length > 0 && (

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {results.teachers.map((teacher) => (

                      <TeacherResultCard key={getEntityId(teacher)} teacher={teacher} />

                    ))}

                  </div>

                )}

              </SectionBlock>



              <SectionBlock

                title={t('search.courses')}

                icon={FiBook}

                count={meta.courseCount}

                emptyMessage={results.courses.length === 0 ? t('search.noCoursesMatch') : null}

              >

                {results.courses.length > 0 && (

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    {results.courses.map((course, i) => (

                      <CourseCard key={getEntityId(course)} course={course} index={i} />

                    ))}

                  </div>

                )}

              </SectionBlock>



              {totalResults === 0 && (

                <div className="card p-10 text-center">

                  <p className="text-foreground font-medium mb-2">{t('search.noResultsTitle')}</p>

                  <p className="text-sm text-muted-foreground mb-4">

                    {t('search.noResultsHint')}

                  </p>

                  <Link to="/centers" className="btn-secondary inline-block mr-2">{t('search.browseCenters')}</Link>

                  <Link to="/courses" className="btn-primary inline-block">{t('search.browseCourses')}</Link>

                </div>

              )}

            </>

          )}

        </div>

      </div>

    </div>

  );

};



export default SearchResults;

