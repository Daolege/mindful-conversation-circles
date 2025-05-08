import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/authHooks';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCoursesPage from './pages/AdminCoursesPage';
import AdminCreateCoursePage from './pages/AdminCreateCoursePage';
import AdminEditCoursePage from './pages/AdminEditCoursePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminHomeworkPage from './pages/AdminHomeworkPage';
import AdminCreateHomeworkPage from './pages/AdminCreateHomeworkPage';
import AdminEditHomeworkPage from './pages/AdminEditHomeworkPage';
import HomeworkSubmissionsPage from './pages/HomeworkSubmissionsPage';
import HomeworkSubmissionDetailPage from './pages/HomeworkSubmissionDetailPage';
import HomeworkSubmissionPublicDetailPage from './pages/HomeworkSubmissionPublicDetailPage';
import PricingPage from './pages/PricingPage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import SubscriptionCancelPage from './pages/SubscriptionCancelPage';
import AdminCourseAnalyticsPage from './pages/AdminCourseAnalyticsPage';
import AdminUserAnalyticsPage from './pages/AdminUserAnalyticsPage';
import AdminHomeworkAnalyticsPage from './pages/AdminHomeworkAnalyticsPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminCreateCategoryPage from './pages/AdminCreateCategoryPage';
import AdminEditCategoryPage from './pages/AdminEditCategoryPage';
import AdminCourseSectionPage from './pages/AdminCourseSectionPage';
import AdminCreateCourseSectionPage from './pages/AdminCreateCourseSectionPage';
import AdminEditCourseSectionPage from './pages/AdminEditCourseSectionPage';
import AdminCourseLecturePage from './pages/AdminCourseLecturePage';
import AdminCreateCourseLecturePage from './pages/AdminCreateCourseLecturePage';
import AdminEditCourseLecturePage from './pages/AdminEditCourseLecturePage';
import AdminCourseReviewPage from './pages/AdminCourseReviewPage';
import AdminCourseEnrollmentPage from './pages/AdminCourseEnrollmentPage';
import AdminCourseBundlesPage from './pages/AdminCourseBundlesPage';
import AdminCreateCourseBundlePage from './pages/AdminCreateCourseBundlePage';
import AdminEditCourseBundlePage from './pages/AdminEditCourseBundlePage';
import AdminCourseBundleDetailPage from './pages/AdminCourseBundleDetailPage';
import AdminCourseBundlePurchasePage from './pages/AdminCourseBundlePurchasePage';
import AdminCourseBundleAnalyticsPage from './pages/AdminCourseBundleAnalyticsPage';
import AdminCourseBundleReviewPage from './pages/AdminCourseBundleReviewPage';
import AdminCourseBundleEnrollmentPage from './pages/AdminCourseBundleEnrollmentPage';
import AdminCourseBundleCategoryPage from './pages/AdminCourseBundleCategoryPage';
import AdminCreateCourseBundleCategoryPage from './pages/AdminCreateCourseBundleCategoryPage';
import AdminEditCourseBundleCategoryPage from './pages/AdminEditCourseBundleCategoryPage';
import AdminCourseBundleSectionPage from './pages/AdminCourseBundleSectionPage';
import AdminCreateCourseBundleSectionPage from './pages/AdminCreateCourseBundleSectionPage';
import AdminEditCourseBundleSectionPage from './pages/AdminEditCourseBundleSectionPage';
import AdminCourseBundleLecturePage from './pages/AdminCourseBundleLecturePage';
import AdminCreateCourseBundleLecturePage from './pages/AdminCreateCourseBundleLecturePage';
import AdminEditCourseBundleLecturePage from './pages/AdminEditCourseBundleLecturePage';
import AdminCourseNewPage from './pages/AdminCoursesNewPage';
import AdminCourseNewDetailPage from './pages/AdminCourseNewDetailPage';
import AdminCourseNewSectionPage from './pages/AdminCourseNewSectionPage';
import AdminCreateCourseNewSectionPage from './pages/AdminCreateCourseNewSectionPage';
import AdminEditCourseNewSectionPage from './pages/AdminEditCourseNewSectionPage';
import AdminCourseNewLecturePage from './pages/AdminCourseNewLecturePage';
import AdminCreateCourseNewLecturePage from './pages/AdminCreateCourseNewLecturePage';
import AdminEditCourseNewLecturePage from './pages/AdminEditCourseNewLecturePage';
import AdminCourseNewReviewPage from './pages/AdminCourseNewReviewPage';
import AdminCourseNewEnrollmentPage from './pages/AdminCourseNewEnrollmentPage';
import AdminCourseNewAnalyticsPage from './pages/AdminCourseNewAnalyticsPage';
import AdminCourseNewHomeworkPage from './pages/AdminCourseNewHomeworkPage';
import AdminCreateCourseNewHomeworkPage from './pages/AdminCreateCourseNewHomeworkPage';
import AdminEditCourseNewHomeworkPage from './pages/AdminEditCourseNewHomeworkPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
          <Route path="/subscription-cancel" element={<SubscriptionCancelPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/courses" element={<AdminCoursesPage />} />
          <Route path="/admin/courses/create" element={<AdminCreateCoursePage />} />
          <Route path="/admin/courses/:courseId/edit" element={<AdminEditCoursePage />} />
          <Route path="/admin/courses/:courseId/sections" element={<AdminCourseSectionPage />} />
          <Route path="/admin/courses/:courseId/sections/create" element={<AdminCreateCourseSectionPage />} />
          <Route path="/admin/courses/:courseId/sections/:sectionId/edit" element={<AdminEditCourseSectionPage />} />
          <Route path="/admin/courses/:courseId/sections/:sectionId/lectures" element={<AdminCourseLecturePage />} />
          <Route path="/admin/courses/:courseId/sections/:sectionId/lectures/create" element={<AdminCreateCourseLecturePage />} />
          <Route path="/admin/courses/:courseId/sections/:sectionId/lectures/:lectureId/edit" element={<AdminEditCourseLecturePage />} />
          <Route path="/admin/courses/:courseId/reviews" element={<AdminCourseReviewPage />} />
          <Route path="/admin/courses/:courseId/enrollments" element={<AdminCourseEnrollmentPage />} />
          <Route path="/admin/courses/:courseId/analytics" element={<AdminCourseAnalyticsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/users/analytics" element={<AdminUserAnalyticsPage />} />
          <Route path="/admin/homework" element={<HomeworkSubmissionsPage />} />
          <Route path="/admin/homework/analytics" element={<AdminHomeworkAnalyticsPage />} />
          <Route path="/admin/homework/:courseId" element={<AdminHomeworkPage />} />
          <Route path="/admin/homework/:courseId/create" element={<AdminCreateHomeworkPage />} />
          <Route path="/admin/homework/:courseId/:homeworkId/edit" element={<AdminEditHomeworkPage />} />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/categories/create" element={<AdminCreateCategoryPage />} />
          <Route path="/admin/categories/:categoryId/edit" element={<AdminEditCategoryPage />} />

          {/* Admin Course Bundles Routes */}
          <Route path="/admin/course-bundles" element={<AdminCourseBundlesPage />} />
          <Route path="/admin/course-bundles/create" element={<AdminCreateCourseBundlePage />} />
          <Route path="/admin/course-bundles/:courseBundleId/edit" element={<AdminEditCourseBundlePage />} />
          <Route path="/admin/course-bundles/:courseBundleId/detail" element={<AdminCourseBundleDetailPage />} />
          <Route path="/admin/course-bundles/:courseBundleId/purchases" element={<AdminCourseBundlePurchasePage />} />
          <Route path="/admin/course-bundles/:courseBundleId/analytics" element={<AdminCourseBundleAnalyticsPage />} />
          <Route path="/admin/course-bundles/:courseBundleId/reviews" element={<AdminCourseBundleReviewPage />} />
          <Route path="/admin/course-bundles/:courseBundleId/enrollments" element={<AdminCourseBundleEnrollmentPage />} />
          <Route path="/admin/course-bundles/:courseBundleId/categories" element={<AdminCourseBundleCategoryPage />} />
          <Route path="/admin/course-bundles/:courseBundleId/categories/create" element={<AdminCreateCourseBundleCategoryPage />} />
          <Route path="/admin/course-bundles/:courseBundleId/categories/:categoryId/edit" element={<AdminEditCourseBundleCategoryPage />} />
          <Route path="/admin/course-bundles/:courseBundleId/sections" element={<AdminCourseBundleSectionPage />} />
          <Route path="/admin/course-bundles/:courseBundleId/sections/create" element={<AdminCreateCourseBundleSectionPage />} />
          <Route path="/admin/course-bundles/:courseBundleId/sections/:sectionId/edit" element={<AdminEditCourseBundleSectionPage />} />
          <Route path="/admin/course-bundles/:courseBundleId/sections/:sectionId/lectures" element={<AdminCourseBundleLecturePage />} />
          <Route path="/admin/course-bundles/:courseBundleId/sections/:sectionId/lectures/create" element={<AdminCreateCourseBundleLecturePage />} />
          <Route path="/admin/course-bundles/:courseBundleId/sections/:sectionId/lectures/:lectureId/edit" element={<AdminEditCourseBundleLecturePage />} />

          {/* Admin New Courses Routes */}
          <Route path="/admin/courses-new" element={<AdminCourseNewPage />} />
          <Route path="/admin/courses-new/:courseId" element={<AdminCourseNewDetailPage />} />
          <Route path="/admin/courses-new/:courseId/sections" element={<AdminCourseNewSectionPage />} />
          <Route path="/admin/courses-new/:courseId/sections/create" element={<AdminCreateCourseNewSectionPage />} />
          <Route path="/admin/courses-new/:courseId/sections/:sectionId/edit" element={<AdminEditCourseNewSectionPage />} />
          <Route path="/admin/courses-new/:courseId/sections/:sectionId/lectures" element={<AdminCourseNewLecturePage />} />
          <Route path="/admin/courses-new/:courseId/sections/:sectionId/lectures/create" element={<AdminCreateCourseNewLecturePage />} />
          <Route path="/admin/courses-new/:courseId/sections/:sectionId/lectures/:lectureId/edit" element={<AdminEditCourseNewLecturePage />} />
          <Route path="/admin/courses-new/:courseId/reviews" element={<AdminCourseNewReviewPage />} />
          <Route path="/admin/courses-new/:courseId/enrollments" element={<AdminCourseNewEnrollmentPage />} />
          <Route path="/admin/courses-new/:courseId/analytics" element={<AdminCourseNewAnalyticsPage />} />
          <Route path="/admin/courses-new/:courseId/homework" element={<AdminCourseNewHomeworkPage />} />
          <Route path="/admin/courses-new/:courseId/homework/create" element={<AdminCreateCourseNewHomeworkPage />} />
          <Route path="/admin/courses-new/:courseId/homework/:homeworkId/edit" element={<AdminEditCourseNewHomeworkPage />} />

          {/* Homework Submission Routes */}
          <Route path="/homework-submission/:submissionId" element={<HomeworkSubmissionDetailPage />} />

          {/* Public Homework Submission Detail Route */}
          <Route path="/homework-submission/:submissionId/:courseId" element={<HomeworkSubmissionPublicDetailPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
