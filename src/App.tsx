
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import pages
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import Auth from "./pages/Auth";
import CourseDetail from "./pages/CourseDetail";
import CourseDetailNew from "./pages/CourseDetailNew";
import CourseLearn from "./pages/CourseLearn";
import Instructors from "./pages/Instructors";
import InstructorDetail from "./pages/InstructorDetail";
import FAQ from "./pages/FAQ";
import MyCourses from "./pages/MyCourses";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import CourseEditor from "./pages/CourseEditor";
import CourseNewEditor from "./pages/CourseNewEditor";
import StudentHomeworkPage from "./pages/StudentHomeworkPage";
import HomeworkSubmissionDetailPage from "./pages/HomeworkSubmissionDetailPage";
import HomeworkSubmissionsPage from "./pages/HomeworkSubmissionsPage";
import HomeworkReviewPage from "./pages/HomeworkReviewPage";

// Import providers and components
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthProvider";

const queryClient = new QueryClient();

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/course-new/:courseId" element={<CourseDetailNew />} />
            <Route path="/courses-new/:courseId" element={<CourseDetailNew />} />
            <Route path="/course-learn/:courseId/:lectureId?" element={<CourseLearn />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/instructor/:instructorId" element={<InstructorDetail />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/checkout/:courseId" element={<Checkout />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/courses-new/:courseId" element={<CourseNewEditor />} />
            <Route path="/admin/courses-new/:courseId/homework" element={<HomeworkReviewPage />} />
            <Route path="/course-editor/:courseId" element={<CourseEditor />} />
            <Route path="/course-new-editor/:courseId" element={<CourseNewEditor />} />
            
            <Route path="/student-homework/:courseId/:lectureId" element={<StudentHomeworkPage />} />
            <Route path="/homework-submissions/:submissionId" element={<HomeworkSubmissionDetailPage />} />
            <Route path="/homework-submissions" element={<HomeworkSubmissionsPage />} />
            <Route path="/homework-review/:courseId" element={<HomeworkReviewPage />} />
            
            {/* Add route for viewing homework submission details */}
            <Route path="/admin/courses-new/:courseId/homework/submission/:submissionId" element={<HomeworkSubmissionDetailPage />} />
            
            {/* Add route for student homework in admin context */}
            <Route path="/admin/courses-new/:courseId/homework/student/:studentId" element={<StudentHomeworkPage />} />
            
            {/* Add new routes to fix 404 errors */}
            {/* Add route for the learn page */}
            <Route path="/learn/:courseId" element={<CourseLearn />} />
            
            {/* Add route for checkout with query parameters */}
            <Route path="/checkout" element={<Checkout />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
