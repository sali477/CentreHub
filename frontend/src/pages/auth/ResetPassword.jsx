import { useState } from 'react';

import { useParams, useNavigate, Link } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

import { authAPI } from '../../api/index';



const ResetPassword = () => {

  const { t } = useTranslation();

  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState('');

  const [confirm, setConfirm] = useState('');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');



  const handleSubmit = async (e) => {

    e.preventDefault();

    if (password !== confirm) {

      setError(t('auth.passwordsNoMatch'));

      return;

    }

    setLoading(true);

    try {

      await authAPI.resetPassword(token, password);

      navigate('/login');

    } catch (err) {

      setError(err.response?.data?.message || t('auth.resetFailed'));

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="auth-shell">

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md auth-card">

        <h1 className="text-2xl font-bold text-foreground mb-6">{t('auth.resetTitle')}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {error && <div className="bg-destructive-muted text-destructive-muted-foreground p-3 rounded-lg text-sm">{error}</div>}

          <input

            type="password"

            required

            minLength={6}

            value={password}

            onChange={(e) => setPassword(e.target.value)}

            className="input-field"

            placeholder={t('auth.newPassword')}

          />

          <input

            type="password"

            required

            value={confirm}

            onChange={(e) => setConfirm(e.target.value)}

            className="input-field"

            placeholder={t('auth.confirmPassword')}

          />

          <button type="submit" disabled={loading} className="btn-primary w-full">

            {loading ? t('auth.resetting') : t('auth.resetButton')}

          </button>

        </form>

        <Link to="/login" className="block text-center text-sm text-primary mt-4">{t('auth.backToLogin')}</Link>

      </motion.div>

    </div>

  );

};



export default ResetPassword;

