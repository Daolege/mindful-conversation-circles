
import React, { useEffect, useState } from 'react';
import { CourseHighlight, getCourseHighlights } from '@/lib/services/courseHighlightsService';
import IconDisplay from './IconDisplay';

interface CourseDetailContentProps {
  course: any;
}

export const CourseDetailContent: React.FC<CourseDetailContentProps> = ({ course }) => {
  const [highlights, setHighlights] = useState<CourseHighlight[]>([]);

  useEffect(() => {
    const loadHighlights = async () => {
      if (course && course.id) {
        try {
          const data = await getCourseHighlights(course.id);
          setHighlights(data || []);
        } catch (err) {
          console.error("Failed to load highlights:", err);
          setHighlights([]);
        }
      }
    };

    loadHighlights();
  }, [course]);

  if (!course) return null;

  return (
    <div className="py-8 space-y-8">
      {course.description && (
        <section>
          <h2 className="text-xl font-bold mb-3">课程简介</h2>
          <div className="prose prose-sm max-w-none">
            <p>{course.description}</p>
          </div>
        </section>
      )}

      {highlights && highlights.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3">课程亮点</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <IconDisplay 
                  iconName={item.icon} 
                  className="mt-1 text-primary" 
                  size={18}
                />
                <span>{item.content}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 循环渲染学习内容 */}
      {course.whatyouwilllearn && course.whatyouwilllearn.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3">学习内容</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.whatyouwilllearn.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <IconDisplay 
                  iconName="check" 
                  className="mt-1 text-primary" 
                  size={18}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 循环渲染课程要求 */}
      {course.requirements && course.requirements.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3">课程要求</h2>
          <ul className="space-y-2">
            {course.requirements.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <IconDisplay 
                  iconName="check" 
                  className="mt-1 text-primary" 
                  size={18}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 循环渲染适合人群 */}
      {course.target_audience && course.target_audience.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-3">适合人群</h2>
          <ul className="space-y-2">
            {course.target_audience.map((item: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <IconDisplay 
                  iconName="check" 
                  className="mt-1 text-primary" 
                  size={18}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
