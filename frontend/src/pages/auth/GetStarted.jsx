import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Building2, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setUserRole, clearError } from '../../store/slices/authSlice';
import { getPostAuthPath } from '../../utils/authRedirect';
import Logo from '../../components/brand/Logo';

const ROLES = [
  {
    value: 'student',
    labelKey: 'auth.roles.student',
    descKey: 'auth.roles.studentDesc',
    icon: GraduationCap,
    gradient: 'linear-gradient(135deg, #5BA4E6 0%, #3E8DD6 100%)',
  },
  {
    value: 'teacher',
    labelKey: 'auth.roles.teacher',
    descKey: 'auth.roles.teacherDesc',
    icon: BookOpen,
    gradient: 'linear-gradient(135deg, #8FC5F7 0%, #5BA4E6 100%)',
  },
  {
    value: 'center_owner',
    labelKey: 'auth.roles.centerOwner',
    descKey: 'auth.roles.centerOwnerDesc',
    icon: Building2,
    gradient: 'linear-gradient(135deg, #FFD27A 0%, #5BA4E6 100%)',
  },
];

const GetStarted = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (user?.role) {
      navigate(getPostAuthPath(user), { replace: true });
    }
  }, [user, navigate]);

  const handleContinue = async () => {
    if (!selectedRole) return;

    const result = await dispatch(setUserRole(selectedRole));
    if (setUserRole.fulfilled.match(result)) {
      navigate(getPostAuthPath(result.payload.user), { replace: true });
    }
  };

  return (
    <div className="auth-shell min-h-screen py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl px-4"
      >
        <div className="text-center mb-10">
          <div className="inline-flex justify-center mb-5">
            <Logo variant="full" size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{t('auth.getStarted.title')}</h1>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            {user?.name
              ? t('auth.getStarted.subtitleNamed', { name: user.name.split(' ')[0] })
              : t('auth.getStarted.subtitle')}
          </p>
        </div>

        {error && (
          <div className="bg-destructive-muted text-destructive-muted-foreground px-4 py-3 rounded-lg mb-6 text-sm max-w-2xl mx-auto">
            {error}
            <button type="button" onClick={() => dispatch(clearError())} className="float-right">
              ×
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto">
          {ROLES.map(({ value, labelKey, descKey, icon: Icon, gradient }) => {
            const isSelected = selectedRole === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedRole(value)}
                className={`group relative text-left rounded-2xl border-2 p-5 transition-all duration-200 bg-card hover:shadow-md ${
                  isSelected
                    ? 'border-primary shadow-lg ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-foreground mb-4 shadow-sm"
                  style={{ background: gradient }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-foreground">{t(labelKey)}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-snug">{t(descKey)}</p>
                {isSelected && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base disabled:opacity-50"
          >
            {loading ? t('common.loading') : t('auth.getStarted.continue')}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GetStarted;
