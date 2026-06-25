import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { motion, AnimatePresence } from 'framer-motion';

import {
  FiMenu, FiX, FiBell, FiMessageSquare,
  FiHome, FiBook, FiGrid, FiZap, FiUsers,
} from 'react-icons/fi';

import { useTranslation } from 'react-i18next';

import { logoutUser } from '../../store/slices/authSlice';

import { toggleSidebar } from '../../store/slices/uiSlice';

import { disconnectSocket } from '../../utils/socket';
import Logo from '../brand/Logo';
import ThemeToggle from '../common/ThemeToggle';
import LanguageSwitcher from '../common/LanguageSwitcher';



const Navbar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { unreadCount } = useSelector((state) => state.notifications);

  const { sidebarOpen } = useSelector((state) => state.ui);




  const handleLogout = async () => {

    await dispatch(logoutUser());

    disconnectSocket();

    navigate('/');

  };



  const closeMobileMenu = () => {

    if (sidebarOpen) dispatch(toggleSidebar());

  };



  const dashboardLinks = {

    student: '/dashboard/student',

    teacher: '/dashboard/teacher',

    center_owner: '/dashboard/center',

    admin: '/dashboard/admin',

  };



  const navLinks = [

    { to: '/', labelKey: 'nav.home', icon: FiHome },

    { to: '/centers', labelKey: 'nav.centers', icon: FiGrid },

    { to: '/teachers', labelKey: 'nav.teachers', icon: FiUsers, end: true },

    { to: '/courses', labelKey: 'nav.courses', icon: FiBook },

    { to: '/ai', labelKey: 'nav.aiChat', icon: FiZap },

  ];



  return (

    <nav className="glass-nav sticky top-0 z-40">

      <div className="page-container">

        <div className="flex items-center justify-between h-16 lg:h-[4.25rem]">

          <div className="flex items-center gap-3">

            <button

              type="button"

              onClick={() => dispatch(toggleSidebar())}

              className="md:hidden p-2.5 rounded-xl hover:bg-surface-100 text-muted-foreground transition-colors"

              aria-label="Menu"

            >

              {sidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}

            </button>



            <Link to="/" className="group transition-opacity hover:opacity-90">

              <Logo variant="full" size="md" wordmarkClassName="hidden sm:block" />

            </Link>

          </div>



          <div className="hidden md:flex items-center gap-1 shrink-0">

            {navLinks.map(({ to, labelKey, icon: Icon, end }) => (

              <NavLink

                key={to}

                to={to}

                end={end}

                className={({ isActive }) =>

                  isActive ? 'nav-link-active' : 'nav-link-inactive'

                }

              >

                {t(labelKey)}

              </NavLink>

            ))}

          </div>



          <div className="flex items-center gap-1.5 sm:gap-2">

            <LanguageSwitcher className="hidden sm:flex" />
            <ThemeToggle className="hidden sm:flex" />

            {isAuthenticated ? (

              <>

                <Link

                  to="/notifications"

                  className="relative p-2.5 rounded-xl hover:bg-muted transition-colors"

                >

                  <FiBell className="w-5 h-5 text-muted-foreground" />

                  {unreadCount > 0 && (

                    <span className="absolute top-1.5 right-1.5 min-w-[1.125rem] h-[1.125rem] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">

                      {unreadCount > 9 ? '9+' : unreadCount}

                    </span>

                  )}

                </Link>

                <Link

                  to="/messages"

                  className="p-2.5 rounded-xl hover:bg-muted transition-colors hidden sm:block"

                >

                  <FiMessageSquare className="w-5 h-5 text-muted-foreground" />

                </Link>

                <Link

                  to={dashboardLinks[user?.role] || '/dashboard/student'}

                  className="btn-secondary text-sm py-2 px-4 hidden sm:inline-flex"

                >

                  {t('common.dashboard')}

                </Link>

                <button

                  type="button"

                  onClick={handleLogout}

                  className="btn-primary text-sm py-2 px-4"

                >

                  {t('common.logout')}

                </button>

              </>

            ) : (

              <div className="flex items-center gap-2">

                <Link to="/login" className="btn-secondary text-sm py-2 px-4 hidden sm:inline-flex">

                  {t('common.signIn')}

                </Link>

                <Link to="/register" className="btn-primary text-sm py-2 px-4">

                  {t('common.getStarted')}

                </Link>

              </div>

            )}

          </div>

        </div>

      </div>



      {/* Mobile navigation drawer */}

      <AnimatePresence>

        {sidebarOpen && (

          <>

            <motion.div

              initial={{ opacity: 0 }}

              animate={{ opacity: 1 }}

              exit={{ opacity: 0 }}

              className="fixed inset-0 overlay-backdrop backdrop-blur-sm z-30 md:hidden"

              onClick={closeMobileMenu}

            />

            <motion.div

              initial={{ x: '-100%' }}

              animate={{ x: 0 }}

              exit={{ x: '-100%' }}

              transition={{ type: 'spring', damping: 28, stiffness: 320 }}

              className="fixed top-0 left-0 bottom-0 w-[min(85vw,320px)] bg-card shadow-soft-lg z-40 md:hidden flex flex-col"

            >

              <div className="p-5 border-b border-surface-100">

                <p className="font-bold text-foreground">Menu</p>

                <p className="text-xs text-muted-foreground mt-0.5">Navigate CentreHub</p>

              </div>

              <nav className="p-3 space-y-1 flex-1 overflow-y-auto">

                {navLinks.map(({ to, labelKey, icon: Icon, end }) => (

                  <NavLink

                    key={to}

                    to={to}

                    end={end}

                    onClick={closeMobileMenu}

                    className={({ isActive }) =>

                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${

                        isActive

                          ? 'bg-accent text-accent-foreground'

                          : 'text-muted-foreground hover:bg-muted'

                      }`

                    }

                  >

                    <Icon className="w-5 h-5 opacity-70" />

                    {t(labelKey)}

                  </NavLink>

                ))}

              </nav>

              <div className="p-4 border-t border-border space-y-2">

                {isAuthenticated ? (

                  <>

                    <Link

                      to={dashboardLinks[user?.role] || '/dashboard/student'}

                      onClick={closeMobileMenu}

                      className="btn-secondary w-full text-sm"

                    >

                      {t('common.dashboard')}

                    </Link>

                    <button

                      type="button"

                      onClick={() => {

                        closeMobileMenu();

                        handleLogout();

                      }}

                      className="btn-primary w-full text-sm"

                    >

                      {t('common.logout')}

                    </button>

                  </>

                ) : (

                  <>

                    <Link to="/login" onClick={closeMobileMenu} className="btn-secondary w-full text-sm">

                      {t('common.signIn')}

                    </Link>

                    <Link to="/register" onClick={closeMobileMenu} className="btn-primary w-full text-sm">

                      {t('common.getStarted')}

                    </Link>

                  </>

                )}

              </div>

            </motion.div>

          </>

        )}

      </AnimatePresence>

    </nav>

  );

};



export default Navbar;
