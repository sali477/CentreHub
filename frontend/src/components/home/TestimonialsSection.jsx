import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';

import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';

import { FiLock, FiSend } from 'react-icons/fi';

import { TESTIMONIALS } from './constants';

import { fadeUp, staggerContainer } from './motionVariants';

import TestimonialCard from './TestimonialCard';

import { useTestimonialComments } from './useTestimonialComments';



const ROLE_OPTION_KEYS = [

  { value: '', labelKey: 'home.testimonials.roleOptions.select' },

  { value: 'student', labelKey: 'home.testimonials.roleOptions.student' },

  { value: 'teacher', labelKey: 'home.testimonials.roleOptions.teacher' },

  { value: 'parent', labelKey: 'home.testimonials.roleOptions.parent' },

];



const TestimonialsSection = () => {

  const { t } = useTranslation();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { userComments, addComment } = useTestimonialComments();

  const [name, setName] = useState('');

  const [role, setRole] = useState('');

  const [comment, setComment] = useState('');

  const [error, setError] = useState('');

  const [justSubmitted, setJustSubmitted] = useState(false);



  useEffect(() => {

    if (isAuthenticated && user?.name) {

      setName(user.name);

    }

  }, [isAuthenticated, user?.name]);



  const handleSubmit = (e) => {

    e.preventDefault();

    if (!isAuthenticated) return;

    setError('');



    const trimmedName = name.trim();

    const trimmedComment = comment.trim();



    if (!trimmedName) {

      setError(t('common.nameRequiredError'));

      return;

    }

    if (!trimmedComment) {

      setError(t('common.commentRequiredError'));

      return;

    }

    if (trimmedComment.length < 10) {

      setError(t('common.commentMinLength'));

      return;

    }



    addComment({

      name: trimmedName,

      role,

      quote: trimmedComment,

      userId: user?._id || user?.id,

    });

    setName('');

    setRole('');

    setComment('');

    setJustSubmitted(true);

    setTimeout(() => setJustSubmitted(false), 3000);

  };



  const allTestimonials = [

    ...userComments.map((item) => ({

      key: item.id,

      quote: item.quote,

      name: item.name,

      role: item.role,

      city: null,

      isNew: true,

    })),

    ...TESTIMONIALS.map((item) => ({

      key: item.name,

      quote: item.quote,

      name: item.name,

      role: item.role,

      city: item.city,

      isNew: false,

    })),

  ];



  return (

    <section className="py-16 sm:py-20 bg-muted/40">

      <div className="page-container">

        <motion.div

          initial="hidden"

          whileInView="visible"

          viewport={{ once: true }}

          variants={fadeUp}

          className="text-center mb-10"

        >

          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">

            {t('home.testimonials.title')}

          </h2>

          <p className="mt-2 text-muted-foreground">{t('home.testimonials.subtitle')}</p>

        </motion.div>



        <motion.div

          initial="hidden"

          whileInView="visible"

          viewport={{ once: true }}

          variants={fadeUp}

          className="max-w-2xl mx-auto mb-10"

        >

          {isAuthenticated ? (

            <form

              onSubmit={handleSubmit}

              className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-premium"

            >

              <h3 className="text-lg font-semibold text-foreground mb-1">{t('home.testimonials.shareTitle')}</h3>

              <p className="text-sm text-muted-foreground mb-5">

                {t('home.testimonials.signedInAs', { name: user?.name })}

              </p>



              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                <div>

                  <label htmlFor="testimonial-name" className="block text-xs font-medium text-foreground mb-1.5">

                    {t('common.nameRequired')} <span className="text-primary">*</span>

                  </label>

                  <input

                    id="testimonial-name"

                    type="text"

                    value={name}

                    onChange={(e) => setName(e.target.value)}

                    placeholder={t('common.yourName')}

                    className="input-field text-sm py-2.5"

                    maxLength={80}

                  />

                </div>

                <div>

                  <label htmlFor="testimonial-role" className="block text-xs font-medium text-foreground mb-1.5">

                    {t('common.role')}

                  </label>

                  <select

                    id="testimonial-role"

                    value={role}

                    onChange={(e) => setRole(e.target.value)}

                    className="input-field text-sm py-2.5 cursor-pointer"

                  >

                    {ROLE_OPTION_KEYS.map(({ value, labelKey }) => (

                      <option key={value || 'none'} value={value}>

                        {t(labelKey)}

                      </option>

                    ))}

                  </select>

                </div>

              </div>



              <div className="mb-4">

                <label htmlFor="testimonial-comment" className="block text-xs font-medium text-foreground mb-1.5">

                  {t('common.yourComment')} <span className="text-primary">*</span>

                </label>

                <textarea

                  id="testimonial-comment"

                  value={comment}

                  onChange={(e) => setComment(e.target.value)}

                  placeholder={t('home.testimonials.commentPlaceholder')}

                  rows={4}

                  className="input-field text-sm resize-none"

                  maxLength={500}

                />

              </div>



              {error && (

                <p className="text-sm text-destructive-muted-foreground mb-3" role="alert">

                  {error}

                </p>

              )}



              {justSubmitted && (

                <p className="text-sm text-primary mb-3" role="status">

                  {t('common.thankYouComment')}

                </p>

              )}



              <button type="submit" className="btn-primary text-sm w-full sm:w-auto">

                <FiSend className="h-4 w-4" />

                {t('common.submitComment')}

              </button>

            </form>

          ) : (

            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-premium text-center">

              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4">

                <FiLock className="h-5 w-5" />

              </span>

              <h3 className="text-lg font-semibold text-foreground mb-1">{t('home.testimonials.shareTitle')}</h3>

              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">

                {t('home.testimonials.signInPrompt')}

              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">

                <Link to="/login" className="btn-secondary text-sm w-full sm:w-auto">

                  {t('common.signIn')}

                </Link>

                <Link to="/register" className="btn-primary text-sm w-full sm:w-auto">

                  {t('common.getStarted')}

                </Link>

              </div>

            </div>

          )}

        </motion.div>



        <motion.div

          initial="hidden"

          whileInView="visible"

          viewport={{ once: true, margin: '-40px' }}

          variants={staggerContainer}

          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

        >

          {allTestimonials.map((item, i) => (

            <motion.div key={item.key} variants={fadeUp} custom={i}>

              <TestimonialCard

                quote={item.quote}

                name={item.name}

                role={item.role}

                city={item.city}

                className={item.isNew ? 'ring-1 ring-primary/20' : ''}

              />

            </motion.div>

          ))}

        </motion.div>

      </div>

    </section>

  );

};



export default TestimonialsSection;

