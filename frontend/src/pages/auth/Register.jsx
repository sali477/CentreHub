import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { registerUser, googleLogin, clearError } from '../../store/slices/authSlice';
import { getPostAuthPath } from '../../utils/authRedirect';
import Logo from '../../components/brand/Logo';
import GoogleAuthSection from '../../components/auth/GoogleAuthSection';

const Register = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert(t('auth.passwordsNoMatch'));
      return;
    }
    const result = await dispatch(
      registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      })
    );
    if (registerUser.fulfilled.match(result)) {
      navigate(getPostAuthPath(result.payload.user), { replace: true });
    }
  };

  const handleGoogleSuccess = async (response) => {
    const result = await dispatch(googleLogin({ credential: response.credential }));
    if (googleLogin.fulfilled.match(result)) {
      navigate(getPostAuthPath(result.payload.user), { replace: true });
    }
  };

  return (
    <div className="auth-shell">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-5">
            <Logo variant="full" size="lg" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{t('auth.createYourAccount')}</h1>
          <p className="text-muted-foreground mt-1">{t('auth.joinToday')}</p>
        </div>

        <div className="auth-card">
          {error && (
            <div className="bg-destructive-muted text-destructive-muted-foreground px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
              <button type="button" onClick={() => dispatch(clearError())} className="float-right">×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('auth.fullName')}</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('auth.email')}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('auth.password')}</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('auth.confirmPassword')}</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="input-field"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('common.loading') : t('auth.registerButton')}
            </button>
          </form>

          <GoogleAuthSection
            onSuccess={handleGoogleSuccess}
            onError={() => alert('Google signup failed. Check that Google OAuth is configured in .env files.')}
            text="signup_with"
            dividerLabel="Or"
          />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">{t('auth.signInButton')}</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
