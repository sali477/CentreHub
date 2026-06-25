import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

import CourseCard from '../courses/CourseCard';

import { fadeUp, staggerContainer } from './motionVariants';



const FeaturedCoursesSection = ({ courses = [] }) => {

  const { t } = useTranslation();



  if (!courses.length) return null;



  return (

    <section className="py-16 sm:py-20 bg-background">

      <div className="page-container">

        <motion.div

          initial="hidden"

          whileInView="visible"

          viewport={{ once: true, margin: '-80px' }}

          variants={staggerContainer}

          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"

        >

          <div>

            <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">

              {t('home.featuredCourses.title')}

            </motion.h2>

            <motion.p variants={fadeUp} custom={1} className="mt-2 text-muted-foreground text-sm sm:text-base">

              {t('home.featuredCourses.subtitle')}

            </motion.p>

          </div>

          <motion.div variants={fadeUp} custom={2}>

            <Link to="/courses" className="text-sm font-semibold text-primary hover:opacity-80 shrink-0">

              {t('common.viewAllCourses')}

            </Link>

          </motion.div>

        </motion.div>



        <motion.div

          initial="hidden"

          whileInView="visible"

          viewport={{ once: true, margin: '-60px' }}

          variants={staggerContainer}

          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"

        >

          {courses.map((course, index) => (

            <motion.div

              key={course._id || course.id || index}

              variants={fadeUp}

              custom={index}

              className="h-full relative"

              style={{ pointerEvents: 'auto' }}

            >

              <CourseCard course={course} index={index} />

            </motion.div>

          ))}

        </motion.div>

      </div>

    </section>

  );

};



export default FeaturedCoursesSection;

