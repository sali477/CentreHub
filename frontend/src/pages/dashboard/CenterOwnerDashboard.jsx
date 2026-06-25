import { useState } from 'react';

import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

import {

  FiBook, FiUsers, FiDollarSign, FiStar, FiCopy, FiRefreshCw,

  FiSettings, FiBarChart2, FiCheckCircle,

} from 'react-icons/fi';

import { centerAPI } from '../../api/index';

import useMyCenter from '../../hooks/useMyCenter';

import CreateCenterForm from './center/CreateCenterForm';



const CenterOwnerDashboard = () => {

  const { t } = useTranslation();

  const { center, stats, loading, refresh, setCenter } = useMyCenter();

  const [codeMsg, setCodeMsg] = useState('');



  const copyInvitationCode = () => {

    navigator.clipboard.writeText(center.invitationCode);

    setCodeMsg(t('common.copied'));

    setTimeout(() => setCodeMsg(''), 2000);

  };



  const regenerateCode = async () => {

    const { data } = await centerAPI.regenerateCode(center._id);

    setCenter({ ...center, invitationCode: data.invitationCode });

    setCodeMsg(t('dashboard.center.newCodeGenerated'));

    setTimeout(() => setCodeMsg(''), 2000);

  };



  if (loading) {

    return (

      <div className="space-y-4 animate-pulse">

        <div className="h-8 bg-muted rounded w-1/3" />

        <div className="grid grid-cols-4 gap-4">

          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}

        </div>

      </div>

    );

  }



  if (!center) {

    return <CreateCenterForm onCreated={() => refresh()} />;

  }



  const quickLinks = [

    { to: '/dashboard/center/profile', label: t('dashboard.center.editProfile'), icon: FiSettings, desc: t('dashboard.center.editProfileDesc') },

    { to: '/dashboard/center/teachers', label: t('dashboard.center.nav.teachers'), icon: FiUsers, desc: t('dashboard.center.teachersCount', { count: stats?.totalTeachers || 0 }) },

    { to: '/dashboard/center/courses', label: t('dashboard.center.nav.courses'), icon: FiBook, desc: t('dashboard.center.coursesCount', { count: stats?.totalCourses || 0 }) },

    { to: '/dashboard/center/students', label: t('dashboard.center.nav.students'), icon: FiUsers, desc: t('dashboard.center.studentsCount', { count: stats?.totalStudents || 0 }) },

    { to: '/dashboard/center/revenue', label: t('dashboard.center.nav.revenue'), icon: FiDollarSign, desc: t('dashboard.center.revenueAmount', { amount: stats?.revenue || 0 }) },

    { to: '/dashboard/center/stats', label: t('dashboard.center.nav.stats'), icon: FiBarChart2, desc: t('dashboard.center.statsDesc') },

  ];



  return (

    <div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

        <div>

          <div className="flex items-center gap-2">

            <h1 className="text-2xl font-bold">{center.name}</h1>

            {center.isVerified && (

              <span className="badge-verified flex items-center gap-1">

                <FiCheckCircle className="w-3 h-3" /> {t('common.verified')}

              </span>

            )}

          </div>

          <p className="text-muted-foreground">{t('dashboard.center.ownerTitle')}</p>

        </div>

        <Link to={`/centers/${center._id}`} className="btn-secondary text-sm">

          {t('dashboard.center.viewPublicProfile')}

        </Link>

      </div>



      {center.invitationCode && (

        <div className="card p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-accent">

          <div>

            <p className="text-sm text-muted-foreground">{t('dashboard.center.invitationCode')}</p>

            <p className="font-mono font-bold text-lg">{center.invitationCode}</p>

            {codeMsg && <p className="text-xs text-primary mt-1">{codeMsg}</p>}

          </div>

          <div className="flex gap-2">

            <button onClick={copyInvitationCode} className="btn-secondary flex items-center gap-2 text-sm">

              <FiCopy /> {t('common.copy')}

            </button>

            <button onClick={regenerateCode} className="btn-secondary flex items-center gap-2 text-sm">

              <FiRefreshCw /> {t('common.regenerate')}

            </button>

          </div>

        </div>

      )}



      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {[

          { icon: FiBook, label: t('dashboard.center.nav.courses'), value: stats?.totalCourses || 0, color: 'text-primary', bg: 'bg-accent' },

          { icon: FiUsers, label: t('dashboard.center.nav.teachers'), value: stats?.totalTeachers || 0, color: 'text-primary', bg: 'bg-accent' },

          { icon: FiUsers, label: t('dashboard.center.nav.students'), value: stats?.totalStudents || 0, color: 'text-primary', bg: 'bg-accent' },

          { icon: FiDollarSign, label: t('dashboard.center.nav.revenue'), value: `${stats?.revenue || 0} MAD`, color: 'text-primary', bg: 'bg-accent' },

        ].map(({ icon: Icon, label, value, color, bg }, i) => (

          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}

            transition={{ delay: i * 0.05 }} className="card p-5">

            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>

              <Icon className={`w-5 h-5 ${color}`} />

            </div>

            <p className="text-2xl font-bold">{value}</p>

            <p className="text-sm text-muted-foreground">{label}</p>

          </motion.div>

        ))}

      </div>



      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">

        {quickLinks.map(({ to, label, icon: Icon, desc }) => (

          <Link key={to} to={to}

            className="card p-5 hover:shadow-md transition-shadow group">

            <Icon className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />

            <h3 className="font-semibold">{label}</h3>

            <p className="text-sm text-muted-foreground">{desc}</p>

          </Link>

        ))}

      </div>



      <div className="card p-6">

        <h2 className="font-semibold mb-4 flex items-center gap-2">

          <FiStar className="text-secondary" /> {t('dashboard.center.performance')}

        </h2>

        <div className="grid grid-cols-3 gap-4 text-center">

          <div>

            <p className="text-2xl font-bold text-primary">{stats?.rating?.toFixed(1) || '0.0'}</p>

            <p className="text-sm text-muted-foreground">{t('common.rating')}</p>

          </div>

          <div>

            <p className="text-2xl font-bold">{stats?.numReviews || 0}</p>

            <p className="text-sm text-muted-foreground">{t('common.reviews')}</p>

          </div>

          <div>

            <p className="text-2xl font-bold">{stats?.popularity || 0}</p>

            <p className="text-sm text-muted-foreground">{t('common.popularity')}</p>

          </div>

        </div>

      </div>

    </div>

  );

};



export default CenterOwnerDashboard;

