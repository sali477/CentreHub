import { getSubjectTheme } from '../../utils/subjectTheme';

const SIZE_PRESETS = {
  xs: { box: 'h-10 w-10 rounded-xl', icon: 'h-4 w-4' },
  sm: { box: 'h-14 w-14 rounded-2xl', icon: 'h-6 w-6' },
  md: { box: 'h-full min-h-[9rem] w-full', icon: 'h-10 w-10' },
  lg: { box: 'h-full w-full min-h-[12rem]', icon: 'h-14 w-14' },
  hero: { box: 'h-14 w-14 rounded-2xl shrink-0', icon: 'h-7 w-7' },
};

/**
 * Gradient card with a subject-specific Lucide icon.
 */
const SubjectIconCard = ({
  subject,
  size = 'md',
  className = '',
  showGlow = true,
}) => {
  const theme = getSubjectTheme(subject);
  const Icon = theme.icon;
  const preset = SIZE_PRESETS[size] || SIZE_PRESETS.md;
  const isCompact = size === 'xs' || size === 'sm' || size === 'hero';

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${preset.box} ${className}`}
      style={{ background: theme.gradient, boxShadow: isCompact ? theme.shadow : undefined }}
      aria-hidden
    >
      {showGlow && !isCompact && (
        <>
          <div className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-black/10 blur-2xl" />
        </>
      )}

      {isCompact ? (
        <Icon className={`${preset.icon} text-white relative z-10`} strokeWidth={2.25} aria-hidden />
      ) : (
        <div
          className="relative flex h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 text-white"
          style={{ boxShadow: theme.shadow }}
        >
          <Icon className={preset.icon} strokeWidth={2.25} aria-hidden />
        </div>
      )}
    </div>
  );
};

export default SubjectIconCard;
