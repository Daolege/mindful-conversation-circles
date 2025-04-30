
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { VideoPlayer } from "@/components/course/VideoPlayer";
import { getCourseById } from "@/lib/services/courseService";
import { getCourseNewById, convertNewCourseToSyllabusFormat } from "@/lib/services/courseNewLearnService";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/authHooks";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CourseSyllabusSection, CourseMaterial } from "@/lib/types/course";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseMaterials } from "@/components/course/CourseMaterials";
import { HomeworkModule } from "@/components/course/HomeworkModule";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CourseLoadingState } from "@/components/course/CourseLoadingState";
import { CourseNotFound } from "@/components/course/CourseNotFound";
import { CourseLearnHeader } from "@/components/course/CourseLearnHeader";
import { CourseSyllabus } from "@/components/course/CourseSyllabus";
import { CourseWithDetails } from "@/lib/types/course-new";

const CourseLearn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewCourse = searchParams.get('source') === 'new';
  const { user } = useAuth();
  const [selectedLecture, setSelectedLecture] = useState<{
    videoUrl?: string;
    title?: string;
  } | null>(null);
  const [showExitWarning, setShowExitWarning] = useState(false);

  console.log('CourseLearn component mounted, courseId:', courseId, 'isNewCourse:', isNewCourse);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
      return '您确定要离开当前课程学习页面吗？您的学习进度可能不会保存。';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Query for standard course
  const { 
    data: courseResponse, 
    isLoading: isLoadingStandardCourse 
  } = useQuery({
    queryKey: ['learn-course', courseId],
    queryFn: () => getCourseById(courseId ? parseInt(courseId) : 0),
    enabled: !!courseId && !isNewCourse,
  });

  // Query for new course format
  const { 
    data: newCourseResponse, 
    isLoading: isLoadingNewCourse 
  } = useQuery({
    queryKey: ['learn-new-course', courseId],
    queryFn: () => getCourseNewById(courseId || '0'),
    enabled: !!courseId && isNewCourse,
  });

  const { data: completedLectures, refetch: refetchCompletedLectures } = useQuery({
    queryKey: ['completed-lectures', courseId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('course_progress')
        .select('lecture_id, completed')
        .eq('course_id', parseInt(courseId || '0'))
        .eq('user_id', user?.id);
      return data?.reduce((acc: Record<string, boolean>, curr) => {
        acc[curr.lecture_id] = curr.completed;
        return acc;
      }, {}) || {};
    },
    enabled: !!courseId && !!user?.id,
  });

  // Determine course data based on source
  const isLoading = isLoadingStandardCourse || isLoadingNewCourse;
  const standardCourse = courseResponse?.data;
  const newCourse = newCourseResponse?.data;
  
  // Process course data based on source
  let course = isNewCourse ? newCourse : standardCourse;
  let title = isNewCourse && newCourse ? newCourse.title : standardCourse?.title || '';
  let videoUrl = isNewCourse && newCourse ? undefined : standardCourse?.video_url;
  
  // Transform syllabus data based on the course type
  let syllabusData: CourseSyllabusSection[] = [];

  if (isNewCourse && newCourse) {
    // Convert new course format to syllabus format
    syllabusData = convertNewCourseToSyllabusFormat(newCourse);
  } else if (standardCourse?.syllabus) {
    // Handle standard course syllabus
    syllabusData = typeof standardCourse.syllabus === 'string'
      ? JSON.parse(standardCourse.syllabus)
      : standardCourse.syllabus as unknown as CourseSyllabusSection[];
  }
  
  console.log('Course data loaded:', {
    courseId,
    isNewCourse,
    course: course ? { id: course.id, title: isNewCourse ? (course as CourseWithDetails).title : (course as any).title } : null,
    syllabusData: syllabusData.length
  });

  useEffect(() => {
    const initializeCourseProgress = async () => {
      if (!user?.id || !courseId || !syllabusData.length) return;
      
      try {
        for (const section of syllabusData) {
          if (section.lectures && Array.isArray(section.lectures)) {
            for (const lecture of section.lectures) {
              if (lecture.title) {
                await supabase
                  .from('course_progress')
                  .upsert([{
                    course_id: parseInt(courseId),
                    user_id: user.id,
                    lecture_id: lecture.title,
                    completed: false,
                    progress_percent: 0,
                    last_watched_at: new Date().toISOString()
                  }], { 
                    onConflict: 'course_id,user_id,lecture_id' 
                  });
              }
            }
          }
        }
        
        await refetchCompletedLectures();
        
      } catch (error) {
        console.error('Error initializing course progress:', error);
      }
    };
    
    initializeCourseProgress();
  }, [courseId, syllabusData, user?.id, refetchCompletedLectures]);

  const handleHomeworkSubmit = async () => {
    if (!selectedLecture?.title) return;
    
    try {
      const { error } = await supabase
        .from('course_progress')
        .upsert([{
          course_id: parseInt(courseId || '0'),
          lecture_id: selectedLecture.title,
          user_id: user?.id,
          completed: true,
          last_watched_at: new Date().toISOString()
        }], {
          onConflict: 'course_id,user_id,lecture_id'
        });

      if (error) {
        console.error('Error marking lecture as complete:', error);
        toast.error('更新课程进度失败，请重试');
      } else {
        await refetchCompletedLectures();
        toast.success('所有作业已完成，课程进度已更新');
      }
    } catch (error) {
      console.error('Error marking lecture as complete:', error);
      toast.error('更新课程进度失败');
    }
  };

  const handleLectureClick = async (lecture: { title: string; videoUrl?: string }) => {
    console.log('Lecture clicked:', lecture);
    
    if (!user?.id || !courseId) return;

    setSelectedLecture({
      videoUrl: lecture.videoUrl,
      title: lecture.title
    });

    try {
      await supabase
        .from('course_progress')
        .upsert([
          {
            course_id: parseInt(courseId),
            user_id: user.id,
            lecture_id: lecture.title,
            last_watched_at: new Date().toISOString()
          }
        ], {
          onConflict: 'course_id,user_id,lecture_id'
        });
        
      await refetchCompletedLectures();
    } catch (error) {
      console.error('Error updating lecture access time:', error);
    }
  };

  const handleGoBack = () => {
    navigate('/my-courses');
  };

  useEffect(() => {
    if (!selectedLecture && syllabusData.length > 0) {
      const firstSection = syllabusData[0];
      if (firstSection.lectures?.length > 0) {
        const firstLecture = firstSection.lectures[0];
        console.log('Auto-selecting first lecture:', firstLecture);
        handleLectureClick(firstLecture);
      }
    }
  }, [syllabusData, selectedLecture]);

  if (isLoading) {
    return <CourseLoadingState />;
  }

  if (!course) {
    return <CourseNotFound />;
  }

  // Get materials based on course type
  const materials = isNewCourse && newCourse ? 
    newCourse.materials : 
    standardCourse?.materials as CourseMaterial[] | null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <CourseLearnHeader 
          title={title} 
          onBack={handleGoBack}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <VideoPlayer 
                videoUrl={selectedLecture?.videoUrl || videoUrl || undefined}
                title={title}
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
                  <CourseSyllabus 
                    syllabusData={syllabusData}
                    selectedLecture={selectedLecture}
                    completedLectures={completedLectures || {}}
                    onLectureClick={handleLectureClick}
                  />
                </TabsContent>
                
                <TabsContent value="materials" className="p-4">
                  <CourseMaterials materials={materials} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确定要离开当前课程学习页面吗？</DialogTitle>
            <DialogDescription>
              您的学习进度已保存，但未完成的作业将不会被保存。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowExitWarning(false)}>
              继续学习
            </Button>
            <Button onClick={() => navigate('/my-courses')}>
              确认离开
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseLearn;
