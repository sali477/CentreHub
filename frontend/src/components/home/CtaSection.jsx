import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

import { fadeUp } from './motionVariants';



const CtaSection = () => {

  const { t } = useTranslation();



  return (

    <section className="py-16 sm:py-20">

      <div className="page-container">

        <motion.div

          initial="hidden"

          whileInView="visible"

          viewport={{ once: true }}

          variants={fadeUp}

          className="relative overflow-hidden rounded-2xl border border-border bg-primary px-8 py-12 sm:px-12 sm:py-16 text-center shadow-premium-lg"

        >

          <div className="pointer-events-none absolute inset-0">

            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary-foreground/10 blur-2xl" />

            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary-foreground/10 blur-2xl" />

          </div>

          <div className="relative">

            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground tracking-tight">

              {t('home.cta.title')}

            </h2>

            <p className="mt-3 text-primary-foreground/85 max-w-xl mx-auto text-sm sm:text-base">

              {t('home.cta.subtitle')}

            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">

              <Link

                to="/register"

                className="px-8 py-3 rounded-xl bg-card text-foreground font-semibold text-sm shadow-premium hover:opacity-95 transition-opacity"

              >

                {t('home.cta.registerCenter')}

              </Link>

              <Link

                to="/register"

                className="px-8 py-3 rounded-xl border border-primary-foreground/30 text-primary-foreground font-semibold text-sm hover:bg-primary-foreground/10 transition-colors"

              >

                {t('home.cta.becomeTeacher')}

              </Link>

            </div>

          </div>

        </motion.div>

      </div>

    </section>

  );

};



export default CtaSection;

