import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FiUser, FiUsers } from 'react-icons/fi';
import { teacherAPI } from '../../../api/index';
import { fetchCurrentUser } from '../../../store/slices/authSlice';
import { SUBJECTS } from '../../../utils/helpers';
import JoinCenterForm from './JoinCenterForm';

const CreateTeacherProfile = ({ onCreated, embedded = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [mode, setMode] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    bio: '',
    subjects: ['Programming'],
    experience: { years: 0, description: '' },
  });

  const handleComplete = async () => {
    await dispatch(fetchCurrentUser());
    onCreated?.();
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await teacherAPI.create(profile);
      await handleComplete();
    } catch (err) {
      setError(err.response?.data?.message || t('dashboard.teacher.createProfile.failed'));
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <>
      {!embedded && (
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Set Up Your Teacher Profile</h1>
          <p className="text-muted-foreground mt-1">Create a profile or join a center with an invitation code</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMode('profile')}
          className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
            mode === 'profile' ? 'border-primary bg-accent' : 'border-border'
          }`}
        >
          <FiUser className="w-5 h-5 mx-auto mb-1" /> Create Profile
        </button>
        <button
          type="button"
          onClick={() => setMode('join')}
          className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
            mode === 'join' ? 'border-primary bg-accent' : 'border-border'
          }`}
        >
          <FiUsers className="w-5 h-5 mx-auto mb-1" /> Join Center
        </button>
      </div>

      {error && mode === 'profile' && (
        <div className="bg-destructive-muted text-destructive-muted-foreground px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {mode === 'profile' ? (
        <form onSubmit={handleCreateProfile} className={embedded ? 'space-y-4' : 'card p-6 space-y-4'}>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Bio</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder={t('dashboard.teacher.createProfile.bioPlaceholder')}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Subjects</label>
            <select
              multiple
              className="input-field h-32"
              value={profile.subjects}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  subjects: Array.from(e.target.selectedOptions, (o) => o.value),
                })
              }
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Years of Experience</label>
            <input
              type="number"
              min="0"
              className="input-field"
              value={profile.experience.years}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  experience: { ...profile.experience, years: Number(e.target.value) },
                })
              }
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
            {loading ? t('dashboard.teacher.createProfile.creating') : t('dashboard.teacher.createProfile.submit')}
          </button>
        </form>
      ) : (
        <JoinCenterForm onSuccess={handleComplete} compact={embedded} />
      )}
    </>
  );

  if (embedded) return content;

  return <div className="max-w-lg mx-auto">{content}</div>;
};

export default CreateTeacherProfile;
