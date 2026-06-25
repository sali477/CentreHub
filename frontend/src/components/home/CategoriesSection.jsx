import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

import { CATEGORY_ITEMS } from './constants';

import { fadeUp, staggerContainer } from './motionVariants';



const CategoriesSection = () => {

  const { t } = useTranslation();



  return (

    <section className="py-16 sm:py-20 bg-muted/40">

      <div className="page-container">

        <motion.div

          initial="hidden"

          whileInView="visible"

          viewport={{ once: true, margin: '-80px' }}

          variants={staggerContainer}

          className="text-center mb-10"

        >

          <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">

            {t('home.categories.title')}

          </motion.h2>

          <motion.p variants={fadeUp} custom={1} className="mt-2 text-muted-foreground text-sm sm:text-base">

            {t('home.categories.subtitle')}

          </motion.p>

        </motion.div>



        <motion.div

          initial="hidden"

          whileInView="visible"

          viewport={{ once: true, margin: '-60px' }}

          variants={staggerContainer}

          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4"

        >

          {CATEGORY_ITEMS.map(({ nameKey, searchValue, icon: Icon, countKey, countValue }, i) => (

            <motion.div key={nameKey} variants={fadeUp} custom={i}>

              <Link

                to={`/courses?search=${encodeURIComponent(searchValue)}`}

                className="group flex flex-col items-center text-center p-5 sm:p-6 rounded-xl border border-border bg-card shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300"

              >

                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">

                  <Icon className="h-5 w-5" />

                </span>

                <h3 className="font-semibold text-sm text-foreground">{t(nameKey)}</h3>

                <p className="text-xs text-muted-foreground mt-1">{t(countKey, { count: countValue })}</p>

              </Link>

            </motion.div>

          ))}

        </motion.div>

      </div>

    </section>

  );

};



export default CategoriesSection;

