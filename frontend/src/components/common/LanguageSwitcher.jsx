import { useState, useRef, useEffect } from 'react';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';
import { useLanguage } from '../../hooks/useLanguage';

const LanguageSwitcher = ({ variant = 'default', className = '' }) => {
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const active = languages.find((l) => l.code === currentLanguage) || languages[0];

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const baseBtn =
    variant === 'compact'
      ? 'inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold border border-border bg-card hover:bg-muted transition-colors'
      : 'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted transition-colors';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={baseBtn}
        aria-label="Change language"
        aria-expanded={open}
      >
        <FiGlobe className="w-4 h-4 text-primary shrink-0" />
        <span className="hidden sm:inline">{active.flag}</span>
        <span>{active.shortLabel}</span>
        <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 min-w-[10rem] rounded-xl border border-border bg-card shadow-soft-lg py-1 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-accent transition-colors ${
                currentLanguage === lang.code ? 'bg-accent/60 font-semibold text-primary' : 'text-foreground'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
