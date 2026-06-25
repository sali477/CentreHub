import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchCourses } from '../store/slices/courseSlice';
import { setSearchQuery } from '../store/slices/uiSlice';
import CourseCard from '../components/courses/CourseCard';
import SearchBar from '../components/common/SearchBar';
import StableCardGrid from '../components/common/StableCardGrid';

const Courses = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list: courses, loading } = useSelector((state) => state.courses);

  const urlQuery = searchParams.get('search') || searchParams.get('q') || '';

  const loadCourses = useCallback(
    (search = '') => {
      const params = { limit: 20 };
      if (search.trim()) params.search = search.trim();
      dispatch(fetchCourses(params));
    },
    [dispatch]
  );

  useEffect(() => {
    if (urlQuery) {
      dispatch(setSearchQuery(urlQuery));
    }
    loadCourses(urlQuery);
  }, [dispatch, loadCourses, urlQuery]);

  const handleSearch = (query, options = {}) => {
    const trimmed = (query || '').trim();
    if (options.clear || !trimmed) {
      setSearchParams({});
      loadCourses('');
      return;
    }
    setSearchParams({ search: trimmed });
    loadCourses(trimmed);
  };

  return (
    <div className="page-shell">
      <h1 className="section-title mb-6">{t('courses.title')}</h1>
      <div className="mb-8">
        <SearchBar
          showDropdown
          searchType="courses"
          placeholder={t('courses.searchPlaceholder')}
          onSearch={handleSearch}
        />
      </div>

      <StableCardGrid
        items={courses}
        loading={loading}
        emptyMessage={t('courses.empty')}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        minHeight="min-h-[36rem]"
        skeletonCount={8}
        renderItem={(course) => <CourseCard course={course} />}
      />
    </div>
  );
};

export default Courses;
