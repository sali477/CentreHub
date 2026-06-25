import { useTranslation } from 'react-i18next';



const LIVE_STATUS_STYLES = {

  live: 'bg-primary text-primary-foreground',

  scheduled: 'bg-accent text-accent-foreground',

  ended: 'bg-muted text-muted-foreground',

  cancelled: 'bg-destructive-muted text-destructive-muted-foreground',

};



export const LiveStatusBadge = ({ status }) => {

  const { t } = useTranslation();

  const label = t(`live.status.${status}`, { defaultValue: status });



  return (

    <span

      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full capitalize shrink-0 ${

        LIVE_STATUS_STYLES[status] || LIVE_STATUS_STYLES.scheduled

      }`}

    >

      {label}

    </span>

  );

};



export const ProgressBar = ({ value, className = '' }) => (

  <div className={`h-1.5 bg-muted rounded-full overflow-hidden ${className}`}>

    <div

      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"

      style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}

    />

  </div>

);



export const StatCard = ({ icon: Icon, label, value, accent = 'text-primary' }) => (

  <div className="card p-5 hover:shadow-premium-lg transition-shadow">

    {Icon && <Icon className={`w-8 h-8 mb-2 ${accent}`} />}

    <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>

    <p className="text-sm text-muted-foreground mt-0.5">{label}</p>

  </div>

);

