
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
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
import AuthProvider from './contexts/AuthProvider';
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
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import CookiePolicy from './pages/CookiePolicy';
import FAQ from './pages/FAQ';
import { runAllLanguageMigrations } from './lib/services/language/migrationService';
import { dismissAllToasts } from './hooks/use-toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Initialize language migrations
(async () => {
  try {
    // Set a timeout to not block the UI rendering
    setTimeout(async () => {
      try {
        console.log('Initializing language migrations...');
        await runAllLanguageMigrations();
      } catch (err) {
        console.error('Error running language migrations:', err);
      }
    }, 2000);
  } catch (error) {
    console.error('Failed to initialize language migrations:', error);
  }
})();

// Route change observer component to dismiss toasts on navigation
const RouteChangeObserver = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Dismiss all toasts when the route changes
    console.log('Route changed, dismissing all toasts');
    dismissAllToasts();
  }, [location.pathname]);
  
  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
              <RouteChangeObserver />
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
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-use" element={<TermsOfUse />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster richColors position="top-right" toastOptions={{ duration: 5000 }} />
            </Suspense>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
