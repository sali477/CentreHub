import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiStar, FiUsers, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import SubjectIconCard from '../courses/SubjectIconCard';
import SubjectBadge from '../courses/SubjectBadge';

const CourseHero = ({ course, progress, isEnrolled, teacherName }) => {
  const { t } = useTranslation();
  const studentCount = course.enrolledStudents?.length || 0;
  const rating = course.rating?.toFixed(1) || '0.0';
  const reviewCount = course.numReviews || 0;
  const teacherId = course.teacher?._id;

  return (
    <header className="course-header-bg">
      <div className="page-container py-4 sm:py-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <Link
            to="/"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-card text-muted-foreground shadow-premium hover:text-primary hover:border-primary/45 hover:bg-accent transition-all duration-200"
            aria-label={t('common.backToHome')}
            title={t('common.backToHome')}
          >
            <FiArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex-1 min-w-0">
        <nav
          className="flex items-center gap-1 text-xs text-foreground/70 mb-2.5"
          aria-label="Breadcrumb"
        >
          <Link to="/courses" className="hover:text-primary transition-colors">
            {t('coursePage.breadcrumbCourses')}
          </Link>
          <FiChevronRight className="w-3 h-3 opacity-50 shrink-0" />
          <SubjectBadge subject={course.subject} />
        </nav>

        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight leading-snug">
          {course.title}
        </h1>

        <p className="mt-1.5 text-sm text-foreground/75 leading-snug line-clamp-2 max-w-3xl">
          {course.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-foreground/70">
          <span>
            {teacherId ? (
              <>
                <span className="text-muted-foreground/80">{t('common.by')} </span>
                <Link
                  to={`/teachers/${teacherId}`}
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  {teacherName}
                </Link>
              </>
            ) : (
              <>
                <span className="text-muted-foreground/80">{t('common.by')} </span>
                <span className="font-medium text-foreground">{teacherName}</span>
              </>
            )}
          </span>

          <span className="hidden sm:inline text-border">|</span>

          <span className="inline-flex items-center gap-1">
            <FiStar className="w-3.5 h-3.5 text-primary fill-primary shrink-0" />
            <span className="font-semibold text-foreground">{rating}</span>
            {reviewCount > 0 && (
              <span className="text-muted-foreground">({reviewCount.toLocaleString()})</span>
            )}
          </span>

          <span className="hidden sm:inline text-border">|</span>

          <span className="inline-flex items-center gap-1">
            <FiUsers className="w-3.5 h-3.5 shrink-0" />
            <span>{t('coursePage.studentsEnrolled', { count: studentCount })}</span>
          </span>
        </div>

        {isEnrolled && (
          <div className="mt-3 flex items-center gap-3 max-w-md">
            <div className="course-progress-track flex-1 h-1.5 rounded-full overflow-hidden">
              <div
                className="course-progress-fill h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="course-progress-label text-xs shrink-0 tabular-nums">
              {t('coursePage.progressComplete', { percent: progress })}
            </span>
          </div>
        )}
          </div>

          <SubjectIconCard subject={course.subject} size="hero" className="hidden sm:flex shadow-premium-lg" showGlow={false} />
        </div>
      </div>
    </header>
  );
};

export default CourseHero;
