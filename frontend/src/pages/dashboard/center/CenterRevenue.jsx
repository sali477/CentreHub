import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { centerAPI } from '../../../api/index';
import useMyCenter from '../../../hooks/useMyCenter';
import CreateCenterForm from './CreateCenterForm';
import { formatPrice, formatDateTime } from '../../../utils/helpers';

const CenterRevenue = () => {
  const { t } = useTranslation();
  const { center, loading, refresh } = useMyCenter();
  const [revenue, setRevenue] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(true);

  useEffect(() => {
    if (center?._id) {
      centerAPI.getRevenue(center._id).then(({ data }) => {
        setRevenue(data.data);
        setLoadingRevenue(false);
      }).catch(() => setLoadingRevenue(false));
    }
  }, [center]);

  if (loading) return <div className="animate-pulse h-64 bg-muted rounded-xl" />;
  if (!center) return <CreateCenterForm onCreated={refresh} />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{t('dashboard.center.revenuePage.title')}</h1>
      <p className="text-muted-foreground mb-6">{t('dashboard.center.revenuePage.subtitle', { name: center.name })}</p>

      {loadingRevenue ? (
        <div className="animate-pulse h-32 bg-muted rounded-xl" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="card p-6 bg-gradient-to-br from-accent to-card">
              <FiDollarSign className="w-8 h-8 text-primary mb-2" />
              <p className="text-3xl font-bold text-accent-foreground">
                {formatPrice(revenue?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-muted-foreground">{t('dashboard.center.revenuePage.totalRevenue')}</p>
            </div>
            <div className="card p-6">
              <FiTrendingUp className="w-8 h-8 text-primary mb-2" />
              <p className="text-3xl font-bold">{revenue?.transactions?.length || 0}</p>
              <p className="text-sm text-muted-foreground">{t('dashboard.center.revenuePage.paidEnrollments')}</p>
            </div>
          </div>

          {revenue?.byMonth?.length > 0 && (
            <div className="card p-6 mb-6">
              <h2 className="font-semibold mb-4">{t('dashboard.center.revenuePage.monthlyRevenue')}</h2>
              <div className="space-y-3">
                {revenue.byMonth.map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{m.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">{t('dashboard.center.revenuePage.enrollmentsCount', { count: m.count })}</span>
                      <span className="font-medium">{formatPrice(m.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {revenue?.byCourse?.length > 0 && (
            <div className="card p-6 mb-6">
              <h2 className="font-semibold mb-4">{t('dashboard.center.revenuePage.revenueByCourse')}</h2>
              <div className="space-y-3">
                {revenue.byCourse.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{c.course?.title || t('dashboard.center.revenuePage.unknownCourse')}</p>
                      <p className="text-xs text-muted-foreground">{t('dashboard.center.revenuePage.enrollmentsCount', { count: c.enrollments })}</p>
                    </div>
                    <span className="font-medium text-primary">{formatPrice(c.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card p-6">
            <h2 className="font-semibold mb-4">{t('dashboard.center.revenuePage.recentTransactions')}</h2>
            {revenue?.transactions?.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('dashboard.center.revenuePage.noPaidEnrollments')}</p>
            ) : (
              <div className="space-y-3">
                {revenue?.transactions?.slice(0, 20).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{tx.student?.name}</p>
                      <p className="text-xs text-muted-foreground">{tx.course?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-primary">{formatPrice(tx.payment?.amount || 0)}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.payment?.paidAt ? formatDateTime(tx.payment.paidAt) : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CenterRevenue;
