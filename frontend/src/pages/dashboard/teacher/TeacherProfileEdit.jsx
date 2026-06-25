import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FiSave, FiUpload, FiUser } from 'react-icons/fi';
import { teacherAPI, uploadAPI, authAPI } from '../../../api/index';
import { fetchCurrentUser } from '../../../store/slices/authSlice';
import useMyTeacher from '../../../hooks/useMyTeacher';
import TeacherSetupBanner from './TeacherSetupBanner';
import { SUBJECTS } from '../../../utils/helpers';

const buildFormFromTeacher = (teacher) => ({
  name: teacher.user?.name || '',
  phone: teacher.user?.phone || '',
  bio: teacher.bio || '',
  photo: teacher.photo || teacher.user?.avatar || '',
  subjects: teacher.subjects?.length ? teacher.subjects : ['Programming'],
  experienceYears: teacher.experience?.years || 0,
  experienceDescription: teacher.experience?.description || '',
});

const TeacherProfileEdit = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { teacher, loading, refresh } = useMyTeacher();
  const initialForm = useMemo(() => (teacher ? buildFormFromTeacher(teacher) : null), [teacher]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (initialForm) {
      setForm(initialForm);
    }
  }, [initialForm]);

  if (loading || (teacher && !form)) {
    return <div className="animate-pulse h-64 bg-muted rounded-xl" />;
  }

  if (!teacher) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">{t('dashboard.teacher.profileEdit.title')}</h1>
        <p className="text-muted-foreground mb-6">{t('dashboard.teacher.profileEdit.createFirst')}</p>
        <TeacherSetupBanner onComplete={refresh} />
      </div>
    );
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await uploadAPI.image(fd);
      setForm((prev) => ({ ...prev, photo: data.url }));
    } catch {
      alert(t('dashboard.teacher.profileEdit.photoFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (form.name.trim() !== teacher.user?.name || form.phone !== (teacher.user?.phone || '')) {
        await authAPI.updateProfile({
          name: form.name.trim(),
          phone: form.phone.trim(),
        });
      }

      await teacherAPI.update(teacher._id, {
        bio: form.bio,
        photo: form.photo,
        subjects: form.subjects,
        experience: {
          years: Number(form.experienceYears) || 0,
          description: form.experienceDescription,
        },
      });

      setMessage(t('dashboard.teacher.profileEdit.updated'));
      await dispatch(fetchCurrentUser());
      refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || t('dashboard.teacher.profileEdit.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.teacher.profileEdit.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.teacher.profileEdit.subtitle')}</p>
        </div>
        <Link to={`/teachers/${teacher._id}`} className="btn-secondary text-sm">
          {t('dashboard.teacher.viewPublicProfile')}
        </Link>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg mb-6 text-sm ${
            message.toLowerCase().includes('success')
              ? 'bg-accent text-accent-foreground border border-border'
              : 'bg-destructive-muted text-destructive-muted-foreground border border-destructive-muted'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="shrink-0">
            {form.photo ? (
              <img src={form.photo} alt="" className="w-28 h-28 rounded-xl object-cover border border-border" />
            ) : (
              <div className="w-28 h-28 rounded-xl bg-accent flex items-center justify-center">
                <FiUser className="w-10 h-10 text-primary" />
              </div>
            )}
            <label className="btn-secondary text-sm mt-3 inline-flex items-center gap-2 cursor-pointer">
              <FiUpload className="w-4 h-4" />
              {uploading ? t('dashboard.teacher.profileEdit.uploading') : t('dashboard.teacher.profileEdit.changePhoto')}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>

          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('dashboard.teacher.profileEdit.fullName')}</label>
              <input
                required
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('dashboard.teacher.profileEdit.phone')}</label>
              <input
                className="input-field"
                placeholder="+212 6XX XXX XXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t('dashboard.teacher.profileEdit.bio')}</label>
          <textarea
            className="input-field"
            rows={4}
            placeholder={t('dashboard.teacher.profileEdit.bioPlaceholder')}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">{t('dashboard.teacher.profileEdit.subjects')}</label>
          <select
            multiple
            className="input-field h-32"
            value={form.subjects}
            onChange={(e) =>
              setForm({
                ...form,
                subjects: Array.from(e.target.selectedOptions, (o) => o.value),
              })
            }
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1">{t('dashboard.teacher.profileEdit.subjectsHint')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('dashboard.teacher.profileEdit.yearsExperience')}</label>
            <input
              type="number"
              min="0"
              className="input-field"
              value={form.experienceYears}
              onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('dashboard.teacher.profileEdit.experienceDetails')}</label>
            <input
              className="input-field"
              placeholder={t('dashboard.teacher.profileEdit.experiencePlaceholder')}
              value={form.experienceDescription}
              onChange={(e) => setForm({ ...form, experienceDescription: e.target.value })}
            />
          </div>
        </div>

        {teacher.center && (
          <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            {t('dashboard.teacher.profileEdit.affiliatedCenter', { name: teacher.center.name })}
            {teacher.teacherCode && (
              <span className="ml-2">• {t('dashboard.teacher.profileEdit.codeLabel', { code: teacher.teacherCode })}</span>
            )}
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
          <FiSave />
          {saving ? t('dashboard.teacher.profileEdit.saving') : t('dashboard.teacher.profileEdit.saveProfile')}
        </button>
      </form>
    </div>
  );
};

export default TeacherProfileEdit;
