import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCenters } from '../store/slices/centerSlice';
import { fetchCourses } from '../store/slices/courseSlice';
import { teacherAPI } from '../api/index';
import HomeNavbar from '../components/home/HomeNavbar';
import HeroSection from '../components/home/HeroSection';
import CategoriesSection from '../components/home/CategoriesSection';
import FeaturedCentersSection from '../components/home/FeaturedCentersSection';
import FeaturedCoursesSection from '../components/home/FeaturedCoursesSection';
import TopTeachersSection from '../components/home/TopTeachersSection';
import StatsSection from '../components/home/StatsSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CtaSection from '../components/home/CtaSection';
import HomeFooter from '../components/home/HomeFooter';
import ErrorBoundary from '../components/common/ErrorBoundary';

const Home = () => {
  const dispatch = useDispatch();
  const { list: centers } = useSelector((state) => state.centers);
  const { list: courses } = useSelector((state) => state.courses);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('[CentreHub] Home — mounting, fetching featured data');
    }
    dispatch(fetchCenters({ limit: 6, sort: '-rating' })).catch(() => {});
    dispatch(fetchCourses({ limit: 4, sort: '-rating' })).catch(() => {});
    teacherAPI
      .getAll({ sort: '-rating' })
      .then(({ data }) => setTeachers((data.data || []).slice(0, 4)))
      .catch(() => setTeachers([]));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <HomeNavbar />
      <HeroSection />
      <ErrorBoundary>
        <CategoriesSection />
      </ErrorBoundary>
      <FeaturedCoursesSection courses={courses} />
      <FeaturedCentersSection centers={centers} />
      <TopTeachersSection teachers={teachers} />
      <StatsSection />
      <TestimonialsSection />
      <CtaSection />
      <HomeFooter />
    </div>
  );
};

export default Home;
