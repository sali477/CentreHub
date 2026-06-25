import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiX, FiLayers } from 'react-icons/fi';
import { COURSE_NAV_ITEMS } from './constants';

const CourseContentSidebar = ({
  activeTab,
  onTabChange,
  mobileOpen,
  onMobileOpenChange,
  counts = {},
}) => {
  const { t } = useTranslation();

  const NavButton = ({ id, labelKey, icon: Icon, count }) => {
    const label = t(labelKey);
    const isActive = activeTab === id;
    return (
      <button
        type="button"
        onClick={() => {
          onTabChange(id);
          onMobileOpenChange?.(false);
        }}
        className={`group relative flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
          isActive
            ? 'course-nav-active shadow-glow ring-1 ring-primary/35'
            : 'course-nav-item'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary-foreground/90" />
        )}
        <Icon
          className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
            isActive ? 'text-primary-foreground' : 'text-primary/70 group-hover:text-primary'
          }`}
        />
        <span className="flex-1 text-left">{label}</span>
        {count != null && count > 0 && (
          <span
            className={`text-[10px] font-bold min-w-[1.25rem] text-center px-1.5 py-0.5 rounded-full ${
              isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  const activeLabel = t(COURSE_NAV_ITEMS.find((n) => n.id === activeTab)?.labelKey || 'coursePage.nav.content');
  const totalItems = Object.values(counts).reduce((a, b) => a + (b || 0), 0);
  const itemsLabel = t(totalItems === 1 ? 'common.item' : 'common.items');

  return (
    <>
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => onMobileOpenChange(true)}
          className="flex w-full items-center justify-between px-4 py-3.5 rounded-xl border border-border/80 bg-card shadow-premium text-sm font-semibold text-foreground ring-1 ring-border/30"
        >
          <span className="flex items-center gap-2">
            <FiLayers className="w-4 h-4 text-primary" />
            {activeLabel}
          </span>
          <FiChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <nav className="hidden lg:block">
        <div className="rounded-2xl border border-border/80 bg-card p-3 shadow-premium ring-1 ring-border/30 sticky top-20">
          <div className="px-3 pt-2 pb-3 mb-1 border-b border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t('coursePage.courseNav')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{totalItems} {itemsLabel}</p>
          </div>
          <div className="space-y-0.5 pt-1">
            {COURSE_NAV_ITEMS.map((item) => (
              <NavButton key={item.id} {...item} count={counts[item.id]} />
            ))}
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 overlay-backdrop z-40 lg:hidden"
              onClick={() => onMobileOpenChange(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed left-0 top-0 bottom-0 w-[min(88vw,320px)] z-50 bg-card border-r border-border shadow-premium-lg flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <p className="font-bold text-foreground">{t('coursePage.courseNav')}</p>
                  <p className="text-xs text-muted-foreground">{totalItems} {itemsLabel}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onMobileOpenChange(false)}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                  aria-label="Close menu"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
                {COURSE_NAV_ITEMS.map((item) => (
                  <NavButton key={item.id} {...item} count={counts[item.id]} />
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CourseContentSidebar;
