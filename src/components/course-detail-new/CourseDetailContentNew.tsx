
import React, { useEffect, useState } from 'react';
import { CourseMaterials } from '@/components/course/CourseMaterials';
import { getCourseHighlights, CourseHighlight } from '@/lib/services/courseHighlightsService';
import IconDisplay from '../course-detail/IconDisplay';

interface CourseDetailContentNewProps {
  course: any;
}

export function CourseDetailContentNew({ course }: CourseDetailContentNewProps) {
  const [highlights, setHighlights] = useState<CourseHighlight[]>([]);

  // 获取课程亮点
  useEffect(() => {
    const fetchHighlights = async () => {
      if (!course.id) return;
      
      const data = await getCourseHighlights(course.id);
      setHighlights(data);
    };
    
    fetchHighlights();
  }, [course.id]);

  return (
    <div className="mt-8 space-y-8">
      {course.description && (
        <section>
          <h2 className="text-xl font-bold mb-3">课程介绍</h2>
          <div className="prose max-w-none">
            <p>{course.description}</p>
          </div>
        </section>
      )}
      
      {/* 课程亮点 */}
      {highlights.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3">课程亮点</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
            {highlights.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <IconDisplay 
                  iconName={item.icon || 'check'} 
                  className="text-primary flex-shrink-0 mt-1" 
                  size={18}
                />
                <span className="text-gray-700">{item.content}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      
      {/* 课程材料 */}
      {course.materials && course.materials.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3">课程资料</h2>
          <CourseMaterials 
            materials={course.materials} 
            isVisible={true}
          />
        </section>
      )}
    </div>
  );
}
