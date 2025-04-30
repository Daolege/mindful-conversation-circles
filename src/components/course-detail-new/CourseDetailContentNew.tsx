
import React, { useState } from 'react';
import { CourseWithDetails } from '@/lib/types/course-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCollapsible } from '@/components/ui/animated-collapsible';
import { Lock, CheckCheck, FileText, Target, Users, BookOpen } from 'lucide-react';
import { CourseMaterials } from '@/components/course/CourseMaterials';

interface CourseDetailContentNewProps {
  course: CourseWithDetails;
}

export const CourseDetailContentNew: React.FC<CourseDetailContentNewProps> = ({ course }) => {
  const [openSectionIds, setOpenSectionIds] = useState<{[key: string]: boolean}>(() => {
    // Default: first section is open
    const initial: {[key: string]: boolean} = {};
    if (course.sections && course.sections.length > 0) {
      initial[course.sections[0].id] = true;
    }
    return initial;
  });

  const toggleSection = (sectionId: string) => {
    setOpenSectionIds(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const totalLessons = course.sections?.reduce(
    (count, section) => count + (section.lectures?.length || 0),
    0
  ) || 0;

  return (
    <div className="space-y-8">
      {/* 课程介绍 */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            课程介绍
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none py-4">
            {course.description ? (
              <div className="whitespace-pre-wrap">{course.description}</div>
            ) : (
              <div className="text-gray-500">暂无详细介绍</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 课程大纲 */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            课程大纲
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-sm text-gray-500 mb-4">
            {course.sections?.length || 0} 个章节 • {totalLessons} 个课时
          </div>

          {course.sections && course.sections.length > 0 ? (
            <div className="space-y-4">
              {course.sections.map((section) => (
                <AnimatedCollapsible
                  key={section.id}
                  isOpen={!!openSectionIds[section.id]}
                  headerContent={
                    <div className="flex justify-between w-full items-center">
                      <span className="font-medium">{section.title}</span>
                      <span className="text-xs text-gray-500">
                        {section.lectures?.length || 0} 课时
                      </span>
                    </div>
                  }
                  onToggle={() => toggleSection(section.id)}
                  className="border-gray-200"
                >
                  <ul className="divide-y divide-gray-100">
                    {section.lectures?.map((lecture) => (
                      <li
                        key={lecture.id}
                        className="py-3 hover:bg-gray-50 rounded-md flex justify-between items-center"
                      >
                        <div className="flex items-center gap-2">
                          {lecture.is_free ? (
                            <CheckCheck size={16} className="text-green-500" />
                          ) : (
                            <Lock size={16} className="text-gray-400" />
                          )}
                          <span className="text-sm">{lecture.title}</span>
                        </div>
                        <div className="text-xs text-gray-500">{lecture.duration || '0:00'}</div>
                      </li>
                    ))}
                  </ul>
                </AnimatedCollapsible>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">该课程暂无章节内容</div>
          )}
        </CardContent>
      </Card>

      {/* 课程附件 */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            课程附件
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <CourseMaterials 
            materials={course.materials}
            isVisible={true}
          />
        </CardContent>
      </Card>

      {/* 学习目标 */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="h-5 w-5" />
            学习目标
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {course.learning_objectives && course.learning_objectives.length > 0 ? (
            <ul className="space-y-2 list-disc pl-5">
              {course.learning_objectives.map((objective, index) => (
                <li key={index} className="text-gray-700">{objective}</li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">暂无学习目标</div>
          )}
        </CardContent>
      </Card>

      {/* 学习要求 */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            课程要求
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {course.requirements && course.requirements.length > 0 ? (
            <ul className="space-y-2 list-disc pl-5">
              {course.requirements.map((requirement, index) => (
                <li key={index} className="text-gray-700">{requirement}</li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">本课程没有特殊要求</div>
          )}
        </CardContent>
      </Card>

      {/* 适合人群 */}
      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            适合人群
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {course.target_audience && course.target_audience.length > 0 ? (
            <ul className="space-y-2 list-disc pl-5">
              {course.target_audience.map((audience, index) => (
                <li key={index} className="text-gray-700">{audience}</li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">适合所有人学习</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
