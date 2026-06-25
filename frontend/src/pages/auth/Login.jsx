import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { loginUser, googleLogin, clearError } from '../../store/slices/authSlice';
import { getPostAuthPath } from '../../utils/authRedirect';
import Logo from '../../components/brand/Logo';
import GoogleAuthSection from '../../components/auth/GoogleAuthSection';

const Login = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const redirectAfterLogin = (user) => {
    const from = location.state?.from;
    const fromPath = typeof from === 'string' ? from : from?.pathname;
    navigate(getPostAuthPath(user, fromPath), { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      redirectAfterLogin(result.payload.user);
    }
  };

  const handleGoogleSuccess = async (response) => {
    const result = await dispatch(googleLogin({ credential: response.credential }));
    if (googleLogin.fulfilled.match(result)) {
      redirectAfterLogin(result.payload.user);
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
          <h1 className="text-2xl font-bold text-foreground">{t('auth.welcomeBack')}</h1>
          <p className="text-muted-foreground mt-1">{t('auth.signInSubtitle')}</p>
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
              <label className="block text-sm font-medium text-foreground mb-1">{t('auth.email')}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">{t('auth.password')}</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('common.loading') : t('auth.signInButton')}
            </button>
          </form>

          <GoogleAuthSection
            onSuccess={handleGoogleSuccess}
            onError={() => alert('Google login failed. Check that Google OAuth is configured in .env files.')}
            text="signin_with"
          />
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            {t('auth.createAccount')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
