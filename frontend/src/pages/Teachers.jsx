import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { teacherAPI } from '../api/index';
import { TeacherHomeCard } from '../components/home/TopTeachersSection';
import StableCardGrid from '../components/common/StableCardGrid';
import { getEntityId } from '../utils/entityId';

const Teachers = () => {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTeachers = useCallback(() => {
    setLoading(true);
    teacherAPI
      .getAll({ sort: '-rating' })
      .then(({ data }) => setTeachers(data.data || []))
      .catch(() => setTeachers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  return (
    <div className="page-shell">
      <h1 className="section-title mb-8">{t('teachersPage.title')}</h1>

      <StableCardGrid
        items={teachers}
        loading={loading}
        emptyMessage={t('teachersPage.empty')}
        gridClassName="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        minHeight="min-h-[24rem]"
        skeletonCount={8}
        getKey={(teacher, index) => getEntityId(teacher) || index}
        renderItem={(teacher) => <TeacherHomeCard teacher={teacher} />}
      />
    </div>
  );
};

export default Teachers;
