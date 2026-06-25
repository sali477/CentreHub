import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { FiUsers, FiHome, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

import { adminAPI } from '../../api/index';



const AdminDashboard = () => {

  const { t } = useTranslation();

  const [analytics, setAnalytics] = useState(null);

  const [reports, setReports] = useState([]);



  useEffect(() => {

    adminAPI.getAnalytics().then(({ data }) => setAnalytics(data.analytics));

    adminAPI.getReports({ status: 'pending' }).then(({ data }) => setReports(data.data));

  }, []);



  const handleVerifyCenter = async (id) => {

    await adminAPI.verifyCenter(id);

    adminAPI.getAnalytics().then(({ data }) => setAnalytics(data.analytics));

  };



  const handleVerifyTeacher = async (id) => {

    await adminAPI.verifyTeacher(id);

    adminAPI.getAnalytics().then(({ data }) => setAnalytics(data.analytics));

  };



  const handleDeactivate = async (id) => {

    if (confirm(t('dashboard.admin.deactivateConfirm'))) {

      await adminAPI.deactivateUser(id);

    }

  };



  if (!analytics) {

    return <div className="animate-pulse space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div>;

  }



  return (

    <div>

      <h1 className="text-2xl font-bold mb-8">{t('dashboard.admin.title')}</h1>



      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        {[

          { icon: FiUsers, label: t('dashboard.admin.totalUsers'), value: analytics.totalUsers },

          { icon: FiHome, label: t('dashboard.admin.centers'), value: analytics.totalCenters },

          { icon: FiCheckCircle, label: t('dashboard.admin.verifiedCenters'), value: analytics.verifiedCenters },

          { icon: FiAlertTriangle, label: t('dashboard.admin.pendingReports'), value: analytics.pendingReports },

        ].map(({ icon: Icon, label, value }) => (

          <div key={label} className="card p-5">

            <Icon className="w-6 h-6 text-primary mb-2" />

            <p className="text-2xl font-bold">{value}</p>

            <p className="text-sm text-muted-foreground">{label}</p>

          </div>

        ))}

      </div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="card p-6">

          <h2 className="font-semibold mb-4">{t('dashboard.admin.usersByRole')}</h2>

          {analytics.usersByRole?.map((item) => (

            <div key={item._id} className="flex justify-between py-2 border-b border-border last:border-0">

              <span className="capitalize">{item._id?.replace('_', ' ')}</span>

              <span className="font-medium">{item.count}</span>

            </div>

          ))}

        </div>



        <div className="card p-6">

          <h2 className="font-semibold mb-4">{t('dashboard.admin.pendingReportsTitle', { count: reports.length })}</h2>

          {reports.length === 0 ? (

            <p className="text-muted-foreground text-sm">{t('dashboard.admin.noPendingReports')}</p>

          ) : (

            reports.slice(0, 5).map((report) => (

              <div key={report._id} className="py-3 border-b border-border last:border-0">

                <p className="font-medium text-sm">{report.reason}</p>

                <p className="text-xs text-muted-foreground">{report.description}</p>

                <button

                  onClick={() => adminAPI.resolveReport(report._id, { status: 'resolved' })}

                  className="text-xs text-primary mt-1 hover:underline"

                >

                  {t('common.resolve')}

                </button>

              </div>

            ))

          )}

        </div>

      </div>



      <div className="card p-6 mt-6">

        <h2 className="font-semibold mb-4">{t('dashboard.admin.recentEnrollments')}</h2>

        {analytics.recentEnrollments?.map((enrollment) => (

          <div key={enrollment._id} className="flex justify-between py-2 border-b border-border last:border-0 text-sm">

            <span>{enrollment.student?.name}</span>

            <span className="text-muted-foreground">{enrollment.course?.title}</span>

          </div>

        ))}

      </div>

    </div>

  );

};



export default AdminDashboard;

