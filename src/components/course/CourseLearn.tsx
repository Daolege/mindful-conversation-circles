
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Check, Circle } from "lucide-react";
import { VideoPlayer } from "@/components/course/VideoPlayer";
import { Button } from "@/components/ui/button";
import { getCourseById } from "@/lib/services/courseService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/authHooks";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CourseSyllabusSection, CourseMaterial } from "@/lib/types/course";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseMaterials } from "@/components/course/CourseMaterials";
import { HomeworkModule } from "@/components/course/HomeworkModule";
import { handleCourseProgressQueryError } from "@/lib/supabaseUtils";

const CourseLearn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedLecture, setSelectedLecture] = useState<{
    videoUrl?: string;
    title?: string;
  } | null>(null);

  const { data: courseResponse, isLoading } = useQuery({
    queryKey: ['learn-course', courseId],
    queryFn: () => getCourseById(courseId ? parseInt(courseId) : 0),
    enabled: !!courseId,
  });

  const { data: completedLectures, refetch: refetchCompletedLectures } = useQuery({
    queryKey: ['completed-lectures', courseId, user?.id],
    queryFn: async () => {
      if (!courseId || !user?.id) return {};
      
      const { data, error } = await supabase
        .from('course_progress')
        .select('lecture_id')
        .eq('course_id', parseInt(courseId))
        .eq('user_id', user.id as string);
      
      const result = handleCourseProgressQueryError(data, error);
      
      if (!result || result.length === 0) return {};
      
      return result.reduce((acc: Record<string, boolean>, curr: any) => {
        if (curr && curr.lecture_id) {
          acc[curr.lecture_id] = true;
        }
        return acc;
      }, {});
    },
    enabled: !!courseId && !!user?.id,
  });

  const course = courseResponse?.data;
  // 修复类型转换问题，正确处理课程大纲数据
  const syllabusData = course?.syllabus 
    ? (typeof course.syllabus === 'string' 
        ? JSON.parse(course.syllabus) 
        : course.syllabus) as CourseSyllabusSection[]
    : [] as CourseSyllabusSection[];

  const handleHomeworkSubmit = async () => {
    if (!selectedLecture?.title || !user?.id || !courseId) return;
    
    try {
      const { error } = await supabase
        .from('course_progress')
        .upsert([{
          course_id: parseInt(courseId),
          lecture_id: selectedLecture.title,
          user_id: user.id as string,
          completed: true,
          last_watched_at: new Date().toISOString()
        } as any], {
          onConflict: 'course_id,user_id,lecture_id'
        });

      if (error) throw error;
      
      await refetchCompletedLectures();
    } catch (error) {
      console.error('Error marking lecture as complete:', error);
    }
  };

  const handleLectureClick = async (lecture: { title: string; videoUrl?: string }) => {
    if (!user?.id || !courseId) return;

    setSelectedLecture({
      videoUrl: lecture.videoUrl,
      title: lecture.title
    });

    if (!completedLectures?.[lecture.title]) {
      try {
        await supabase
          .from('course_progress')
          .insert([
            {
              course_id: parseInt(courseId) as number,
              user_id: user.id as string,
              lecture_id: lecture.title,
              completed: true
            } as any
          ]);
        
        await refetchCompletedLectures();
      } catch (error) {
        console.error('Error marking lecture as completed:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">未找到课程</h2>
          <Button onClick={() => navigate('/my-courses')}>返回我的课程</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate('/my-courses')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回我的课程
          </Button>
          <h1 className="text-2xl font-bold">{course?.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <VideoPlayer 
                videoUrl={selectedLecture?.videoUrl || course?.video_url || undefined}
                title={course?.title || ""}
                courseId={courseId || ""}
                lessonId={selectedLecture?.title || "intro"}
              />
            </div>
            {courseId && selectedLecture && selectedLecture.title && (
              <HomeworkModule 
                courseId={courseId} 
                lectureId={selectedLecture.title}
                onHomeworkSubmit={handleHomeworkSubmit}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <Tabs defaultValue="syllabus" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="syllabus">课程大纲</TabsTrigger>
                  <TabsTrigger value="materials">课程附件</TabsTrigger>
                </TabsList>
                
                <TabsContent value="syllabus" className="p-4">
                  <Accordion type="single" collapsible className="w-full">
                    {syllabusData.map((section, index) => (
                      <AccordionItem key={index} value={`section-${index}`}>
                        <AccordionTrigger className="hover:bg-gray-50 px-4">
                          <div className="flex justify-between w-full">
                            <span className="font-medium">{section.title}</span>
                            <Badge variant="outline" className="text-black">
                              {section.lectures?.length || 0} 讲
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="divide-y">
                            {section.lectures?.map((lecture, lectureIndex) => (
                              <li 
                                key={lectureIndex}
                                onClick={() => handleLectureClick(lecture)}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer group"
                              >
                                <div className="flex items-center gap-2">
                                  {completedLectures?.[lecture.title] ? (
                                    <Check className="h-4 w-4 text-black shrink-0" />
                                  ) : (
                                    <Circle className="h-4 w-4 text-black shrink-0 group-hover:text-gray-600" />
                                  )}
                                  <span className="flex-grow">{lecture.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={completedLectures?.[lecture.title] ? "default" : "outline"} 
                                    className="text-black"
                                  >
                                    {completedLectures?.[lecture.title] ? '已学' : '未学'}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {lecture.duration}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
                
                <TabsContent value="materials" className="p-4">
                  <CourseMaterials materials={course?.materials as CourseMaterial[] | null} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CourseLearn;
