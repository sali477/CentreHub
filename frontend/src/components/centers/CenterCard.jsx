import { Link } from 'react-router-dom';

import { FiStar, FiMapPin, FiCheckCircle } from 'react-icons/fi';

import { formatPrice, formatDistance } from '../../utils/helpers';

import { getEntityId } from '../../utils/entityId';



const CenterCard = ({ center }) => {

  const centerId = getEntityId(center);



  const content = (

    <>

      <div className="relative h-40 bg-gradient-brand">

        {center.coverImage ? (

          <img src={center.coverImage} alt={center.name} className="w-full h-full object-cover" />

        ) : (

          <div className="w-full h-full flex items-center justify-center">

            <span className="text-primary-foreground text-4xl font-bold opacity-50">

              {center.name?.charAt(0)}

            </span>

          </div>

        )}

        {center.isVerified && (

          <span className="absolute top-3 right-3 badge-verified flex items-center gap-1">

            <FiCheckCircle /> Verified

          </span>

        )}

      </div>



      <div className="p-4">

        <div className="flex items-start gap-3">

          {center.logo ? (

            <img src={center.logo} alt="" className="w-10 h-10 rounded-lg object-cover -mt-8 border-2 border-card shadow" />

          ) : (

            <div className="w-10 h-10 rounded-lg bg-accent -mt-8 border-2 border-card shadow flex items-center justify-center text-accent-foreground font-bold">

              {center.name?.charAt(0)}

            </div>

          )}

          <div className="flex-1 min-w-0">

            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">

              {center.name}

            </h3>

            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">

              <FiMapPin className="flex-shrink-0" />

              <span className="truncate">
                {[center.address?.neighborhood, center.address?.city].filter(Boolean).join(', ') || 'Morocco'}
              </span>

              {center.distanceKm != null && (

                <span className="text-primary font-medium shrink-0">

                  • {formatDistance(center.distanceKm)}

                </span>

              )}

            </div>

          </div>

        </div>



        <div className="flex items-center justify-between mt-3">

          <div className="flex items-center gap-1">

            <FiStar className="text-primary fill-primary" />

            <span className="font-medium text-sm">{center.rating?.toFixed(1) || '0.0'}</span>

            <span className="text-muted-foreground text-sm">({center.numReviews || 0})</span>

          </div>

          <span className="text-sm font-medium text-primary">

            {center.priceRange?.min > 0

              ? `${formatPrice(center.priceRange.min)}+`

              : 'View courses'}

          </span>

        </div>



        <div className="flex flex-wrap gap-1 mt-3 min-h-[1.625rem]">

          {center.subjects?.slice(0, 3).map((subject) => (

            <span key={subject} className="badge bg-muted text-muted-foreground">

              {subject}

            </span>

          ))}

        </div>

      </div>

    </>

  );



  const cardClass = 'card-hover block group cursor-pointer h-full min-h-[17.5rem]';



  if (!centerId) {

    return <div className="card block opacity-60 h-full min-h-[17.5rem]">{content}</div>;

  }



  return (

    <Link to={`/centers/${centerId}`} className={cardClass}>

      {content}

    </Link>

  );

};



export default CenterCard;


