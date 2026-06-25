import { Link } from 'react-router-dom';
import { FiStar, FiClock, FiUsers } from 'react-icons/fi';
import { formatPrice } from '../../utils/helpers';
import { getEntityId } from '../../utils/entityId';
import SubjectIconCard from './SubjectIconCard';
import SubjectBadge from './SubjectBadge';

const CourseCard = ({ course }) => {
  const courseId = getEntityId(course);
  const teacherName = course.teacher?.user?.name || 'Instructor';
  const isPaid = course.courseType === 'paid' || (!course.isFree && course.price > 0);

  const content = (
    <>
      <div className="relative h-36 overflow-hidden">
        <SubjectIconCard subject={course.subject} size="md" className="rounded-t-xl" />
        <span className="absolute top-2 left-2 z-10">
          <SubjectBadge subject={course.subject} className="bg-card/90 backdrop-blur-sm shadow-sm" />
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-foreground line-clamp-2 min-h-[2.75rem] group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{teacherName}</p>

        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <FiStar className="text-primary fill-primary" />
            {course.rating?.toFixed(1) || '0.0'}
          </span>
          <span className="flex items-center gap-1">
            <FiUsers />
            {course.enrolledStudents?.length || 0}
          </span>
          {course.duration > 0 && (
            <span className="flex items-center gap-1">
              <FiClock />
              {course.duration}h
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <span className="font-bold text-primary">
            {isPaid ? formatPrice(course.price) : 'Free'}
          </span>
          <span className="text-xs text-muted-foreground capitalize">{course.level}</span>
        </div>
      </div>
    </>
  );

  const cardClass = 'card-hover block group cursor-pointer h-full min-h-[18.5rem] no-underline text-inherit overflow-hidden rounded-xl';

  if (!courseId) {
    return <div className="card block opacity-60 h-full min-h-[18.5rem] overflow-hidden">{content}</div>;
  }

  return (
    <Link to={`/courses/${courseId}`} className={cardClass}>
      {content}
    </Link>
  );
};

export default CourseCard;
