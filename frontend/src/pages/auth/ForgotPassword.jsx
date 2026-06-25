import { useState } from 'react';

import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

import { authAPI } from '../../api/index';



const ForgotPassword = () => {

  const { t } = useTranslation();

  const [email, setEmail] = useState('');

  const [sent, setSent] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');



  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError('');

    try {

      await authAPI.forgotPassword(email);

      setSent(true);

    } catch (err) {

      setError(err.response?.data?.message || t('auth.sendFailed'));

    } finally {

      setLoading(false);

    }

  };



  return (

    <div className="auth-shell">

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md auth-card">

        <h1 className="text-2xl font-bold text-foreground mb-2">{t('auth.forgotTitle')}</h1>

        <p className="text-muted-foreground text-sm mb-6">

          {t('auth.forgotSubtitle')}

        </p>



        {sent ? (

          <div className="bg-accent text-accent-foreground p-4 rounded-lg">

            {t('auth.resetSent')}

            <Link to="/login" className="block mt-2 text-primary font-medium">{t('auth.backToLogin')}</Link>

          </div>

        ) : (

          <form onSubmit={handleSubmit} className="space-y-4">

            {error && <div className="bg-destructive-muted text-destructive-muted-foreground p-3 rounded-lg text-sm">{error}</div>}

            <input

              type="email"

              required

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              className="input-field"

              placeholder="you@example.com"

            />

            <button type="submit" disabled={loading} className="btn-primary w-full">

              {loading ? t('common.sending') : t('auth.sendResetLink')}

            </button>

          </form>

        )}

      </motion.div>

    </div>

  );

};



export default ForgotPassword;

