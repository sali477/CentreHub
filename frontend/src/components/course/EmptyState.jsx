import { motion } from 'framer-motion';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className={`flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-primary/20 bg-accent/30 ${className}`}
  >
    {Icon && (
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5 shadow-premium ring-1 ring-primary/15">
        <Icon className="h-7 w-7" />
      </div>
    )}
    <h3 className="font-bold text-foreground text-lg">{title}</h3>
    {description && (
      <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">{description}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </motion.div>
);

export default EmptyState;
