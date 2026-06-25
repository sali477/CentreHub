import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiPlus, FiEye, FiEdit2 } from 'react-icons/fi';
import { courseAPI } from '../../../api/index';
import useMyTeacher from '../../../hooks/useMyTeacher';
import TeacherSetupBanner from './TeacherSetupBanner';
import { SUBJECTS, formatPrice } from '../../../utils/helpers';
import SubjectIconCard from '../../../components/courses/SubjectIconCard';

const emptyForm = {
  title: '',
  description: '',
  subject: 'Programming',
  isFree: true,
  price: 0,
  level: 'all',
  isPublished: true,
};

const courseToForm = (course) => ({
  title: course.title || '',
  description: course.description || '',
  subject: course.subject || 'Programming',
  level: course.level || 'all',
  isFree: course.courseType !== 'paid' && (course.isFree !== false && !(course.price > 0)),
  price: course.price || 0,
  isPublished: course.isPublished !== false,
});

const CourseFormFields = ({ form, setForm, isIndependent }) => (
  <>
    <input
      required
      className="input-field"
      placeholder="Course Title"
      value={form.title}
      onChange={(e) => setForm({ ...form, title: e.target.value })}
    />
    <textarea
      required
      className="input-field"
      rows={3}
      placeholder="Description"
      value={form.description}
      onChange={(e) => setForm({ ...form, description: e.target.value })}
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <select
        className="input-field"
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
      >
        {SUBJECTS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select
        className="input-field"
        value={form.level}
        onChange={(e) => setForm({ ...form, level: e.target.value })}
      >
        <option value="all">All Levels</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
    </div>
    {isIndependent ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFree}
            onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
            className="rounded border-border text-primary focus:ring-primary"
          />
          Free course
        </label>
        {!form.isFree && (
          <input
            type="number"
            min="1"
            required
            className="input-field"
            placeholder="Price (MAD)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
        )}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/50 px-4 py-3">
        Center courses are free for students. They enroll using your teacher code.
      </p>
    )}
    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
      <input
        type="checkbox"
        checked={form.isPublished}
        onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
        className="rounded border-border text-primary focus:ring-primary"
      />
      Published (visible to students)
    </label>
  </>
);

const buildPayload = (form, isIndependent, teacher) => {
  const isPaid = isIndependent && !form.isFree;
  return {
    title: form.title,
    description: form.description,
    subject: form.subject,
    level: form.level,
    isPublished: form.isPublished,
    courseType: isPaid ? 'paid' : 'free',
    price: isPaid ? form.price : 0,
    isFree: !isPaid,
    center: teacher?.center?._id || teacher?.center,
  };
};

const TeacherCourses = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { teacher, loading, refresh } = useMyTeacher();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const isIndependent = !teacher?.center;
  const [form, setForm] = useState(emptyForm);

  const courses = teacher?.courses || [];

  const resetForms = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const startEdit = (course) => {
    setShowForm(false);
    setEditingId(course._id);
    setForm(courseToForm(course));
  };

  useEffect(() => {
    const editId = location.state?.editCourseId;
    if (editId && courses.length) {
      const course = courses.find((c) => c._id === editId);
      if (course) startEdit(course);
      return;
    }
    if (location.state?.createCourse || courses.length === 0) {
      setShowForm(true);
    }
  }, [location.state?.editCourseId, location.state?.createCourse, courses.length]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await courseAPI.create(buildPayload(form, isIndependent, teacher));
      resetForms();
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || t('dashboard.teacher.coursesPage.createFailed'));
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      await courseAPI.update(editingId, buildPayload(form, isIndependent, teacher));
      resetForms();
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || t('dashboard.teacher.coursesPage.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse h-64 bg-muted rounded-xl" />;

  const needsSetup = !teacher;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.teacher.myCourses')}</h1>
          <p className="text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
            {teacher?.center && teacher.teacherCode && (
              <span className="ml-2 text-primary">• Code: {teacher.teacherCode}</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { if (!needsSetup) (showForm ? resetForms() : startCreate()); }}
          disabled={needsSetup}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <FiPlus /> Add Course
        </button>
      </div>

      {needsSetup && <TeacherSetupBanner onComplete={refresh} />}

      {teacher?.center && (
        <div className="card p-4 mb-6 bg-accent text-sm text-accent-foreground">
          Center courses belong to <strong>{teacher.center.name}</strong>. Students enroll using your teacher code.
        </div>
      )}

      {!needsSetup && showForm && (
        <form onSubmit={handleCreate} className="card p-6 mb-6 space-y-4">
          <h2 className="font-semibold">Create New Course</h2>
          <CourseFormFields form={form} setForm={setForm} isIndependent={isIndependent} />
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? t('common.creating') : t('dashboard.teacher.coursesPage.createCourse')}
            </button>
            <button type="button" onClick={resetForms} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {!needsSetup && editingId && (
        <form onSubmit={handleUpdate} className="card p-6 mb-6 space-y-4 border-2 border-border">
          <h2 className="font-semibold text-accent-foreground">Modifier le cours</h2>
          <CourseFormFields form={form} setForm={setForm} isIndependent={isIndependent} />
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button type="button" onClick={resetForms} className="btn-secondary">
              Annuler
            </button>
          </div>
        </form>
      )}

      {!needsSetup && courses.length === 0 && !showForm && !editingId && (
        <div className="card p-8 text-center text-muted-foreground">
          <p className="mb-4">No courses yet. Create your first course below.</p>
          <button type="button" onClick={startCreate} className="btn-primary inline-flex items-center gap-2">
            <FiPlus /> Add Course
          </button>
        </div>
      )}

      {!needsSetup && courses.length > 0 && (
        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className={`card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                editingId === course._id ? 'ring-2 ring-primary/20' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <SubjectIconCard subject={course.subject} size="sm" showGlow={false} />
                <div className="min-w-0">
                <h3 className="font-medium">{course.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {course.subject} •{' '}
                  {course.courseType === 'paid' || (!course.isFree && course.price > 0)
                    ? formatPrice(course.price)
                    : 'Free'}{' '}
                  • {course.enrolledStudents?.length || 0} students
                </p>
                <p className="text-xs text-muted-foreground">
                  {course.isPublished ? 'Published' : 'Draft'}
                  {course.isIndependent ? ' • Independent' : ' • Center course'}
                </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(course)}
                  className="btn-primary text-sm flex items-center gap-1 py-2"
                >
                  <FiEdit2 /> Modifier
                </button>
                <Link
                  to={`/courses/${course._id}`}
                  className="btn-secondary text-sm flex items-center gap-1 py-2"
                >
                  <FiEye /> View
                </Link>
                <Link
                  to="/dashboard/teacher/content"
                  state={{ courseId: course._id }}
                  className="btn-secondary text-sm py-2"
                >
                  Add Content
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;
