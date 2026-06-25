import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './store/slices/authSlice';
import { fetchNotifications } from './store/slices/notificationSlice';
import { initSocket } from './utils/socket';

import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AppLanguageSync from './components/common/AppLanguageSync';
import ProtectedRoute from './routes/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import GetStarted from './pages/auth/GetStarted';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Centers from './pages/Centers';
import CenterProfile from './pages/CenterProfile';
import Courses from './pages/Courses';
import SearchResults from './pages/SearchResults';
import CoursePage from './pages/CoursePage';
import TeacherProfile from './pages/TeacherProfile';
import Teachers from './pages/Teachers';
import LiveSession from './pages/LiveSession';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';
import PaymentSuccess from './pages/PaymentSuccess';
import CMISimulate from './pages/CMISimulate';
import QuizTake from './pages/QuizTake';
import ExamTake from './pages/ExamTake';

import StudentDashboard from './pages/dashboard/StudentDashboard';
import StudentCourses from './pages/dashboard/student/StudentCourses';
import StudentLiveClasses from './pages/dashboard/student/StudentLiveClasses';
import StudentAssignments from './pages/dashboard/student/StudentAssignments';
import StudentCalendar from './pages/dashboard/student/StudentCalendar';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import TeacherCourses from './pages/dashboard/teacher/TeacherCourses';
import TeacherStudents from './pages/dashboard/teacher/TeacherStudents';
import TeacherLiveSessions from './pages/dashboard/teacher/TeacherLiveSessions';
import TeacherContent from './pages/dashboard/teacher/TeacherContent';
import TeacherProfileEdit from './pages/dashboard/teacher/TeacherProfileEdit';
import CenterOwnerDashboard from './pages/dashboard/CenterOwnerDashboard';
import CenterProfileEdit from './pages/dashboard/center/CenterProfileEdit';
import CenterTeachers from './pages/dashboard/center/CenterTeachers';
import CenterCourses from './pages/dashboard/center/CenterCourses';
import CenterStudents from './pages/dashboard/center/CenterStudents';
import CenterRevenue from './pages/dashboard/center/CenterRevenue';
import CenterStats from './pages/dashboard/center/CenterStats';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AIAssistant from './components/ai/AIAssistant';
import AIChatPage from './pages/AIChatPage';

let hydratedSessionToken = null;

const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      hydratedSessionToken = null;
      return;
    }

    if (hydratedSessionToken === token) return;
    hydratedSessionToken = token;

    if (!user) {
      dispatch(fetchCurrentUser());
    }
    initSocket(token);
  }, [dispatch, token, user]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, isAuthenticated]);

  return children;
};

const App = () => {
  return (
    <BrowserRouter>
      <AppLanguageSync />
      <AppInitializer>
        <Routes>
          {/* Auth routes (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/get-started"
            element={
              <ProtectedRoute requireRole={false}>
                <GetStarted />
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/payment/cmi-simulate" element={<CMISimulate />} />

          {/* Live session (no main layout) */}
          <Route
            path="/live/:roomId"
            element={
              <ProtectedRoute>
                <LiveSession />
              </ProtectedRoute>
            }
          />

          {/* Main layout routes */}
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="centers" element={<Centers />} />
            <Route path="centers/:id" element={<CenterProfile />} />
            <Route path="courses" element={<Courses />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="courses/:id" element={<CoursePage />} />
            <Route
              path="courses/:courseId/quiz/:quizId"
              element={
                <ProtectedRoute>
                  <QuizTake />
                </ProtectedRoute>
              }
            />
            <Route
              path="courses/:courseId/exam/:examId"
              element={
                <ProtectedRoute>
                  <ExamTake />
                </ProtectedRoute>
              }
            />
            <Route path="teachers" element={<Teachers />} />
            <Route path="teachers/:id" element={<TeacherProfile />} />
            <Route path="ai" element={<AIChatPage />} />
            <Route
              path="notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="student"
              element={
                <ProtectedRoute roles={['student', 'teacher', 'center_owner', 'admin']}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="courses" element={<StudentCourses />} />
              <Route path="live" element={<StudentLiveClasses />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="calendar" element={<StudentCalendar />} />
              <Route path="progress" element={<Navigate to="/dashboard/student" replace />} />
            </Route>
            <Route
              path="teacher"
              element={
                <ProtectedRoute roles={['teacher', 'admin']}>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<TeacherDashboard />} />
              <Route path="courses" element={<TeacherCourses />} />
              <Route path="students" element={<TeacherStudents />} />
              <Route path="live" element={<TeacherLiveSessions />} />
              <Route path="content" element={<TeacherContent />} />
              <Route path="profile" element={<TeacherProfileEdit />} />
            </Route>
            <Route
              path="center"
              element={
                <ProtectedRoute roles={['center_owner', 'admin']}>
                  <CenterOwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="center/profile" element={
              <ProtectedRoute roles={['center_owner', 'admin']}><CenterProfileEdit /></ProtectedRoute>
            } />
            <Route path="center/teachers" element={
              <ProtectedRoute roles={['center_owner', 'admin']}><CenterTeachers /></ProtectedRoute>
            } />
            <Route path="center/courses" element={
              <ProtectedRoute roles={['center_owner', 'admin']}><CenterCourses /></ProtectedRoute>
            } />
            <Route path="center/students" element={
              <ProtectedRoute roles={['center_owner', 'admin']}><CenterStudents /></ProtectedRoute>
            } />
            <Route path="center/revenue" element={
              <ProtectedRoute roles={['center_owner', 'admin']}><CenterRevenue /></ProtectedRoute>
            } />
            <Route path="center/stats" element={
              <ProtectedRoute roles={['center_owner', 'admin']}><CenterStats /></ProtectedRoute>
            } />
            <Route
              path="admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
        <AIAssistant />
      </AppInitializer>
    </BrowserRouter>
  );
};

export default App;
