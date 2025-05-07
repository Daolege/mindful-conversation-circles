
import React from 'react';
import { useVisibilityTracking } from '@/hooks/useVisibilityTracking';
import CourseDetailErrorBoundary from './CourseDetailErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';

// Direct imports instead of lazy loading
import CourseIntroSection from './sections/CourseIntroSection';
import CourseOutlineSection from './sections/CourseOutlineSection';
import CourseAttachmentsSection from './sections/CourseAttachmentsSection';
import CourseLearningInfoSection from './sections/CourseLearningInfoSection';

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
        <React.Suspense fallback={<SkeletonBlock height="h-44" />}>
          <CourseIntroSection 
            course={course} 
            isLoading={false}
          />
        </React.Suspense>
      </CourseDetailErrorBoundary>

      {/* 课程大纲 */}
      <CourseDetailErrorBoundary>
        <React.Suspense fallback={<SkeletonBlock height="h-96" />}>
          <CourseOutlineSection 
            course={course} 
            isLoading={false}
            isVisible={true}
            onVisibilityChange={(isVisible) => updateSectionVisibility('outline', isVisible)}
          />
        </React.Suspense>
      </CourseDetailErrorBoundary>

      {/* 课程附件 - 总是尝试显示 */}
      <CourseDetailErrorBoundary>
        <React.Suspense fallback={<SkeletonBlock height="h-40" />}>
          {/* 强制设置为可见 */}
          <CourseAttachmentsSection 
            course={course} 
            isLoading={false}
            isVisible={true}
            onVisibilityChange={(isVisible) => updateSectionVisibility('attachments', isVisible)}
          />
        </React.Suspense>
      </CourseDetailErrorBoundary>

      {/* 学习信息栏 - 三栏布局 */}
      <CourseDetailErrorBoundary>
        <React.Suspense fallback={<SkeletonBlock height="h-64" count={3} />}>
          {/* 强制设置为可见 */}
          <CourseLearningInfoSection 
            course={course} 
            isLoading={false}
            isVisible={true}
            onVisibilityChange={(isVisible) => updateSectionVisibility('learningInfo', isVisible)}
          />
        </React.Suspense>
      </CourseDetailErrorBoundary>
    </div>
  );
};
