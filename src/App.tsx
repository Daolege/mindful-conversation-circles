
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Import all pages from the pages index
import {
  Home,
  About,
  Courses,
  Auth,
  CourseDetail,
  CourseDetailNew,
  CourseLearn,
  Instructors,
  InstructorDetail,
  FAQ,
  MyCourses,
  Dashboard,
  Checkout,
  PaymentSuccess,
  PaymentFailed,
  TermsOfUse,
  PrivacyPolicy,
  CookiePolicy,
  NotFound,
  Admin,
  CourseEditor,
  CourseNewEditor,
  StudentHomeworkPage,
  HomeworkSubmissionDetailPage,
  HomeworkSubmissionsPage,
  HomeworkReviewPage,
  HomeworkSubmissionPublicDetailPage
} from './pages';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading...</div>}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/courses-new/:courseId" element={<CourseDetailNew />} />
            <Route path="/learn/:courseId" element={<CourseLearn />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/instructors/:instructorId" element={<InstructorDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            
            {/* Admin routes */}
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/admin/course-editor/:courseId" element={<CourseEditor />} />
            <Route path="/admin/courses-new/:courseId/edit" element={<CourseNewEditor />} />
            
            {/* Homework routes */}
            <Route path="/student/homework/:lectureId" element={<StudentHomeworkPage />} />
            <Route path="/admin/homework-submission/:submissionId" element={<HomeworkSubmissionDetailPage />} />
            <Route path="/admin/homework-submissions/:courseId" element={<HomeworkSubmissionsPage />} />
            <Route path="/admin/homework-review/:submissionId" element={<HomeworkReviewPage />} />
            
            {/* Public homework submission detail page */}
            <Route path="/homework-submission/:submissionId/:courseId?" element={<HomeworkSubmissionPublicDetailPage />} />
            
            {/* Catch all route for 404s */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster position="top-right" closeButton richColors />
      </Suspense>
    </QueryClientProvider>
  );
};

export default App;
