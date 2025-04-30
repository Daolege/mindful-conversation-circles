
import React, { useState } from 'react';
import { CourseWithDetails } from '@/lib/types/course-new';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, CheckCheck } from 'lucide-react';

interface CourseDetailContentNewProps {
  course: CourseWithDetails;
}

export const CourseDetailContentNew: React.FC<CourseDetailContentNewProps> = ({ course }) => {
  const [activeTab, setActiveTab] = useState('curriculum');

  const totalLessons = course.sections?.reduce(
    (count, section) => count + (section.lectures?.length || 0),
    0
  ) || 0;

  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <Tabs
          defaultValue="curriculum"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="curriculum">课程大纲</TabsTrigger>
            <TabsTrigger value="details">课程详情</TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="space-y-4">
            <div className="mb-4 text-sm text-gray-500">
              {course.sections?.length || 0} 个章节 • {totalLessons} 个课时
            </div>

            {course.sections && course.sections.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {course.sections.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="hover:bg-gray-50 px-4 py-3 rounded-md">
                      <div className="flex justify-between w-full items-center pr-4">
                        <span className="font-medium">{section.title}</span>
                        <span className="text-xs text-gray-500">
                          {section.lectures?.length || 0} 课时
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2">
                      <ul className="divide-y divide-gray-100">
                        {section.lectures?.map((lecture) => (
                          <li
                            key={lecture.id}
                            className="py-2 px-4 hover:bg-gray-50 rounded-md flex justify-between items-center"
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
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8 text-gray-500">该课程暂无章节内容</div>
            )}
          </TabsContent>

          <TabsContent value="details">
            <div className="prose max-w-none whitespace-pre-wrap">
              {course.description ? (
                <div>{course.description}</div>
              ) : (
                <div className="text-gray-500">暂无详细介绍</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
