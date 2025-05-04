
import React from 'react';
import { CourseMaterials } from '@/components/course/CourseMaterials';
import { Course } from '@/lib/types/course';
import { useTranslations } from "@/hooks/useTranslations";

interface CourseDetailContentProps {
  course: Course;
}

export function CourseDetailContent({ course }: CourseDetailContentProps) {
  const { t } = useTranslations();
  
  // Get materials visibility from course data
  const materialsVisible = course.materialsVisible !== false; // Default to true if undefined
  
  return (
    <div className="space-y-8">
      {course.description && (
        <section>
          <h2 className="text-xl font-bold mb-3">{t('courses:courseIntro')}</h2>
          <div className="prose max-w-none">
            <p>{course.description}</p>
          </div>
        </section>
      )}

      {course.whatyouwilllearn && course.whatyouwilllearn.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3">{t('courses:whatYouWillLearn')}</h2>
          <ul className="space-y-2 list-disc list-inside">
            {course.whatyouwilllearn.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </section>
      )}
      
      {course.materials && course.materials.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3">{t('courses:courseMaterials')}</h2>
          <CourseMaterials 
            materials={course.materials} 
            isVisible={materialsVisible}
          />
        </section>
      )}

      {/* Add more sections as needed */}
    </div>
  );
}
