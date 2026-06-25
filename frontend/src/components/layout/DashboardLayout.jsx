import { Link, Outlet, NavLink } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchCurrentUser } from '../../store/slices/authSlice';

import {
  FiArrowLeft, FiHome, FiBook, FiUsers, FiBarChart2, FiSettings,
  FiVideo, FiFileText, FiDollarSign, FiCalendar, FiClipboard,
} from 'react-icons/fi';

import LanguageSwitcher from '../common/LanguageSwitcher';



const sidebarConfigs = {

  student: [

    { to: '/dashboard/student', labelKey: 'dashboard.student.nav.dashboard', icon: FiHome, end: true },

    { to: '/dashboard/student/courses', labelKey: 'dashboard.student.nav.courses', icon: FiBook },

    { to: '/dashboard/student/live', labelKey: 'dashboard.student.nav.live', icon: FiVideo },

    { to: '/dashboard/student/assignments', labelKey: 'dashboard.student.nav.assignments', icon: FiClipboard },

    { to: '/dashboard/student/calendar', labelKey: 'dashboard.student.nav.calendar', icon: FiCalendar },

  ],

  teacher: [

    { to: '/dashboard/teacher', labelKey: 'dashboard.teacher.nav.overview', icon: FiHome, end: true },

    { to: '/dashboard/teacher/courses', labelKey: 'dashboard.teacher.nav.courses', icon: FiBook },

    { to: '/dashboard/teacher/students', labelKey: 'dashboard.teacher.nav.students', icon: FiUsers },

    { to: '/dashboard/teacher/live', labelKey: 'dashboard.teacher.nav.live', icon: FiVideo },

    { to: '/dashboard/teacher/content', labelKey: 'dashboard.teacher.nav.content', icon: FiFileText },

    { to: '/dashboard/teacher/profile', labelKey: 'dashboard.teacher.nav.profile', icon: FiSettings },

  ],

  center_owner: [

    { to: '/dashboard/center', labelKey: 'dashboard.center.nav.overview', icon: FiHome, end: true },

    { to: '/dashboard/center/profile', labelKey: 'dashboard.center.nav.profile', icon: FiSettings },

    { to: '/dashboard/center/teachers', labelKey: 'dashboard.center.nav.teachers', icon: FiUsers },

    { to: '/dashboard/center/courses', labelKey: 'dashboard.center.nav.courses', icon: FiBook },

    { to: '/dashboard/center/students', labelKey: 'dashboard.center.nav.students', icon: FiUsers },

    { to: '/dashboard/center/revenue', labelKey: 'dashboard.center.nav.revenue', icon: FiDollarSign },

    { to: '/dashboard/center/stats', labelKey: 'dashboard.center.nav.stats', icon: FiBarChart2 },

  ],

  admin: [

    { to: '/dashboard/admin', labelKey: 'dashboard.admin.nav.analytics', icon: FiBarChart2, end: true },

    { to: '/dashboard/admin/users', labelKey: 'dashboard.admin.nav.users', icon: FiUsers },

    { to: '/dashboard/admin/centers', labelKey: 'dashboard.admin.nav.verifyCenters', icon: FiHome },

    { to: '/dashboard/admin/teachers', labelKey: 'dashboard.admin.nav.verifyTeachers', icon: FiUsers },

    { to: '/dashboard/admin/reports', labelKey: 'dashboard.admin.nav.reports', icon: FiFileText },

  ],

};

const ROLE_LABEL_KEYS = {
  student: 'auth.roles.student',
  teacher: 'auth.roles.teacher',
  center_owner: 'auth.roles.centerOwner',
};



const DashboardLayout = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const links = sidebarConfigs[user?.role] || sidebarConfigs.student;

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const roleLabel = ROLE_LABEL_KEYS[user?.role]
    ? t(ROLE_LABEL_KEYS[user?.role])
    : user?.role?.replace('_', ' ') || '';



  return (

    <div className="min-h-screen bg-background flex">

      <aside className="w-64 bg-card border-r border-border hidden lg:flex lg:flex-col shrink-0">

        <div className="p-6 border-b border-border">

          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">{t('dashboard.label')}</p>

          <h2 className="font-bold text-foreground capitalize">

            {roleLabel}

          </h2>

          <p className="text-sm text-muted-foreground mt-1 truncate">{user?.name}</p>

        </div>

        <nav className="p-4 space-y-1 flex-1">

          {links.map(({ to, labelKey, icon: Icon, end }) => (

            <NavLink

              key={to}

              to={to}

              end={end}

              className={({ isActive }) =>

                `${isActive ? 'dashboard-sidebar-link bg-primary/10 text-primary shadow-premium' : 'dashboard-sidebar-link text-muted-foreground hover:bg-muted hover:text-primary'}`

              }

            >

              <Icon className="w-5 h-5 shrink-0 opacity-80" />

              {t(labelKey)}

            </NavLink>

          ))}

        </nav>

      </aside>



      <div className="flex-1 min-w-0 flex flex-col">

        <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-background/80 backdrop-blur-xl">

          <div className="flex items-center justify-between px-3 py-2.5 sm:px-4">

            <Link

              to="/"

              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-premium hover:text-primary hover:border-primary/30 hover:bg-accent transition-colors"

              aria-label={t('nav.backToHome')}

              title={t('nav.backToHome')}

            >

              <FiArrowLeft className="h-4 w-4" />

            </Link>

            <LanguageSwitcher />

          </div>

          <nav className="lg:hidden border-t border-border/60 overflow-x-auto">

            <div className="flex gap-1.5 p-2.5 min-w-max">

            {links.map(({ to, labelKey, icon: Icon, end }) => (

              <NavLink

                key={to}

                to={to}

                end={end}

                className={({ isActive }) =>

                  `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${

                    isActive

                      ? 'bg-accent text-accent-foreground shadow-premium'

                      : 'text-muted-foreground hover:bg-muted'

                  }`

                }

              >

                <Icon className="w-4 h-4 shrink-0" />

                {t(labelKey)}

              </NavLink>

            ))}

            </div>

          </nav>

        </header>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">

          <Outlet />

        </div>

      </div>

    </div>

  );

};



export default DashboardLayout;
