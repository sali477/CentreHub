import { getSubjectTheme } from '../../utils/subjectTheme';

/**
 * Small pill badge with subject-themed colors.
 */
const SubjectBadge = ({ subject, className = '' }) => {
  const theme = getSubjectTheme(subject);
  const Icon = theme.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${theme.badge} ${className}`}
    >
      <Icon className="h-3 w-3 shrink-0" strokeWidth={2.25} aria-hidden />
      <span className="truncate max-w-[8rem] text-[#1E3A5F]">{subject || 'Course'}</span>
    </span>
  );
};

export default SubjectBadge;
