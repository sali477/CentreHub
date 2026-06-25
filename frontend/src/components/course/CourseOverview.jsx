import { Link } from 'react-router-dom';
import { FiCheck, FiAward, FiGlobe, FiClock } from 'react-icons/fi';

const CourseOverview = ({ course, teacherName, navCounts }) => {
  const teacherId = course.teacher?._id;
  const totalLessons =
    (navCounts.videos || 0) +
    (navCounts.pdfs || 0) +
    (navCounts.quizzes || 0) +
    (navCounts.exams || 0);

  const highlights = course.tags?.length
    ? course.tags
    : [
        `Build practical skills in ${course.subject}`,
        `Designed for ${course.level === 'all' ? 'all' : course.level} learners`,
        `${navCounts.videos || 0} video lessons with hands-on material`,
        `${navCounts.quizzes || 0} quizzes to test your knowledge`,
        'Access on mobile, tablet, and desktop',
        'Certificate of completion when you finish',
      ].slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-premium ring-1 ring-border/30">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-5">
          What you&apos;ll learn
        </h2>
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-foreground/90">
              <FiCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" strokeWidth={3} />
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-premium ring-1 ring-border/30">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4">
          About this course
        </h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
          {course.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-4 pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FiAward className="w-4 h-4 text-primary" />
            <span className="capitalize">{course.level} level</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FiGlobe className="w-4 h-4 text-primary" />
            <span>{totalLessons} learning items</span>
          </div>
          {course.duration > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FiClock className="w-4 h-4 text-primary" />
              <span>{course.duration}h total length</span>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-premium ring-1 ring-border/30">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-5">
          Instructor
        </h2>
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground text-2xl font-bold shadow-premium">
            {teacherName?.charAt(0) || 'T'}
          </div>
          <div className="flex-1 min-w-0">
            {teacherId ? (
              <Link
                to={`/teachers/${teacherId}`}
                className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
              >
                {teacherName}
              </Link>
            ) : (
              <p className="text-lg font-semibold text-foreground">{teacherName}</p>
            )}
            {course.center?.name && (
              <p className="text-sm text-muted-foreground mt-1">
                Teaching at {course.center.name}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-2xl">
              Expert instructor dedicated to helping students master {course.subject} through
              structured lessons, quizzes, and live support.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseOverview;
