import { FiMessageCircle } from 'react-icons/fi';

const formatRole = (role) => {
  if (!role) return null;
  const labels = {
    student: 'Student',
    teacher: 'Teacher',
    parent: 'Parent',
  };
  return labels[role] || role;
};

const TestimonialCard = ({ quote, name, role, city, className = '' }) => {
  const roleLabel = formatRole(role) || role;
  const meta = [roleLabel, city].filter(Boolean).join(' · ');

  return (
    <blockquote
      className={`rounded-xl border border-border bg-card p-6 shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 transition-all duration-300 ${className}`}
    >
      <FiMessageCircle className="h-8 w-8 text-primary/30 mb-4" />
      <p className="text-sm text-foreground leading-relaxed">&ldquo;{quote}&rdquo;</p>
      <footer className="mt-5 pt-4 border-t border-border">
        <p className="font-semibold text-sm text-foreground">{name}</p>
        {meta && <p className="text-xs text-muted-foreground mt-0.5">{meta}</p>}
      </footer>
    </blockquote>
  );
};

export default TestimonialCard;
