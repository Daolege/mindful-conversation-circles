
import React, { Suspense } from 'react';
import { useVisibilityTracking } from '@/hooks/useVisibilityTracking';
import CourseDetailErrorBoundary from './CourseDetailErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy-loaded components
const CourseIntroSection = React.lazy(() => import('./sections/CourseIntroSection'));
const CourseOutlineSection = React.lazy(() => import('./sections/CourseOutlineSection'));
const CourseAttachmentsSection = React.lazy(() => import('./sections/CourseAttachmentsSection'));
const CourseLearningInfoSection = React.lazy(() => import('./sections/CourseLearningInfoSection'));

const SkeletonBlock = ({ height = "h-40", count = 1 }) => (
  <div className="space-y-8">
    {Array(count).fill(0).map((_, i) => (
      <div key={i} className={`${height} bg-gray-100 rounded-lg animate-pulse`}></div>
    ))}
  </div>
);

export const CourseDetailContentNew = ({ course }) => {
  const { visibleSections, updateSectionVisibility } = useVisibilityTracking();

  return (
    <div className="space-y-8">
      {/* 课程介绍 */}
      <CourseDetailErrorBoundary>
        <Suspense fallback={<SkeletonBlock height="h-44" />}>
          <CourseIntroSection 
            course={course} 
            isLoading={false}
          />
        </Suspense>
      </CourseDetailErrorBoundary>

      {/* 课程大纲 */}
      <CourseDetailErrorBoundary>
        <Suspense fallback={<SkeletonBlock height="h-96" />}>
          <CourseOutlineSection 
            course={course} 
            isLoading={false}
            isVisible={true}
            onVisibilityChange={(isVisible) => updateSectionVisibility('outline', isVisible)}
          />
        </Suspense>
      </CourseDetailErrorBoundary>

      {/* 课程附件 */}
      <CourseDetailErrorBoundary>
        <Suspense fallback={<SkeletonBlock height="h-40" />}>
          <CourseAttachmentsSection 
            course={course} 
            isLoading={false}
            isVisible={visibleSections.outline} // Load after outline becomes visible
            onVisibilityChange={(isVisible) => updateSectionVisibility('attachments', isVisible)}
          />
        </Suspense>
      </CourseDetailErrorBoundary>

      {/* 学习信息栏 - 三栏布局 */}
      <CourseDetailErrorBoundary>
        <Suspense fallback={<SkeletonBlock height="h-64" count={3} />}>
          <CourseLearningInfoSection 
            course={course} 
            isLoading={false}
            isVisible={visibleSections.attachments} // Load after attachments become visible
            onVisibilityChange={(isVisible) => updateSectionVisibility('learningInfo', isVisible)}
          />
        </Suspense>
      </CourseDetailErrorBoundary>
    </div>
  );
};
