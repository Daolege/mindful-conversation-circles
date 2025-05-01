
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseDetailNew from './pages/CourseDetailNew';
import Auth from './pages/Auth';
import MyCourses from './pages/MyCourses';
import Checkout from './pages/Checkout';
import { Toaster } from "sonner";
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import { AuthProvider } from './contexts/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import CourseEditor from './pages/CourseEditor';
import CourseNewEditor from './pages/CourseNewEditor';
import CourseLearn from './pages/CourseLearn';
import OrderDetail from './pages/OrderDetail';
import HomeworkSubmissionsPage from './pages/HomeworkSubmissionsPage';
import { LanguageProvider } from './contexts/LanguageContext';
import './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/courses-new/:courseId" element={<CourseDetailNew />} />
                <Route path="/courses/:courseId/learn" element={<CourseLearn />} />
                <Route path="/learn/:courseId" element={<CourseLearn />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/my-courses" element={<MyCourses />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-failed" element={<PaymentFailed />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin/courses/new" element={<CourseEditor />} />
                <Route path="/admin/courses/:courseId" element={<CourseEditor />} />
                <Route path="/admin/courses-new/new" element={<CourseNewEditor />} />
                <Route path="/admin/courses-new/:courseId" element={<CourseNewEditor />} />
                <Route path="/admin/courses-new/:courseId/homework" element={<HomeworkSubmissionsPage />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster richColors position="top-right" />
            </Suspense>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
