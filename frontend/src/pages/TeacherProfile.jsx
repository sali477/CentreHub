import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { FiCheckCircle, FiEdit2, FiBriefcase, FiUser } from 'react-icons/fi';
import { teacherAPI, reviewAPI } from '../api/index';
import CourseCard from '../components/courses/CourseCard';
import ReviewCard, { StarRating } from '../components/common/ReviewCard';
import { resolveMediaUrl } from '../utils/mediaUrl';

const TeacherProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [teacher, setTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    teacherAPI.getOne(id).then(({ data }) => setTeacher(data.data));
    reviewAPI
      .getAll({ teacher: id })
      .then(({ data }) => setReviews(data.data || []))
      .catch(() => setReviews([]));
  }, [id]);

  if (!teacher) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  const ownerId = teacher.user?._id || teacher.user;
  const isOwnProfile = Boolean(user?._id && ownerId && String(ownerId) === String(user._id));
  const photo = teacher.photo || teacher.user?.avatar;
  const publishedCourses = (teacher.courses || []).filter((course) => course && course._id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6">
          {photo ? (
            <img
              src={resolveMediaUrl(photo)}
              alt=""
              className="w-32 h-32 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-32 h-32 rounded-xl bg-accent flex items-center justify-center text-4xl font-bold text-primary shrink-0">
              {teacher.user?.name?.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">{teacher.user?.name}</h1>
                  {teacher.isVerified && (
                    <span className="badge-verified flex items-center gap-1">
                      <FiCheckCircle /> {t('common.verified')}
                    </span>
                  )}
                </div>

                {teacher.subjects?.length > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {teacher.subjects.join(' · ')}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <StarRating rating={Math.round(teacher.rating)} />
                  <span className="text-sm text-muted-foreground">
                    {teacher.rating?.toFixed(1) || '0.0'}
                    {teacher.numReviews > 0 && (
                      <> ({teacher.numReviews} {t('common.reviews')})</>
                    )}
                  </span>
                </div>

                <span
                  className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    teacher.center?.name
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {teacher.center?.name ? (
                    <>
                      <FiBriefcase className="h-3 w-3 shrink-0" />
                      {t('teacherProfile.affiliatedWith', { name: teacher.center.name })}
                    </>
                  ) : (
                    <>
                      <FiUser className="h-3 w-3 shrink-0" />
                      {t('teacherProfile.independentTeacher')}
                    </>
                  )}
                </span>
              </div>

              {isOwnProfile && (
                <Link
                  to="/dashboard/teacher/profile"
                  className="btn-primary text-sm inline-flex items-center gap-2 shrink-0"
                >
                  <FiEdit2 className="w-4 h-4" /> {t('teacherProfile.editProfile')}
                </Link>
              )}
            </div>

            {teacher.bio && <p className="text-muted-foreground mt-4">{teacher.bio}</p>}

            {teacher.experience?.years > 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                {t('common.yearsExperience', { count: teacher.experience.years })}
              </p>
            )}

            {teacher.center && (
              <Link
                to={`/centers/${teacher.center._id}`}
                className="inline-flex items-center gap-1 mt-3 text-primary hover:underline text-sm font-medium"
              >
                <FiBriefcase className="h-3.5 w-3.5" />
                {teacher.center.name}
              </Link>
            )}
          </div>
        </div>
      </div>

      {publishedCourses.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">{t('teacherProfile.coursesSection')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {publishedCourses.map((course, i) => (
              <CourseCard key={course._id} course={course} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="card p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">{t('teacherProfile.reviewsSection')}</h2>
        {reviews.length > 0 ? (
          reviews.map((review) => <ReviewCard key={review._id} review={review} />)
        ) : (
          <p className="text-muted-foreground text-sm">{t('teacherProfile.noReviews')}</p>
        )}
      </section>
    </div>
  );
};

export default TeacherProfile;
