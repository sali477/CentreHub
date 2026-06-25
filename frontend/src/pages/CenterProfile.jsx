import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  FiMapPin, FiPhone, FiMail, FiStar, FiCheckCircle, FiGlobe,
} from 'react-icons/fi';
import { fetchCenter, clearCurrentCenter } from '../store/slices/centerSlice';
import { enrollInCourse } from '../store/slices/courseSlice';
import CourseCard from '../components/courses/CourseCard';
import ReviewCard from '../components/common/ReviewCard';
import { StarRating } from '../components/common/ReviewCard';
import { reviewAPI } from '../api/index';

const LocationCard = ({ address }) => {
  const { t } = useTranslation();

  if (!address?.city && !address?.neighborhood && !address?.street) {
    return (
      <p className="text-sm text-muted-foreground">{t('centers.locationUnavailable')}</p>
    );
  }

  const rows = [
    { labelKey: 'centers.city', value: address?.city },
    { labelKey: 'centers.neighborhood', value: address?.neighborhood },
    { labelKey: 'centers.street', value: address?.street },
  ].filter((row) => row.value?.trim());

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FiMapPin className="w-5 h-5" />
        </div>
        <dl className="flex-1 min-w-0 space-y-3">
          {rows.map(({ labelKey, value }) => (
            <div key={labelKey} className="flex flex-col sm:flex-row sm:gap-3 sm:items-baseline">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-28 shrink-0">
                {t(labelKey)}
              </dt>
              <dd className="text-sm font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
};

const CenterProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: center, reviews, loading, error } = useSelector((state) => state.centers);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    dispatch(fetchCenter(id));
    return () => dispatch(clearCurrentCenter());
  }, [dispatch, id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    await reviewAPI.create({ ...reviewForm, center: id });
    setShowReviewForm(false);
    dispatch(fetchCenter(id));
  };

  if (loading && !center) {
    return (
      <div className="page-shell py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-8 bg-muted rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="page-shell py-16 text-center">
        <p className="text-muted-foreground mb-4">{error || t('centers.notFound')}</p>
        <Link to="/centers" className="btn-primary">{t('centers.browseCenters')}</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Cover */}
      <div className="relative h-48 md:h-64 bg-gradient-brand">
        {center.coverImage && (
          <img src={center.coverImage} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="page-container">
        <div className="relative -mt-16 mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {center.logo ? (
              <img src={center.logo} alt="" className="w-24 h-24 rounded-xl border-4 border-card shadow-lg object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-xl border-4 border-card shadow-lg bg-accent flex items-center justify-center text-3xl font-bold text-accent-foreground">
                {center.name?.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{center.name}</h1>
                {center.isVerified && (
                  <span className="badge-verified flex items-center gap-1">
                    <FiCheckCircle /> {t('common.verified')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <StarRating rating={Math.round(center.rating)} />
                <span>{center.rating?.toFixed(1)} ({center.numReviews} {t('common.reviews')})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-16">
          <div className="lg:col-span-2 space-y-8">
            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4">{t('centers.about')}</h2>
              <p className="text-muted-foreground leading-relaxed">{center.description}</p>
              {center.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {center.subjects.map((s) => (
                    <span key={s} className="badge bg-accent text-accent-foreground">{s}</span>
                  ))}
                </div>
              )}
            </section>

            <section className="card p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiMapPin className="w-5 h-5 text-primary" />
                {t('centers.location')}
              </h2>
              <LocationCard address={center.address} />
            </section>

            {/* Courses */}
            <section>
              <h2 className="text-xl font-semibold mb-4">{t('centers.availableCourses')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {center.courses?.map((course, i) => (
                  <CourseCard key={course._id} course={course} index={i} />
                ))}
              </div>
            </section>

            {/* Teachers */}
            <section>
              <h2 className="text-xl font-semibold mb-4">{t('centers.teachersSection')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {center.teachers?.map((teacher) => (
                  <Link
                    key={teacher._id}
                    to={`/teachers/${teacher._id}`}
                    className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
                  >
                    {teacher.photo || teacher.user?.avatar ? (
                      <img src={teacher.photo || teacher.user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium">
                        {teacher.user?.name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{teacher.user?.name}</h3>
                      <p className="text-sm text-muted-foreground">{teacher.subjects?.slice(0, 2).join(', ')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{t('centers.reviewsSection')}</h2>
                {isAuthenticated && (
                  <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-primary text-sm py-2">
                    {t('centers.writeReview')}
                  </button>
                )}
              </div>

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-muted rounded-lg space-y-3">
                  <StarRating
                    rating={reviewForm.rating}
                    interactive
                    onChange={(r) => setReviewForm({ ...reviewForm, rating: r })}
                  />
                  <textarea
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Share your experience..."
                  />
                  <button type="submit" className="btn-primary text-sm">Submit Review</button>
                </form>
              )}

              {reviews?.length > 0 ? (
                reviews.map((review) => <ReviewCard key={review._id} review={review} />)
              ) : (
                <p className="text-muted-foreground text-sm">{t('centers.noReviews')}</p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-6 sticky top-24">
              <h3 className="font-semibold mb-4">{t('centers.contactInfo')}</h3>
              <div className="space-y-3 text-sm">
                {center.address && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <FiMapPin className="mt-0.5 flex-shrink-0" />
                    <span>
                      {[
                        center.address.street,
                        center.address.neighborhood,
                        center.address.city,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
                {center.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FiPhone /><span>{center.phone}</span>
                  </div>
                )}
                {center.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FiMail /><span>{center.email}</span>
                  </div>
                )}
                {center.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FiGlobe />
                    <a href={center.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Website
                    </a>
                  </div>
                )}
              </div>

              {center.priceRange && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">{t('centers.priceRange')}</p>
                  <p className="font-semibold text-primary">
                    {center.priceRange.min} - {center.priceRange.max} MAD
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterProfile;
