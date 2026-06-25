import { motion } from 'framer-motion';

/**
 * Educational hero illustration — online learning, courses, students.
 * Uses CentreHub Winter Sky + Clear Horizon palette; decorative only.
 */
const HeroIllustration = ({ className = '' }) => (
  <motion.div
    className={`relative w-full mx-auto ${className}`}
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
    aria-hidden
  >
    <motion.div
      className="absolute -top-4 -right-4 h-20 w-20 rounded-2xl bg-secondary/40 border border-secondary/50 shadow-premium"
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-8 -left-3 h-14 w-14 rounded-full bg-highlight/25 border border-highlight/40"
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
    />

    <div className="relative rounded-3xl border border-border/80 bg-card/90 backdrop-blur-sm p-3 sm:p-4 shadow-premium-lg ring-1 ring-primary/10">
      <svg
        viewBox="0 0 480 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        role="img"
        aria-label="Online learning illustration"
      >
        <defs>
          <linearGradient id="heroScreenGrad" x1="60" y1="80" x2="340" y2="280" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EAF4FF" />
            <stop offset="1" stopColor="#DCEEFF" />
          </linearGradient>
          <linearGradient id="heroOrangeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#5BA4E6" />
            <stop offset="1" stopColor="#3E8DD6" />
          </linearGradient>
          <linearGradient id="heroSoftGrad" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#8FC5F7" />
            <stop offset="1" stopColor="#5BA4E6" />
          </linearGradient>
          <filter id="heroSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#5BA4E6" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Floating books */}
        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="32" y="118" width="52" height="64" rx="8" fill="#EAF4FF" stroke="#8FC5F7" strokeWidth="2" />
          <rect x="40" y="126" width="36" height="6" rx="3" fill="#8FC5F7" opacity="0.7" />
          <rect x="40" y="138" width="28" height="4" rx="2" fill="#E7E5E4" />
          <rect x="40" y="148" width="32" height="4" rx="2" fill="#E7E5E4" />
        </motion.g>

        <motion.g
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        >
          <rect x="388" y="92" width="58" height="72" rx="8" fill="#FFFFFF" stroke="#5BA4E6" strokeWidth="2" opacity="0.95" />
          <rect x="398" y="104" width="38" height="5" rx="2.5" fill="#5BA4E6" opacity="0.5" />
          <rect x="398" y="116" width="30" height="4" rx="2" fill="#E7E5E4" />
          <rect x="398" y="126" width="34" height="4" rx="2" fill="#E7E5E4" />
          <path d="M417 148 L432 148 L424.5 158 Z" fill="#7CC6A6" opacity="0.85" />
        </motion.g>

        {/* Main laptop / course screen */}
        <g filter="url(#heroSoftShadow)">
          <rect x="88" y="72" width="304" height="208" rx="20" fill="url(#heroScreenGrad)" stroke="#E7E5E4" strokeWidth="2" />
          <rect x="104" y="88" width="272" height="168" rx="12" fill="#FFFFFF" />
          {/* Browser chrome */}
          <circle cx="120" cy="100" r="4" fill="#5BA4E6" opacity="0.6" />
          <circle cx="134" cy="100" r="4" fill="#8FC5F7" />
          <circle cx="148" cy="100" r="4" fill="#E7E5E4" />
          <rect x="104" y="108" width="272" height="2" fill="#DCEEFF" />
          {/* Course cards on screen */}
          <rect x="118" y="124" width="108" height="56" rx="10" fill="#EAF4FF" stroke="#8FC5F7" strokeWidth="1.5" />
          <rect x="128" y="136" width="48" height="6" rx="3" fill="#5BA4E6" opacity="0.75" />
          <rect x="128" y="150" width="72" height="4" rx="2" fill="#E7E5E4" />
          <rect x="128" y="160" width="56" height="4" rx="2" fill="#E7E5E4" />
          <rect x="242" y="124" width="108" height="56" rx="10" fill="#EAF4FF" stroke="#5BA4E6" strokeWidth="1.5" opacity="0.9" />
          <rect x="252" y="136" width="52" height="6" rx="3" fill="#FFD27A" opacity="0.8" />
          <rect x="252" y="150" width="68" height="4" rx="2" fill="#E7E5E4" />
          {/* Progress bar */}
          <rect x="118" y="198" width="232" height="10" rx="5" fill="#FAF6F2" />
          <rect x="118" y="198" width="168" height="10" rx="5" fill="#7CC6A6" />
          <rect x="118" y="220" width="140" height="8" rx="4" fill="#E7E5E4" opacity="0.6" />
          <rect x="118" y="236" width="100" height="8" rx="4" fill="#E7E5E4" opacity="0.4" />
          {/* Laptop base */}
          <path d="M64 280 H416 C416 280 400 296 240 296 C80 296 64 280 64 280 Z" fill="#DCEEFF" stroke="#E7E5E4" strokeWidth="2" />
          <rect x="200" y="280" width="80" height="8" rx="4" fill="#E7E5E4" />
        </g>

        {/* Student figure */}
        <g>
          <ellipse cx="240" cy="358" rx="72" ry="10" fill="#1E3A5F" opacity="0.06" />
          <path
            d="M200 340 C200 310 224 288 252 288 C280 288 304 310 304 340 L304 368 L200 368 Z"
            fill="url(#heroOrangeGrad)"
          />
          <circle cx="252" cy="262" r="28" fill="#8FC5F7" />
          <circle cx="252" cy="258" r="24" fill="#EAF4FF" />
          <path
            d="M228 254 C228 242 238 234 252 234 C266 234 276 242 276 254"
            stroke="#1E3A5F"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.35"
          />
          {/* Arms holding tablet */}
          <rect x="168" y="318" width="56" height="72" rx="10" fill="#FFFFFF" stroke="#5BA4E6" strokeWidth="2" />
          <rect x="176" y="328" width="40" height="28" rx="6" fill="#EAF4FF" />
          <circle cx="196" cy="342" r="8" fill="#5BA4E6" opacity="0.2" />
          <path d="M192 342 L200 342 L196 348 Z" fill="#5BA4E6" />
        </g>

        {/* Graduation cap badge */}
        <motion.g
          animate={{ rotate: [0, 4, 0, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '368px 48px' }}
        >
          <rect x="344" y="48" width="48" height="8" rx="2" fill="#1E3A5F" opacity="0.85" />
          <path d="M336 48 L368 28 L400 48 Z" fill="url(#heroOrangeGrad)" />
          <path d="M400 48 V58 C400 62 384 66 368 66 C352 66 336 62 336 58 V48" stroke="#3E8DD6" strokeWidth="2" fill="#5BA4E6" opacity="0.3" />
          <line x1="400" y1="48" x2="408" y2="72" stroke="#FFD27A" strokeWidth="2" strokeLinecap="round" />
          <circle cx="408" cy="74" r="4" fill="#FFD27A" />
        </motion.g>

        {/* Video play bubble */}
        <motion.g
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '72px 52px' }}
        >
          <circle cx="72" cy="52" r="28" fill="#FFFFFF" stroke="#5BA4E6" strokeWidth="2" shadow />
          <circle cx="72" cy="52" r="28" fill="url(#heroSoftGrad)" opacity="0.15" />
          <path d="M64 42 L64 62 L80 52 Z" fill="#5BA4E6" />
        </motion.g>

        {/* Connection dots */}
        <circle cx="420" cy="300" r="6" fill="#7CC6A6" opacity="0.8" />
        <circle cx="448" cy="280" r="4" fill="#8FC5F7" opacity="0.9" />
        <circle cx="36" cy="280" r="5" fill="#FFD27A" opacity="0.75" />
        <path d="M420 300 Q434 290 448 280" stroke="#7CC6A6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
      </svg>

      {/* Floating stat chips */}
      <motion.div
        className="absolute -bottom-2 right-4 sm:right-8 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-premium"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/15 text-success text-sm font-bold">
          ✓
        </span>
        <div className="text-left">
          <p className="text-[10px] font-medium text-muted-foreground leading-none">Progress</p>
          <p className="text-xs font-semibold text-foreground leading-tight mt-0.5">Course complete</p>
        </div>
      </motion.div>

      <motion.div
        className="absolute top-6 left-0 sm:left-2 flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 shadow-premium"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[11px] font-semibold text-primary">Live classes</span>
      </motion.div>
    </div>
  </motion.div>
);

export default HeroIllustration;
