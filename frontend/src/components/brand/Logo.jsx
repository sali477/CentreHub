import { useId } from 'react';

const SIZES = {
  xs: 28,
  sm: 32,
  md: 36,
  lg: 44,
  xl: 56,
};

const LogoMarkSvg = ({ size, className, gradId }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <defs>
      <linearGradient id={gradId} x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5BA4E6" />
        <stop offset="0.45" stopColor="#8FC5F7" />
        <stop offset="1" stopColor="#3E8DD6" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="12" fill={`url(#${gradId})`} />
    <circle cx="24" cy="14.5" r="4" fill="white" />
    <path
      d="M24 18.5v3.5M17.5 12.5l3.5 2M30.5 12.5l-3.5 2"
      stroke="white"
      strokeWidth="1.75"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M24 22.5c-5.5 1.2-9.5 4.2-12.5 9.5 4-2 7.5-3.2 12.5-4v-5.5z"
      fill="white"
    />
    <path
      d="M24 22.5c5.5 1.2 9.5 4.2 12.5 9.5-4-2-7.5-3.2-12.5-4v-5.5z"
      fill="white"
      fillOpacity="0.88"
    />
    <circle cx="37.5" cy="37.5" r="2.25" fill="#FFD27A" />
  </svg>
);

export const LogoIcon = ({ size = 'md', className = '' }) => {
  const gradId = useId();
  const px = typeof size === 'number' ? size : SIZES[size] || SIZES.md;
  return <LogoMarkSvg size={px} className={className} gradId={gradId} />;
};

const Wordmark = ({ theme = 'light', showMorocco = true, compact = false }) => {
  const isDark = theme === 'dark';

  return (
    <span className={`flex flex-col leading-none ${compact ? 'gap-0' : 'gap-0.5'}`}>
      <span
        className={`font-bold tracking-tight ${
          compact ? 'text-base' : 'text-lg sm:text-xl'
        } ${isDark ? 'text-primary-foreground' : 'text-foreground'}`}
      >
        Centre<span className="text-primary">Hub</span>
      </span>
      {showMorocco && (
        <span
          className={`font-medium tracking-wide uppercase ${
            compact ? 'text-[9px]' : 'text-[10px] sm:text-xs'
          } text-muted-foreground`}
        >
          Morocco
        </span>
      )}
    </span>
  );
};

const Logo = ({
  variant = 'full',
  size = 'md',
  theme = 'light',
  showMorocco = true,
  className = '',
  wordmarkClassName = '',
  as: Component = 'div',
  ...props
}) => {
  const iconOnly = variant === 'icon';
  const wordmarkOnly = variant === 'wordmark';

  return (
    <Component className={`inline-flex items-center gap-2.5 ${className}`} {...props}>
      {!wordmarkOnly && (
        <LogoIcon size={size} className="shrink-0 drop-shadow-premium" />
      )}
      {!iconOnly && (
        <span className={wordmarkClassName}>
          <Wordmark theme={theme} showMorocco={showMorocco} />
        </span>
      )}
    </Component>
  );
};

export default Logo;
