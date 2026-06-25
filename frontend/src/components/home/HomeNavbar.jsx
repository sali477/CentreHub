import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { logoutUser } from '../../store/slices/authSlice';
import { disconnectSocket } from '../../utils/socket';

const GraduationCapIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
  </svg>
);

const NAV_LINKS = [
  { to: '/centers', labelKey: 'nav.centers' },
  { to: '/teachers', labelKey: 'nav.teachers', end: true },
  { to: '/courses', labelKey: 'nav.courses' },
  { to: '/ai', labelKey: 'nav.aiChat' },
  { to: '/#stats', labelKey: 'nav.about' },
];

const DASHBOARD_LINKS = {
  student: '/dashboard/student',
  teacher: '/dashboard/teacher',
  center_owner: '/dashboard/center',
  admin: '/dashboard/admin',
};

const AuthButtons = ({ onNavigate, className = '' }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    disconnectSocket();
    onNavigate?.();
    navigate('/');
  };

  if (isAuthenticated) {
    const dashboardPath = DASHBOARD_LINKS[user?.role] || '/dashboard/student';
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Link
          to={dashboardPath}
          onClick={onNavigate}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('common.dashboard')}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-premium hover:opacity-90 transition-opacity"
        >
          {t('common.logout')}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Link
        to="/login"
        onClick={onNavigate}
        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {t('common.signIn')}
      </Link>
      <Link
        to="/register"
        onClick={onNavigate}
        className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-foreground shadow-premium hover:opacity-90 transition-opacity"
      >
        {t('common.getStarted')}
      </Link>
    </div>
  );
};

const HomeNavbar = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-premium transition-transform group-hover:scale-105">
              <GraduationCapIcon className="h-5 w-5" />
            </span>
            <span className="font-semibold text-foreground tracking-tight">
              Centre<span className="text-primary">Hub</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ to, labelKey, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`
                }
              >
                {t(labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <LanguageSwitcher />
            <ThemeToggle />
            <AuthButtons />
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="page-container py-4 flex flex-col gap-1">
              {NAV_LINKS.map(({ to, labelKey, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted'
                    }`
                  }
                >
                  {t(labelKey)}
                </NavLink>
              ))}
              <div className="pt-3 mt-2 border-t border-border flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              <div className="pt-3 mt-2 border-t border-border">
                <AuthButtons onNavigate={closeMenu} className="flex-col sm:flex-row w-full [&_a]:flex-1 [&_a]:text-center [&_button]:flex-1" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default HomeNavbar;
