import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { FiBook, FiExternalLink, FiPlay } from 'react-icons/fi';

import { useStudentEnrollments } from '../../../hooks/useStudentDashboard';

import StudentJoinByCode from '../../../components/dashboard/student/StudentJoinByCode';

import { ProgressBar } from '../../../components/dashboard/student/studentUi';



const StudentCourses = () => {

  const { t } = useTranslation();

  const { enrollments, loading, error, refresh } = useStudentEnrollments();



  const activeCourses = enrollments.filter((e) => e.status === 'active');

  const completedCourses = enrollments.filter((e) => e.status === 'completed');

  const continueLearning = [...enrollments]

    .filter((e) => e.status !== 'completed')

    .sort((a, b) => (b.progress?.percentage || 0) - (a.progress?.percentage || 0));



  if (loading) {

    return <div className="animate-pulse h-64 bg-muted rounded-xl" />;

  }



  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-2xl font-bold text-foreground">{t('dashboard.student.myCoursesTitle')}</h1>

        <p className="text-muted-foreground mt-1">

          {t('common.enrolledCount', { count: enrollments.length })}

        </p>

      </div>



      {error && (

        <div className="card p-4 text-sm text-destructive-muted-foreground border border-destructive/20">

          {error}

        </div>

      )}



      {continueLearning.length > 0 && (

        <section>

          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">

            <FiPlay className="w-5 h-5 text-primary" />

            {t('dashboard.student.continueLearning')}

          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {continueLearning.slice(0, 4).map((enrollment) => (

              <Link

                key={enrollment._id}

                to={`/courses/${enrollment.course?._id}`}

                className="card p-5 hover:shadow-premium-lg transition-all group"

              >

                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">

                  {enrollment.course?.title}

                </h3>

                <p className="text-sm text-muted-foreground mt-1 capitalize">{t(`common.${enrollment.status}`, { defaultValue: enrollment.status })}</p>

                <div className="mt-4">

                  <div className="flex justify-between text-xs mb-1">

                    <span className="text-muted-foreground">{t('common.progress')}</span>

                    <span className="font-bold text-primary">

                      {enrollment.progress?.percentage || 0}%

                    </span>

                  </div>

                  <ProgressBar value={enrollment.progress?.percentage} />

                </div>

                <span className="inline-flex items-center gap-1 text-sm text-primary mt-4 font-medium">

                  {t('common.continue')} <FiExternalLink className="w-3.5 h-3.5" />

                </span>

              </Link>

            ))}

          </div>

        </section>

      )}



      <section>

        <h2 className="text-lg font-semibold text-foreground mb-4">{t('dashboard.student.allEnrolled')}</h2>

        {enrollments.length === 0 ? (

          <div className="card p-8 text-center text-muted-foreground">

            <FiBook className="w-12 h-12 mx-auto mb-3 opacity-50" />

            <p>{t('dashboard.student.noCourses')}</p>

            <Link to="/courses" className="text-primary hover:underline mt-2 inline-block">

              {t('dashboard.student.browseCourses')}

            </Link>

          </div>

        ) : (

          <div className="space-y-3">

            {enrollments.map((enrollment) => (

              <Link

                key={enrollment._id}

                to={`/courses/${enrollment.course?._id}`}

                className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-premium transition-shadow"

              >

                <div className="min-w-0">

                  <h3 className="font-medium truncate">{enrollment.course?.title || t('dashboard.student.untitledCourse')}</h3>

                  <p className="text-sm text-muted-foreground capitalize">{t(`common.${enrollment.status}`, { defaultValue: enrollment.status })}</p>

                  {enrollment.course?.teacher?.user?.name && (

                    <p className="text-xs text-muted-foreground mt-1">

                      {t('dashboard.student.instructorLabel', { name: enrollment.course.teacher.user.name })}

                    </p>

                  )}

                </div>

                <div className="flex items-center gap-4 shrink-0">

                  <div className="w-28">

                    <p className="text-xs text-muted-foreground mb-1 text-right">{t('common.completion')}</p>

                    <ProgressBar value={enrollment.progress?.percentage} />

                    <p className="text-xs font-bold text-primary text-right mt-1">

                      {enrollment.progress?.percentage || 0}%

                    </p>

                  </div>

                  <FiExternalLink className="w-4 h-4 text-muted-foreground" />

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>



      {(activeCourses.length > 0 || completedCourses.length > 0) && (

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="card p-5">

            <p className="text-2xl font-bold text-foreground">{activeCourses.length}</p>

            <p className="text-sm text-muted-foreground">{t('dashboard.student.activeCourses')}</p>

          </div>

          <div className="card p-5">

            <p className="text-2xl font-bold text-foreground">{completedCourses.length}</p>

            <p className="text-sm text-muted-foreground">{t('dashboard.student.completedCourses')}</p>

          </div>

        </div>

      )}



      <StudentJoinByCode onEnrolled={refresh} />

    </div>

  );

};



export default StudentCourses;

