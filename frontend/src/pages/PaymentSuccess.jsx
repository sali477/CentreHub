import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiLoader } from 'react-icons/fi';
import { paymentAPI } from '../api/index';

const PaymentSuccess = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [enrollment, setEnrollment] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        const orderId = searchParams.get('order_id');
        const provider = searchParams.get('provider');

        const params = {};
        if (sessionId) params.session_id = sessionId;
        if (orderId) {
          params.order_id = orderId;
          params.provider = provider || 'cmi';
        }

        const { data } = await paymentAPI.verify(params);
        if (data.success) {
          setStatus('success');
          setEnrollment(data.enrollment);
        } else {
          setStatus('pending');
        }
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.message || t('payment.verifyFailed'));
      }
    };

    verify();
  }, [searchParams, t]);

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 max-w-md w-full text-center"
      >
        {status === 'verifying' && (
          <>
            <FiLoader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold">{t('payment.verifying')}</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <FiCheckCircle className="w-16 h-16 text-highlight mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('payment.success')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('payment.enrolledIn')}{' '}
              <strong>{enrollment?.course?.title || t('payment.yourCourse')}</strong>
            </p>
            <Link
              to={`/courses/${enrollment?.course?._id || ''}`}
              className="btn-primary inline-block"
            >
              {t('payment.startLearning')}
            </Link>
          </>
        )}

        {status === 'pending' && (
          <>
            <h1 className="text-xl font-bold text-primary mb-2">{t('payment.pending')}</h1>
            <p className="text-muted-foreground mb-4">{t('payment.pendingDesc')}</p>
            <Link to="/dashboard/student" className="btn-secondary inline-block">{t('payment.goToDashboard')}</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-destructive-muted-foreground mb-2">{t('payment.verificationFailed')}</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link to="/courses" className="btn-primary inline-block">{t('payment.browseCourses')}</Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
