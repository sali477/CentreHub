import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiCheck,
  FiVideo,
  FiFileText,
  FiHelpCircle,
  FiStar,
  FiAward,
  FiSmartphone,
  FiPlay,
} from 'react-icons/fi';
import { formatPrice } from '../../utils/helpers';
import SubjectIconCard from '../courses/SubjectIconCard';
import SubjectBadge from '../courses/SubjectBadge';

const IncludeItem = ({ icon: Icon, children }) => (
  <li className="flex items-start gap-3 text-sm text-foreground">
    <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
    <span>{children}</span>
  </li>
);

const CourseEnrollmentCard = ({
  course,
  isPaid,
  isCenterCourse,
  isEnrolled,
  isAuthenticated,
  enrolling,
  onEnroll,
}) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-border/80 bg-card shadow-premium-lg ring-1 ring-border/40 overflow-hidden lg:sticky lg:top-20">
      <div className="relative aspect-video overflow-hidden">
        <SubjectIconCard subject={course.subject} size="lg" />
        <div className="absolute top-3 left-3 z-10">
          <SubjectBadge subject={course.subject} className="bg-card/90 backdrop-blur-sm shadow-sm" />
        </div>
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-card shadow-premium-lg flex items-center justify-center ring-2 ring-primary/20">
            <FiPlay className="w-6 h-6 text-primary ml-0.5" />
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground tracking-tight">
              {isPaid ? formatPrice(course.price) : t('common.free')}
            </span>
            {isPaid && (
              <span className="text-xs font-medium text-muted-foreground line-through opacity-60">
                {formatPrice(Math.round(course.price * 1.4))}
              </span>
            )}
          </div>
          {!isPaid && (
            <span className="inline-flex mt-2 px-2 py-0.5 rounded-md bg-accent text-xs font-semibold uppercase tracking-wider text-accent-foreground">
              {t('coursePage.enrollment.freeAccess')}
            </span>
          )}
        </div>

        {isCenterCourse && !isEnrolled && (
          <p className="text-sm text-accent-foreground p-3.5 rounded-xl bg-accent border border-primary/15 leading-relaxed">
            {t('coursePage.enrollment.centerCourseHint')}
          </p>
        )}

        {isEnrolled ? (
          <div className="flex items-center justify-center gap-2 bg-accent text-accent-foreground border border-primary/20 py-3.5 rounded-xl font-semibold">
            <FiCheck className="h-5 w-5" />
            {t('coursePage.enrollment.enrolled')}
          </div>
        ) : isAuthenticated && !isCenterCourse ? (
          <button
            type="button"
            onClick={onEnroll}
            disabled={enrolling}
            className="w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-premium hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-60"
          >
            {enrolling
              ? t('coursePage.enrollment.enrolling')
              : isPaid
                ? t('coursePage.enrollment.enrollNow', { price: formatPrice(course.price) })
                : t('coursePage.enrollment.enrollFree')}
          </button>
        ) : isAuthenticated && isCenterCourse ? (
          <Link
            to="/dashboard/student"
            className="w-full block text-center py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-premium hover:opacity-95 transition-opacity"
          >
            {t('coursePage.enrollment.joinWithCode')}
          </Link>
        ) : (
          <Link
            to="/login"
            className="w-full block text-center py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-premium hover:opacity-95 transition-opacity"
          >
            {t('coursePage.enrollment.signInToEnroll')}
          </Link>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {t('coursePage.enrollment.guarantee')}
        </p>

        <div className="pt-5 border-t border-border">
          <p className="text-sm font-bold text-foreground mb-4">{t('coursePage.enrollment.includes')}</p>
          <ul className="space-y-3">
            <IncludeItem icon={FiVideo}>
              {t('coursePage.enrollment.videoLessons', { count: course.videos?.length || 0 })}
            </IncludeItem>
            <IncludeItem icon={FiFileText}>
              {t('coursePage.enrollment.downloadableResources', { count: course.pdfs?.length || 0 })}
            </IncludeItem>
            <IncludeItem icon={FiHelpCircle}>
              {t('coursePage.enrollment.quizzesExams', { count: course.quizzes?.length || 0, exams: course.exams?.length || 0 })}
            </IncludeItem>
            <IncludeItem icon={FiSmartphone}>{t('coursePage.enrollment.mobileAccess')}</IncludeItem>
            <IncludeItem icon={FiAward}>{t('coursePage.enrollment.certificate')}</IncludeItem>
            <IncludeItem icon={FiStar}>
              {course.rating
                ? t('coursePage.enrollment.courseRating', { rating: course.rating.toFixed(1) })
                : t('coursePage.enrollment.expertLed')}
            </IncludeItem>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CourseEnrollmentCard;
