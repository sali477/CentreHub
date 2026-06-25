import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FiStar, FiCheckCircle, FiBook, FiBriefcase, FiUser } from 'react-icons/fi';
import { getEntityId } from '../../utils/entityId';
import { getInitials } from '../../utils/helpers';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { fadeUp, staggerContainer } from './motionVariants';

const getCourseCount = (teacher) =>
  (teacher.courses || []).filter((course) => course && course._id).length;

const getSpecialization = (teacher, t) => {
  if (teacher.subjects?.length) {
    return teacher.subjects.slice(0, 2).join(' · ');
  }
  return t('home.topTeachers.generalEducator');
};

export const TeacherHomeCard = ({ teacher }) => {
  const { t } = useTranslation();
  const id = getEntityId(teacher);
  const name = teacher.user?.name || t('common.instructor');
  const photo = teacher.photo || teacher.user?.avatar;
  const courseCount = getCourseCount(teacher);
  const isCenterAffiliated = Boolean(teacher.center?.name);

  if (!id) return null;

  return (
    <Link
      to={`/teachers/${id}`}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg"
    >
      <div className="flex flex-col items-center text-center">
        {photo ? (
          <img
            src={resolveMediaUrl(photo)}
            alt=""
            className="h-20 w-20 rounded-2xl object-cover ring-2 ring-border/80"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary ring-2 ring-border/80">
            {getInitials(name)}
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-1.5">
          <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
            {name}
          </h3>
          {teacher.isVerified && (
            <FiCheckCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {getSpecialization(teacher, t)}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-1 font-medium text-foreground">
            <FiStar className="h-3.5 w-3.5 fill-primary text-primary" />
            {teacher.rating?.toFixed(1) || '0.0'}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <FiBook className="h-3.5 w-3.5" />
            {t('home.topTeachers.coursesCount', { count: courseCount })}
          </span>
        </div>

        <span
          className={`mt-4 inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            isCenterAffiliated
              ? 'bg-accent text-accent-foreground'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {isCenterAffiliated ? (
            <>
              <FiBriefcase className="h-3 w-3 shrink-0" />
              <span className="truncate">{teacher.center.name}</span>
            </>
          ) : (
            <>
              <FiUser className="h-3 w-3 shrink-0" />
              <span>{t('home.topTeachers.independentTeacher')}</span>
            </>
          )}
        </span>
      </div>

      <span className="mt-5 block w-full rounded-lg border border-primary/20 bg-primary/5 py-2.5 text-center text-sm font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {t('home.topTeachers.viewProfile')}
      </span>
    </Link>
  );
};

const TopTeachersSection = ({ teachers = [] }) => {
  const { t } = useTranslation();

  return (
    <section id="featured-teachers" className="scroll-mt-20 bg-muted/40 py-16 sm:py-20">
      <div className="page-container">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t('home.topTeachers.title')}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {t('home.topTeachers.subtitle')}
            </p>
          </motion.div>
          <Link to="/courses" className="shrink-0 text-sm font-semibold text-primary hover:opacity-80">
            {t('common.exploreCourses')}
          </Link>
        </div>

        {teachers.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">{t('home.topTeachers.empty')}</p>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {teachers.map((teacher, i) => (
              <motion.div key={getEntityId(teacher) || i} variants={fadeUp} custom={i} className="h-full">
                <TeacherHomeCard teacher={teacher} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default TopTeachersSection;
