import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEye } from 'react-icons/fi';
import { courseAPI } from '../../../api/index';
import useMyCenter from '../../../hooks/useMyCenter';
import CreateCenterForm from './CreateCenterForm';
import { SUBJECTS, formatPrice } from '../../../utils/helpers';
import SubjectIconCard from '../../../components/courses/SubjectIconCard';

const CenterCourses = () => {
  const { t } = useTranslation();
  const { center, loading, refresh } = useMyCenter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', subject: 'Programming', price: 0,
    isFree: false, level: 'all', teacherId: '',
  });
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.teacherId) {
      alert(t('dashboard.center.coursesPage.selectTeacher'));
      return;
    }
    setCreating(true);
    try {
      await courseAPI.create({
        title: form.title,
        description: form.description,
        subject: form.subject,
        price: form.isFree ? 0 : form.price,
        isFree: form.isFree,
        level: form.level,
        center: center._id,
        teacher: form.teacherId,
        isPublished: true,
      });
      setShowForm(false);
      setForm({ title: '', description: '', subject: 'Programming', price: 0, isFree: false, level: 'all', teacherId: '' });
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || t('dashboard.center.coursesPage.createFailed'));
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-muted rounded-xl" />;
  if (!center) return <CreateCenterForm onCreated={refresh} />;

  const courses = center.courses || [];
  const teachers = center.teachers || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.center.coursesPage.title')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.center.coursesPage.coursesCount', { count: courses.length })}
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2"
          disabled={teachers.length === 0}>
          <FiPlus /> {t('dashboard.center.coursesPage.addCourse')}
        </button>
      </div>

      {teachers.length === 0 && (
        <div className="bg-accent text-accent-foreground p-4 rounded-lg mb-4 text-sm">
          {t('dashboard.center.coursesPage.addTeachersFirst')}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-6 space-y-4">
          <h2 className="font-semibold">{t('dashboard.center.coursesPage.createNewCourse')}</h2>
          <input required className="input-field" placeholder={t('dashboard.center.coursesPage.titlePlaceholder')} value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea required className="input-field" rows={3} placeholder={t('dashboard.center.coursesPage.descPlaceholder')} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select className="input-field" value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select required className="input-field" value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
              <option value="">{t('dashboard.center.coursesPage.selectTeacherOption')}</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>{teacher.user?.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select className="input-field" value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option value="all">{t('dashboard.center.coursesPage.allLevels')}</option>
              <option value="beginner">{t('dashboard.center.coursesPage.beginner')}</option>
              <option value="intermediate">{t('dashboard.center.coursesPage.intermediate')}</option>
              <option value="advanced">{t('dashboard.center.coursesPage.advanced')}</option>
            </select>
            <label className="flex items-center gap-2 px-4 py-2.5 border rounded-lg cursor-pointer">
              <input type="checkbox" checked={form.isFree}
                onChange={(e) => setForm({ ...form, isFree: e.target.checked })} />
              {t('dashboard.center.coursesPage.freeCourse')}
            </label>
            {!form.isFree && (
              <input type="number" min="0" className="input-field" placeholder={t('dashboard.center.coursesPage.pricePlaceholder')} value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            )}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? t('dashboard.center.coursesPage.creating') : t('dashboard.center.coursesPage.createCourse')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">{t('common.cancel')}</button>
          </div>
        </form>
      )}

      {courses.length === 0 ? (
        <div className="card p-8 text-center text-muted-foreground">{t('dashboard.center.coursesPage.noCourses')}</div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course._id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <SubjectIconCard subject={course.subject} size="sm" showGlow={false} />
                <div>
                  <h3 className="font-medium">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {course.subject} • {course.teacher?.user?.name || t('common.teacher')} • {formatPrice(course.price)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('dashboard.center.coursesPage.studentsEnrolled', { count: course.enrolledStudents?.length || 0 })} • {course.isPublished ? t('common.published') : t('common.draft')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/courses/${course._id}`} className="btn-secondary text-sm flex items-center gap-1 py-2">
                  <FiEye /> {t('common.view')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CenterCourses;
