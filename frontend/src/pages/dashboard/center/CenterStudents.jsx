import { useTranslation } from 'react-i18next';
import { FiMail, FiBook } from 'react-icons/fi';
import useMyCenter from '../../../hooks/useMyCenter';
import CreateCenterForm from './CreateCenterForm';
import { getInitials, formatDate } from '../../../utils/helpers';

const CenterStudents = () => {
  const { t } = useTranslation();
  const { center, loading, refresh } = useMyCenter();

  if (loading) return <div className="animate-pulse h-64 bg-muted rounded-xl" />;
  if (!center) return <CreateCenterForm onCreated={refresh} />;

  const students = center.students || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{t('dashboard.center.studentsPage.title')}</h1>
      <p className="text-muted-foreground mb-6">
        {t('dashboard.center.studentsPage.enrolledCount', { count: students.length })}
      </p>

      {students.length === 0 ? (
        <div className="card p-8 text-center text-muted-foreground">
          <FiBook className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p>{t('dashboard.center.studentsPage.noStudents')}</p>
          <p className="text-sm mt-1">{t('dashboard.center.studentsPage.noStudentsHint')}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('dashboard.center.studentsPage.tableStudent')}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t('dashboard.center.studentsPage.tableEmail')}</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">{t('dashboard.center.studentsPage.tableJoined')}</th>
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

export default CenterStudents;
