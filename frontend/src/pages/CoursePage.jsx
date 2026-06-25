import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { fetchCourse, clearCurrentCourse, enrollInCourse } from '../store/slices/courseSlice';
import { enrollmentAPI, discussionAPI } from '../api/index';
import { openVideoLesson } from '../utils/videoUrl';
import PaymentCheckout from '../components/payment/PaymentCheckout';
import CourseHero from '../components/course/CourseHero';
import CourseOverview from '../components/course/CourseOverview';
import CourseEnrollmentCard from '../components/course/CourseEnrollmentCard';
import CourseContentSidebar from '../components/course/CourseContentSidebar';
import CourseContentPanel from '../components/course/CourseContentPanel';

const VALID_TABS = ['videos', 'pdfs', 'quizzes', 'live', 'comments'];

const CoursePageSkeleton = () => (
  <div className="min-h-screen bg-background animate-pulse">
    <div className="border-b border-border/80 bg-gradient-to-b from-accent/40 to-card">
      <div className="page-container py-5 space-y-2">
        <div className="h-3 w-32 bg-muted rounded" />
        <div className="h-7 w-2/3 max-w-lg bg-muted rounded" />
        <div className="h-4 w-full max-w-md bg-muted rounded" />
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
    </div>
    <div className="page-container py-6">
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="h-10 bg-muted rounded-xl" />
          <div className="h-80 rounded-2xl bg-muted" />
        </div>
        <div className="hidden lg:block lg:col-span-4 h-72 rounded-2xl bg-muted" />
      </div>
    </div>
  </div>
);

const CoursePage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { current: course, loading, error } = useSelector((state) => state.courses);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : 'videos'
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleCommentCountChange = useCallback((count) => {
    setCommentCount(count);
  }, []);

  useEffect(() => {
    dispatch(fetchCourse(id));
    setEnrollment(null);
    setCommentCount(0);
    if (isAuthenticated) {
      enrollmentAPI.getByCourse(id).then(({ data }) => setEnrollment(data.data)).catch(() => setEnrollment(null));
    }
    discussionAPI.getAll(id).then(({ data }) => setCommentCount(data.count ?? 0)).catch(() => {});
    return () => dispatch(clearCurrentCourse());
  }, [dispatch, id, isAuthenticated]);

  const navCounts = useMemo(
    () => ({
      videos: course?.videos?.length || 0,
      pdfs: course?.pdfs?.length || 0,
      quizzes: course?.quizzes?.length || 0,
      live: course?.liveSessions?.length || 0,
      comments: commentCount,
    }),
    [course, commentCount]
  );

  const handleProgress = async (type, itemId) => {
    if (!enrollment) return;
    const { data } = await enrollmentAPI.updateProgress(enrollment._id, { type, itemId });
    setEnrollment(data.data);
  };

  if (loading && !course) {
    return <CoursePageSkeleton />;
  }

  if (!course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center page-shell text-center px-4">
        <div className="max-w-md">
          <p className="text-lg font-semibold text-foreground mb-2">{t('coursePage.notFound')}</p>
          <p className="text-muted-foreground mb-6">{error || t('coursePage.unavailable')}</p>
          <Link to="/courses" className="btn-primary inline-flex">{t('coursePage.browseAll')}</Link>
        </div>
      </div>
    );
  }

  const isPaid = course.courseType === 'paid' || (!course.isFree && course.price > 0);
  const isCenterCourse = course.center && !course.isIndependent;
  const isEnrolled = enrollment?.status === 'active' || enrollment?.status === 'completed';
  const isCourseTeacher =
    user?._id &&
    course.teacher?.user?._id &&
    user._id.toString() === course.teacher.user._id.toString();
  const canManageDiscussion = isCourseTeacher || user?.role === 'admin';
  const canAccessContent = isEnrolled || isCourseTeacher || user?.role === 'admin';
  const progress = enrollment?.progress?.percentage || 0;
  const teacherName = course.teacher?.user?.name || t('common.instructor');
  const canOpenVideo = (video) => canAccessContent || video?.isPreview;

  const handleOpenVideo = (video) => {
    setVideoError('');
    if (!canOpenVideo(video)) {
      setVideoError(t('coursePage.enrollToAccessVideo'));
      return;
    }
    const result = openVideoLesson(video);
    if (!result.ok) {
      setVideoError(result.message);
      return;
    }
    if (isEnrolled && enrollment) {
      handleProgress('video', video._id);
    }
  };

  const handleEnroll = async () => {
    if (isCenterCourse) {
      alert(t('coursePage.centerCourseAlert'));
      return;
    }
    if (isPaid) {
      setShowPayment(true);
      return;
    }
    setEnrolling(true);
    try {
      await dispatch(enrollInCourse(id)).unwrap();
      const { data } = await enrollmentAPI.getByCourse(id);
      setEnrollment(data.data);
    } catch (err) {
      alert(err || t('coursePage.enrollmentFailed'));
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CourseHero
        course={course}
        progress={progress}
        isEnrolled={isEnrolled}
        teacherName={teacherName}
      />

      <div className="page-container py-5 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8 space-y-8">
            <section>
              <div className="grid grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)] gap-4 xl:gap-5">
                <CourseContentSidebar
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  mobileOpen={mobileNavOpen}
                  onMobileOpenChange={setMobileNavOpen}
                  counts={navCounts}
                />
                <CourseContentPanel
                  activeTab={activeTab}
                  course={course}
                  courseId={id}
                  enrollment={enrollment}
                  isAuthenticated={isAuthenticated}
                  isEnrolled={isEnrolled}
                  isCourseTeacher={canManageDiscussion}
                  canAccessContent={canAccessContent}
                  videoError={videoError}
                  onOpenVideo={handleOpenVideo}
                  canOpenVideo={canOpenVideo}
                  onCommentCountChange={handleCommentCountChange}
                />
              </div>
            </section>

            <CourseOverview
              course={course}
              teacherName={teacherName}
              navCounts={navCounts}
            />
          </div>

          <div className="lg:col-span-4">
            <CourseEnrollmentCard
              course={course}
              isPaid={isPaid}
              isCenterCourse={isCenterCourse}
              isEnrolled={isEnrolled}
              isAuthenticated={isAuthenticated}
              enrolling={enrolling}
              onEnroll={handleEnroll}
            />
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentCheckout course={course} onClose={() => setShowPayment(false)} />
      )}
    </div>
  );
};

export default CoursePage;
