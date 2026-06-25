import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCreditCard, FiGlobe, FiX } from 'react-icons/fi';
import { paymentAPI } from '../../api/index';
import { formatPrice } from '../../utils/helpers';

const PaymentCheckout = ({ course, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const handlePay = async (provider) => {
    setLoading(provider);
    setError('');
    try {
      const { data } = await paymentAPI.createCheckout(course._id, provider);
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed to start');
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl max-w-md w-full p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Complete Payment</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg">
            <FiX />
          </button>
        </div>

        <div className="bg-muted rounded-xl p-4 mb-6">
          <p className="font-medium">{course.title}</p>
          <p className="text-2xl font-bold text-primary mt-2">{formatPrice(course.price)}</p>
        </div>

        {error && (
          <div className="bg-destructive-muted text-destructive-muted-foreground p-3 rounded-lg text-sm mb-4">{error}</div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => handlePay('stripe')}
            disabled={loading}
            className="w-full flex items-center gap-3 p-4 border-2 border-border rounded-xl hover:border-primary hover:bg-accent transition-colors disabled:opacity-50"
          >
            <FiCreditCard className="w-6 h-6 text-primary" />
            <div className="text-left">
              <p className="font-medium">Pay with Card (Stripe)</p>
              <p className="text-xs text-muted-foreground">Visa, Mastercard, international cards</p>
            </div>
            {loading === 'stripe' && <span className="ml-auto text-sm text-muted-foreground">Redirecting...</span>}
          </button>

          <button
            onClick={() => handlePay('cmi')}
            disabled={loading}
            className="w-full flex items-center gap-3 p-4 border-2 border-border rounded-xl hover:border-primary hover:bg-accent transition-colors disabled:opacity-50"
          >
            <FiGlobe className="w-6 h-6 text-primary" />
            <div className="text-left">
              <p className="font-medium">Pay with CMI</p>
              <p className="text-xs text-muted-foreground">Moroccan bank cards (CMI gateway)</p>
            </div>
            {loading === 'cmi' && <span className="ml-auto text-sm text-muted-foreground">Redirecting...</span>}
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Secure payment. You will be redirected to complete checkout.
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentCheckout;
