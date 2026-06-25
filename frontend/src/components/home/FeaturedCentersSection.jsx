import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

import { FiMapPin, FiStar, FiCheckCircle } from 'react-icons/fi';

import { getEntityId } from '../../utils/entityId';

import { formatPrice } from '../../utils/helpers';

import { fadeUp, staggerContainer } from './motionVariants';



const CenterHomeCard = ({ center }) => {

  const { t } = useTranslation();

  const id = getEntityId(center);

  if (!id) return null;



  return (

    <Link

      to={`/centers/${id}`}

      className="group block h-full rounded-xl border border-border bg-card overflow-hidden shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300"

    >

      <div className="relative h-40 bg-muted">

        {center.coverImage ? (

          <img src={center.coverImage} alt="" className="h-full w-full object-cover" />

        ) : (

          <div className="h-full w-full flex items-center justify-center bg-primary/10">

            <span className="text-4xl font-bold text-primary/40">{center.name?.charAt(0)}</span>

          </div>

        )}

        {center.isVerified && (

          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-[10px] font-semibold text-primary backdrop-blur-sm">

            <FiCheckCircle className="h-3 w-3" /> {t('common.verified')}

          </span>

        )}

      </div>

      <div className="p-4">

        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">

          {center.name}

        </h3>

        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">

          <FiMapPin className="h-3 w-3 shrink-0" />

          <span className="truncate">{center.address?.city || t('common.morocco')}</span>

        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">

          <span className="flex items-center gap-1 text-sm font-medium text-foreground">

            <FiStar className="h-3.5 w-3.5 text-primary fill-primary" />

            {center.rating?.toFixed(1) || '0.0'}

          </span>

          <span className="text-xs font-medium text-primary">

            {center.priceRange?.min > 0 ? `${formatPrice(center.priceRange.min)}+` : t('common.viewCourses')}

          </span>

        </div>

      </div>

    </Link>

  );

};



const FeaturedCentersSection = ({ centers = [] }) => {

  const { t } = useTranslation();



  return (

    <section className="py-16 sm:py-20">

      <div className="page-container">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">

          <motion.div

            initial="hidden"

            whileInView="visible"

            viewport={{ once: true }}

            variants={fadeUp}

          >

            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">

              {t('home.featuredCenters.title')}

            </h2>

            <p className="mt-2 text-muted-foreground text-sm sm:text-base">

              {t('home.featuredCenters.subtitle')}

            </p>

          </motion.div>

          <Link to="/centers" className="text-sm font-semibold text-primary hover:opacity-80 shrink-0">

            {t('common.viewAllCenters')}

          </Link>

        </div>



        {centers.length === 0 ? (

          <p className="text-center text-muted-foreground py-12">{t('home.featuredCenters.empty')}</p>

        ) : (

          <motion.div

            initial="hidden"

            whileInView="visible"

            viewport={{ once: true, margin: '-40px' }}

            variants={staggerContainer}

            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"

          >

            {centers.map((center, i) => (

              <motion.div key={getEntityId(center) || i} variants={fadeUp} custom={i} className="h-full">

                <CenterHomeCard center={center} />

              </motion.div>

            ))}

          </motion.div>

        )}

      </div>

    </section>

  );

};



export default FeaturedCentersSection;

