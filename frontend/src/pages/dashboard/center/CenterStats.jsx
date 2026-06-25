import { useTranslation } from 'react-i18next';
import { FiStar, FiTrendingUp, FiUsers, FiBook } from 'react-icons/fi';
import useMyCenter from '../../../hooks/useMyCenter';
import CreateCenterForm from './CreateCenterForm';

const CenterStats = () => {
  const { t } = useTranslation();
  const { center, stats, loading, refresh } = useMyCenter();

  if (loading) return <div className="animate-pulse h-64 bg-muted rounded-xl" />;
  if (!center) return <CreateCenterForm onCreated={refresh} />;

  const courses = center.courses || [];
  const teachers = center.teachers || [];
  const students = center.students || [];

  const avgStudentsPerCourse = courses.length
    ? (students.length / courses.length).toFixed(1)
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{t('dashboard.center.statsPage.title')}</h1>
      <p className="text-muted-foreground mb-8">{t('dashboard.center.statsPage.subtitle', { name: center.name })}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FiBook, label: t('dashboard.center.statsPage.totalCourses'), value: stats?.totalCourses || 0, color: 'text-primary' },
          { icon: FiUsers, label: t('dashboard.center.statsPage.teachers'), value: stats?.totalTeachers || 0, color: 'text-primary' },
          { icon: FiUsers, label: t('dashboard.center.statsPage.students'), value: stats?.totalStudents || 0, color: 'text-primary' },
          { icon: FiTrendingUp, label: t('dashboard.center.statsPage.popularity'), value: stats?.popularity || 0, color: 'text-secondary' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5 text-center">
            <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FiStar className="text-secondary" /> {t('dashboard.center.statsPage.ratings')}
          </h2>
          <div className="text-center py-4">
            <p className="text-5xl font-bold text-primary">{stats?.rating?.toFixed(1) || '0.0'}</p>
            <p className="text-muted-foreground mt-1">{stats?.numReviews || 0} {t('common.reviews')}</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold mb-4">{t('dashboard.center.statsPage.engagementMetrics')}</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('dashboard.center.statsPage.avgStudentsPerCourse')}</span>
              <span className="font-bold">{avgStudentsPerCourse}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('dashboard.center.statsPage.revenueMad')}</span>
              <span className="font-bold text-primary">{stats?.revenue || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('dashboard.center.statsPage.verifiedStatus')}</span>
              <span className={`badge ${center.isVerified ? 'badge-verified' : 'bg-muted text-muted-foreground'}`}>
                {center.isVerified ? t('common.verified') : t('dashboard.center.statsPage.pending')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">{t('dashboard.center.statsPage.coursesOverview')}</h2>
        {courses.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('dashboard.center.statsPage.noCourses')}</p>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => {
              const enrolled = course.enrolledStudents?.length || 0;
              const maxEnrolled = Math.max(...courses.map((c) => c.enrolledStudents?.length || 0), 1);
              const pct = Math.round((enrolled / maxEnrolled) * 100);
              return (
                <div key={course._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium truncate">{course.title}</span>
                    <span className="text-muted-foreground ml-2">{t('dashboard.center.statsPage.studentsCount', { count: enrolled })}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent0 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">{t('dashboard.center.statsPage.teachersOverview')}</h2>
        {teachers.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t('dashboard.center.statsPage.noTeachers')}</p>
        ) : (
          <div className="space-y-3">
            {teachers.map((teacher) => (
              <div key={teacher._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-sm">{teacher.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{teacher.subjects?.join(', ') || t('dashboard.center.statsPage.noSubjects')}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{t('dashboard.center.statsPage.coursesCount', { count: teacher.courses?.length || 0 })}</p>
                  <p className="text-primary">★ {teacher.rating?.toFixed(1) || '0.0'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CenterStats;
