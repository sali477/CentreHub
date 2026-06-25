import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

import { FiAward, FiBookOpen, FiUsers, FiMapPin } from 'react-icons/fi';

import { fadeUp, staggerContainer } from './motionVariants';



const StatsSection = () => {

  const { t } = useTranslation();



  const STATS = [

    { icon: FiMapPin, value: '500+', labelKey: 'home.statsSection.partnerCenters', descKey: 'home.statsSection.partnerCentersDesc' },

    { icon: FiBookOpen, value: '2,000+', labelKey: 'home.statsSection.activeCourses', descKey: 'home.statsSection.activeCoursesDesc' },

    { icon: FiUsers, value: '50,000+', labelKey: 'home.statsSection.happyStudents', descKey: 'home.statsSection.happyStudentsDesc' },

    { icon: FiAward, value: '98%', labelKey: 'home.statsSection.satisfaction', descKey: 'home.statsSection.satisfactionDesc' },

  ];



  return (

    <section id="stats" className="py-16 sm:py-20 scroll-mt-20">

      <div className="page-container">

        <motion.div

          initial="hidden"

          whileInView="visible"

          viewport={{ once: true }}

          variants={staggerContainer}

          className="rounded-2xl border border-border bg-card p-8 sm:p-12 shadow-premium-lg"

        >

          <motion.div variants={fadeUp} className="text-center mb-10">

            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">

              {t('home.statsSection.title')}

            </h2>

            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">

              {t('home.statsSection.subtitle')}

            </p>

          </motion.div>



          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {STATS.map(({ icon: Icon, value, labelKey, descKey }, i) => (

              <motion.div

                key={labelKey}

                variants={fadeUp}

                custom={i}

                className="text-center p-4"

              >

                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">

                  <Icon className="h-5 w-5" />

                </span>

                <p className="text-2xl sm:text-3xl font-bold text-foreground">{value}</p>

                <p className="font-medium text-foreground text-sm mt-1">{t(labelKey)}</p>

                <p className="text-xs text-muted-foreground mt-1">{t(descKey)}</p>

              </motion.div>

            ))}

          </div>

        </motion.div>

      </div>

    </section>

  );

};



export default StatsSection;

