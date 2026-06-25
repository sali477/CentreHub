import { FiMail, FiBook } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import useMyTeacher from '../../../hooks/useMyTeacher';
import TeacherSetupBanner from './TeacherSetupBanner';
import { getInitials, formatDate } from '../../../utils/helpers';

const TeacherStudents = () => {
  const { t } = useTranslation();
  const { teacher, loading, refresh } = useMyTeacher();

  if (loading) return <div className="animate-pulse h-64 bg-muted rounded-xl" />;

  const needsSetup = !teacher;
  const studentMap = new Map();

  if (teacher) {
    (teacher.courses || []).forEach((course) => {
      (course.enrolledStudents || []).forEach((student) => {
        const existing = studentMap.get(student._id);
        if (existing) {
          existing.courses.push(course.title);
        } else {
          studentMap.set(student._id, { ...student, courses: [course.title] });
        }
      });
    });
  }

  const students = Array.from(studentMap.values());

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{t('dashboard.teacher.studentsTitle')}</h1>
      <p className="text-muted-foreground mb-6">{t('common.enrolledStudents', { count: students.length })}</p>

      {needsSetup && <TeacherSetupBanner onComplete={refresh} />}

      {students.length === 0 ? (
        <div className="card p-8 text-center text-muted-foreground">
          <FiBook className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p>{t('dashboard.teacher.noStudents')}</p>
          <p className="text-sm mt-1">{t('dashboard.teacher.noStudentsHint')}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('dashboard.teacher.tableStudent')}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('dashboard.teacher.tableEmail')}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">{t('dashboard.teacher.tableCourses')}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">{t('dashboard.teacher.tableJoined')}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b border-border hover:bg-muted">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {student.avatar ? (
                          <img src={student.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-primary font-medium text-sm">
                            {getInitials(student.name)}
                          </div>
                        )}
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="flex items-center gap-1"><FiMail className="w-3 h-3" />{student.email}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {student.courses.join(', ')}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {student.createdAt ? formatDate(student.createdAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
