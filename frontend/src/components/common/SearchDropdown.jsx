import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { FiBook, FiGrid, FiLoader, FiMapPin, FiStar, FiUser } from 'react-icons/fi';

import { getEntityId } from '../../utils/entityId';

import { formatDistance } from '../../utils/helpers';

import { resolveMediaUrl } from '../../utils/mediaUrl';



const ResultItem = ({ to, icon: Icon, title, subtitle, badge, meta, onSelect, imageUrl }) => (

  <Link

    to={to}

    onClick={onSelect}

    className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors group"

  >

    {imageUrl ? (

      <img

        src={imageUrl}

        alt=""

        className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border"

      />

    ) : (

      <div className="w-10 h-10 rounded-lg bg-muted group-hover:bg-accent flex items-center justify-center shrink-0">

        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />

      </div>

    )}

    <div className="min-w-0 flex-1">

      <p className="text-sm font-medium text-foreground truncate">{title}</p>

      {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}

      {meta && <p className="text-xs text-primary mt-0.5 truncate">{meta}</p>}

    </div>

    {badge && (

      <span className="text-[10px] font-medium uppercase tracking-wide text-accent-foreground bg-accent px-2 py-0.5 rounded-full shrink-0">

        {badge}

      </span>

    )}

  </Link>

);



const SectionHeader = ({ title, count }) => (

  <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted border-b border-border shrink-0 flex justify-between">

    <span>{title}</span>

    {count != null && <span>{count}</span>}

  </p>

);



const SearchDropdown = ({

  open,

  loading,

  query,

  centers = [],

  courses = [],

  teachers = [],

  searchType = 'all',

  onClose,

  viewAllHref,

  style,

}) => {

  const { t } = useTranslation();



  if (!open) return null;



  const positionClass = style

    ? 'fixed z-[200]'

    : 'absolute left-0 right-0 top-full mt-2 z-[100]';



  const showCenters = searchType === 'all' || searchType === 'centers';

  const showCourses = searchType === 'all' || searchType === 'courses';

  const showTeachers = searchType === 'all' || searchType === 'teachers';

  const visibleCenters = showCenters ? centers : [];

  const visibleCourses = showCourses ? courses : [];

  const visibleTeachers = showTeachers ? teachers : [];

  const total = visibleCenters.length + visibleCourses.length + visibleTeachers.length;

  const showViewAll = !loading && total > 0 && viewAllHref;

  const dualPanel = searchType === 'all';



  const renderCenterResults = () => {

    if (loading) {

      return (

        <div className="flex items-center gap-2 px-4 py-4 text-xs text-muted-foreground">

          <FiLoader className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />

          {t('search.loadingCenters')}

        </div>

      );

    }

    if (visibleCenters.length === 0) {

      return (

        <p className="px-4 py-4 text-xs text-muted-foreground">

          {query.trim() ? t('search.noCentersFound') : t('search.typeToSearchCenters')}

        </p>

      );

    }

    return visibleCenters.map((center) => {

      const id = getEntityId(center);

      if (!id) return null;

      const city = center.address?.city || t('common.morocco');

      const neighborhood = center.address?.neighborhood;

      const location = [neighborhood, city].filter(Boolean).join(', ');

      const distance = center.distanceKm != null ? ` • ${formatDistance(center.distanceKm)}` : '';

      const courseCount = center.courses?.length || 0;



      return (

        <ResultItem

          key={id}

          to={`/centers/${id}`}

          icon={FiGrid}

          title={center.name}

          subtitle={`${location}${distance}`}

          meta={`★ ${center.rating?.toFixed(1) || '0.0'} • ${t('common.coursesCount', { count: courseCount })}`}

          badge={t('common.center')}

          imageUrl={center.logo ? resolveMediaUrl(center.logo) : null}

          onSelect={onClose}

        />

      );

    });

  };



  const renderTeacherResults = () => {

    if (loading) {

      return (

        <div className="flex items-center gap-2 px-4 py-4 text-xs text-muted-foreground">

          <FiLoader className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />

          {t('search.loadingTeachers')}

        </div>

      );

    }

    if (visibleTeachers.length === 0) {

      return (

        <p className="px-4 py-4 text-xs text-muted-foreground">

          {query.trim() ? t('search.noTeachersFound') : t('search.typeToSearchTeachers')}

        </p>

      );

    }

    return visibleTeachers.map((teacher) => {

      const id = getEntityId(teacher);

      if (!id) return null;

      const name = teacher.user?.name || t('common.teacher');

      const subjects = teacher.subjects?.slice(0, 2).join(', ') || t('common.instructor');

      const centerName = teacher.center?.name;



      return (

        <ResultItem

          key={id}

          to={`/teachers/${id}`}

          icon={FiUser}

          title={name}

          subtitle={[subjects, centerName].filter(Boolean).join(' • ')}

          meta={teacher.rating ? `★ ${teacher.rating.toFixed(1)}` : null}

          badge={t('common.teacher')}

          imageUrl={teacher.user?.avatar ? resolveMediaUrl(teacher.user.avatar) : null}

          onSelect={onClose}

        />

      );

    });

  };



  const renderCourseResults = () => {

    if (loading) {

      return (

        <div className="flex items-center gap-2 px-4 py-4 text-xs text-muted-foreground">

          <FiLoader className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />

          {t('search.loadingCourses')}

        </div>

      );

    }

    if (visibleCourses.length === 0) {

      return (

        <p className="px-4 py-4 text-xs text-muted-foreground">

          {query.trim() ? t('search.noCoursesFound') : t('search.typeToSearchCourses')}

        </p>

      );

    }

    return visibleCourses.map((course) => {

      const id = getEntityId(course);

      if (!id) return null;

      const subtitle = [course.subject, course.level, course.center?.name]

        .filter(Boolean)

        .join(' • ');



      return (

        <ResultItem

          key={id}

          to={`/courses/${id}`}

          icon={FiBook}

          title={course.title}

          subtitle={subtitle}

          badge={t('common.course')}

          onSelect={onClose}

        />

      );

    });

  };



  return (

    <div

      style={style}

      className={`${positionClass} bg-card rounded-2xl shadow-soft-lg border border-border overflow-hidden flex flex-col min-h-[320px] max-h-[min(75vh,480px)]`}

      role="listbox"

      aria-label={t('common.searchResultsAria')}

      onMouseDown={(e) => e.stopPropagation()}

    >

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">

        {dualPanel ? (

          <>

            <section className="flex flex-col min-h-[100px]">

              <SectionHeader title={t('search.centers')} count={visibleCenters.length || null} />

              <div className="flex-1">{renderCenterResults()}</div>

            </section>

            <section className="flex flex-col min-h-[100px] border-t border-border">

              <SectionHeader title={t('search.teachers')} count={visibleTeachers.length || null} />

              <div className="flex-1">{renderTeacherResults()}</div>

            </section>

            <section className="flex flex-col min-h-[100px] border-t border-border">

              <SectionHeader title={t('search.courses')} count={visibleCourses.length || null} />

              <div className="flex-1">{renderCourseResults()}</div>

            </section>

          </>

        ) : (

          <section className="flex flex-col min-h-[200px]">

            <SectionHeader

              title={

                showCenters ? t('search.centers') : showTeachers ? t('search.teachers') : t('search.courses')

              }

            />

            <div className="flex-1">

              {showCenters && renderCenterResults()}

              {showTeachers && renderTeacherResults()}

              {showCourses && renderCourseResults()}

            </div>

          </section>

        )}

      </div>



      {showViewAll && (

        <div className="border-t border-border px-4 py-2.5 bg-muted shrink-0">

          <Link

            to={viewAllHref}

            onClick={onClose}

            className="text-sm font-semibold text-primary hover:opacity-80 flex items-center gap-1"

          >

            <FiMapPin className="w-3.5 h-3.5" />

            {t('search.viewAllResults')}

          </Link>

        </div>

      )}

    </div>

  );

};



export default SearchDropdown;

