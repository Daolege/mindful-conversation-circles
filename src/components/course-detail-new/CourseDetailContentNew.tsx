
import React, { useState } from 'react';
import { CourseWithDetails } from '@/lib/types/course-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCollapsible } from '@/components/ui/animated-collapsible';
import { Button } from '@/components/ui/button';
import { 
  Lock, BookOpen, 
  Download, File, Target, Award, Users, Bookmark, GraduationCap, Book, CheckCircle
} from 'lucide-react';

interface CourseDetailContentNewProps {
  course: CourseWithDetails;
}

export const CourseDetailContentNew: React.FC<CourseDetailContentNewProps> = ({ course }) => {
  const [openSectionIds, setOpenSectionIds] = useState<{[key: string]: boolean}>(() => {
    // Default: first three sections are open
    const initial: {[key: string]: boolean} = {};
    if (course.sections && course.sections.length > 0) {
      // Open the first three sections by default
      for (let i = 0; i < Math.min(3, course.sections.length); i++) {
        if (course.sections[i]) {
          initial[course.sections[i].id] = true;
        }
      }
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

  // Generate sample materials if none exist
  const courseMaterials = course.materials?.length ? course.materials : [
    { id: "mat1", course_id: course.id, name: "课程讲义.PDF", url: "#", position: 1, is_visible: true, created_at: new Date().toISOString() },
    { id: "mat2", course_id: course.id, name: "练习题.PDF", url: "#", position: 2, is_visible: true, created_at: new Date().toISOString() }
  ];

  // Default learning objectives if none exist
  const learningObjectives = course.learning_objectives?.length ? course.learning_objectives : [
    "人工智能基础知识的掌握",
    "机器学习算法的理解",
    "神经网络基础",
    "AI应用场景理解"
  ];

  // Default requirements if none exist
  const requirements = course.requirements?.length ? course.requirements : [
    "基本编程技能(推荐Python)",
    "具备初步的数学知识(统计学基础)",
    "有兴趣了解AI发展前沿"
  ];

  // Default target audience if none exist
  const targetAudience = course.target_audience?.length ? course.target_audience : [
    "对人工智能感兴趣的初学者",
    "希望提升个人技能的专业人士",
    "想在AI领域发展的学习者",
    "对技术有兴趣的爱好者"
  ];

  return (
    <div className="space-y-8">
      {/* 课程介绍 */}
      <Card className="hover:shadow-xl transition-shadow duration-300 shadow-lg">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <File className="h-5 w-5" />
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
      <Card className="hover:shadow-xl transition-shadow duration-300 shadow-lg">
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
                  className="border-gray-200 hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
                >
                  <ul className="space-y-3">
                    {section.lectures?.map((lecture) => (
                      <li
                        key={lecture.id}
                        className="flex justify-between items-center p-4 border rounded-10 hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{lecture.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {lecture.is_free ? (
                            <Button 
                              size="sm" 
                              variant="knowledge" 
                              className="text-xs py-1 px-3 h-auto flex items-center gap-1"
                            >
                              免费学习
                            </Button>
                          ) : (
                            <Lock size={16} className="text-gray-400" />
                          )}
                        </div>
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
      <Card className="hover:shadow-xl transition-shadow duration-300 shadow-lg">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <File className="h-5 w-5" />
            课程附件
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {courseMaterials && courseMaterials.length > 0 ? (
            <ul className="space-y-3">
              {courseMaterials.map((material) => (
                <li key={material.id} className="flex justify-between items-center p-4 border rounded-10 hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg">
                  <div className="flex items-center gap-2">
                    <File size={18} className="text-gray-600" />
                    <span>{material.name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="knowledge"
                    className="flex items-center gap-1"
                  >
                    <Download size={14} />
                    下载
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">暂无课程附件</div>
          )}
        </CardContent>
      </Card>

      {/* 学习信息栏 - 三栏布局 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 学习目标 */}
        <Card className="hover:shadow-xl transition-shadow duration-300 shadow-lg">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              学习目标
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {learningObjectives && learningObjectives.length > 0 ? (
              <ul className="space-y-2">
                {learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">暂无学习目标</div>
            )}
          </CardContent>
        </Card>

        {/* 课程要求 */}
        <Card className="hover:shadow-xl transition-shadow duration-300 shadow-lg">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Book className="h-5 w-5" />
              课程要求
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {requirements && requirements.length > 0 ? (
              <ul className="space-y-2">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Book className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">本课程没有特殊要求</div>
            )}
          </CardContent>
        </Card>

        {/* 适合人群 */}
        <Card className="hover:shadow-xl transition-shadow duration-300 shadow-lg">
          <CardHeader className="pb-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              适合人群
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {targetAudience && targetAudience.length > 0 ? (
              <ul className="space-y-2">
                {targetAudience.map((audience, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Users className="h-4 w-4 text-gray-800 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{audience}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">适合所有人学习</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
