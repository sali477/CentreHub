import { FiStar } from 'react-icons/fi';
import { formatDate } from '../../utils/helpers';

const StarRating = ({ rating, size = 'sm', interactive = false, onChange }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          <FiStar
            className={`${sizes[size]} ${
              star <= rating ? 'text-primary fill-primary' : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review }) => {
  return (
    <div className="border-b border-border pb-4 mb-4 last:border-0 last:mb-0">
      <div className="flex items-start gap-3">
        {review.user?.avatar ? (
          <img src={review.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium">
            {review.user?.name?.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">{review.user?.name}</h4>
            <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
          </div>
          <StarRating rating={review.rating} size="sm" />
          <p className="text-muted-foreground text-sm mt-2">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

export { StarRating };
export default ReviewCard;
