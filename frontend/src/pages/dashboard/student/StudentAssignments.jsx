import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import { FiClipboard, FiHelpCircle, FiUpload, FiCheckCircle, FiClock } from 'react-icons/fi';

import { formatDateTime } from '../../../utils/helpers';

import { useStudentEnrollments } from '../../../hooks/useStudentDashboard';



const STATUS_STYLES = {

  pending: 'bg-accent text-accent-foreground',

  submitted: 'bg-primary/10 text-primary',

  graded: 'bg-muted text-muted-foreground',

};



const StudentAssignments = () => {

  const { t } = useTranslation();

  const { assignments, loading, error } = useStudentEnrollments();



  const pending = assignments.filter((a) => a.status === 'pending');

  const submitted = assignments.filter((a) => a.status === 'submitted');



  if (loading) {

    return <div className="animate-pulse h-64 bg-muted rounded-xl" />;

  }



  return (

    <div className="space-y-8">

      <div>

        <h1 className="text-2xl font-bold text-foreground">{t('dashboard.student.assignmentsTitle')}</h1>

        <p className="text-muted-foreground mt-1">

          {t('dashboard.student.assignmentsSubtitle')}

        </p>

      </div>



      {error && (

        <div className="card p-4 text-sm text-destructive-muted-foreground">{error}</div>

      )}



      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="card p-5">

          <p className="text-2xl font-bold text-foreground">{assignments.length}</p>

          <p className="text-sm text-muted-foreground">{t('dashboard.student.totalItems')}</p>

        </div>

        <div className="card p-5">

          <p className="text-2xl font-bold text-foreground">{pending.length}</p>

          <p className="text-sm text-muted-foreground">{t('dashboard.student.toComplete')}</p>

        </div>

        <div className="card p-5">

          <p className="text-2xl font-bold text-foreground">{submitted.length}</p>

          <p className="text-sm text-muted-foreground">{t('dashboard.student.submitted')}</p>

        </div>

      </div>



      <section className="card p-6 border-dashed border-primary/20 bg-accent/20">

        <div className="flex items-start gap-3">

          <FiUpload className="w-5 h-5 text-primary shrink-0 mt-0.5" />

          <div>

            <h2 className="font-semibold text-foreground">{t('dashboard.student.uploadAssignment')}</h2>

            <p className="text-sm text-muted-foreground mt-1">

              {t('dashboard.student.uploadComingSoon')}

            </p>

            <button type="button" disabled className="btn-secondary text-sm mt-3 opacity-60 cursor-not-allowed">

              {t('dashboard.student.uploadFileSoon')}

            </button>

          </div>

        </div>

      </section>



      {assignments.length === 0 ? (

        <div className="card p-10 text-center text-muted-foreground">

          <FiClipboard className="w-12 h-12 mx-auto mb-3 opacity-50" />

          <p>{t('dashboard.student.noAssignments')}</p>

          <Link to="/dashboard/student/courses" className="text-primary hover:underline mt-2 inline-block">

            {t('dashboard.student.viewMyCourses')}

          </Link>

        </div>

      ) : (

        <div className="space-y-3">

          {assignments.map((item) => (

            <div

              key={item.id}

              className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"

            >

              <div className="flex items-start gap-3 min-w-0">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">

                  {item.type === 'quiz' ? (

                    <FiHelpCircle className="w-5 h-5" />

                  ) : (

                    <FiClipboard className="w-5 h-5" />

                  )}

                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="font-semibold text-foreground">{item.title}</h3>

                    <span

                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${

                        STATUS_STYLES[item.status] || STATUS_STYLES.pending

                      }`}

                    >

                      {item.status === 'submitted' ? t('dashboard.student.submitted') : t('common.pending')}

                    </span>

                  </div>

                  <p className="text-sm text-muted-foreground mt-0.5">

                    {item.courseTitle} • {item.type === 'quiz' ? t('dashboard.student.quiz') : t('dashboard.student.exam')} • {item.meta}

                  </p>

                  {item.dueDate && (

                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">

                      <FiClock className="w-3 h-3" />

                      {t('common.dueAt', { date: formatDateTime(item.dueDate) })}

                    </p>

                  )}

                  {item.status === 'submitted' && (

                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">

                      <FiCheckCircle className="w-3 h-3 text-primary" />

                      {t('dashboard.student.feedbackAfterReview')}

                    </p>

                  )}

                </div>

              </div>

              {item.status === 'pending' && item.link && (

                <Link to={item.link} className="btn-primary text-sm py-2 px-4 shrink-0">

                  {item.type === 'quiz' ? t('dashboard.student.startQuiz') : t('dashboard.student.startExam')}

                </Link>

              )}

              {item.status === 'submitted' && item.link && (

                <Link to={item.link} className="btn-secondary text-sm py-2 px-4 shrink-0">

                  {t('common.review')}

                </Link>

              )}

            </div>

          ))}

        </div>

      )}

    </div>

  );

};



export default StudentAssignments;

