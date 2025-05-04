
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
import { CourseWithDetails, CourseData } from "@/lib/types/course-new";
import { DatabaseFixInitializer } from "@/components/course/DatabaseFixInitializer";
import { useTranslations } from "@/hooks/useTranslations";

const CourseLearn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNewCourse = searchParams.get('source') === 'new';
  const { user } = useAuth();
  const { t } = useTranslations();
  const [selectedLecture, setSelectedLecture] = useState<{
    videoUrl?: string;
    title?: string;
  } | null>(null);
  const [showExitWarning, setShowExitWarning] = useState(false);

  console.log('CourseLearn component mounted:', {
    courseId,
    isNewCourse,
    currentRoute: window.location.pathname + window.location.search
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Required for Chrome
      return t('courses:leaveWarningMessage');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [t]);

  // Query for standard course
  const { 
    data: courseResponse, 
    isLoading: isLoadingStandardCourse,
    error: standardCourseError
  } = useQuery({
    queryKey: ['learn-course', courseId],
    queryFn: () => getCourseById(courseId ? parseInt(courseId) : 0),
    enabled: !!courseId && !isNewCourse,
  });

  // Query for new course format
  const { 
    data: newCourseResponse, 
    isLoading: isLoadingNewCourse,
    error: newCourseError
  } = useQuery({
    queryKey: ['learn-new-course', courseId],
    queryFn: () => getCourseNewById(courseId || '0'),
    enabled: !!courseId && isNewCourse,
  });

  // Log query results for debugging
  useEffect(() => {
    if (isNewCourse) {
      console.log('New course query result:', {
        data: newCourseResponse && 'data' in newCourseResponse ? 
          { id: (newCourseResponse.data as CourseWithDetails).id, title: (newCourseResponse.data as CourseWithDetails).title } : 
          null,
        error: newCourseError,
        isLoading: isLoadingNewCourse
      });
    } else {
      console.log('Standard course query result:', {
        data: courseResponse && 'data' in courseResponse ? 
          { id: courseResponse.data.id, title: courseResponse.data.title } : 
          null,
        error: standardCourseError,
        isLoading: isLoadingStandardCourse
      });
    }
  }, [newCourseResponse, courseResponse, isLoadingNewCourse, isLoadingStandardCourse, newCourseError, standardCourseError, isNewCourse]);

  const { data: completedLectures, refetch: refetchCompletedLectures } = useQuery({
    queryKey: ['completed-lectures', courseId, user?.id],
    queryFn: async () => {
      if (!courseId || !user?.id) return {};
      
      const { data, error } = await supabase
        .from('course_progress')
        .select('lecture_id, completed')
        .eq('course_id', parseInt(courseId || '0'))
        .eq('user_id', user?.id);
      
      if (error) {
        console.error('Error fetching completed lectures:', error);
        return {};
      }
      
      return data?.reduce((acc: Record<string, boolean>, curr) => {
        // Skip if item is null or not valid
        if (!curr) return acc;
        
        acc[curr.lecture_id] = curr.completed;
        return acc;
      }, {}) || {};
    },
    enabled: !!courseId && !!user?.id,
  });

  // Determine course data based on source
  const isLoading = isLoadingStandardCourse || isLoadingNewCourse;
  const standardCourse = courseResponse && 'data' in courseResponse ? courseResponse.data : null;
  const newCourse = newCourseResponse && 'data' in newCourseResponse ? newCourseResponse.data : null;
  
  // Process course data based on source
  let course = isNewCourse ? newCourse : standardCourse;
  let title = isNewCourse && newCourse ? (newCourse as CourseWithDetails).title : (standardCourse?.title || '');
  let videoUrl = isNewCourse && newCourse ? undefined : (standardCourse ? standardCourse.video_url : '');
  
  // Transform syllabus data based on the course type
  let syllabusData: CourseSyllabusSection[] = [];

  if (isNewCourse && newCourse) {
    // Convert new course format to syllabus format
    syllabusData = convertNewCourseToSyllabusFormat(newCourse);
    console.log('Converted syllabus data:', {
      sections: syllabusData.length,
      firstSectionTitle: syllabusData[0]?.title || t('courses:noSections')
    });
  } else if (standardCourse && !Array.isArray(standardCourse) && standardCourse.syllabus) {
    // Handle standard course syllabus
    syllabusData = typeof standardCourse.syllabus === 'string'
      ? JSON.parse(standardCourse.syllabus)
      : standardCourse.syllabus as unknown as CourseSyllabusSection[];
  }
  
  console.log('Course data processed:', {
    courseId,
    isNewCourse,
    hasCourse: !!course,
    title,
    syllabusData: syllabusData.length
  });

  useEffect(() => {
    const initializeCourseProgress = async () => {
      if (!user?.id || !courseId || !syllabusData.length) return;
      
      try {
        console.log('Initializing course progress for lectures:', 
          syllabusData.flatMap(s => s.lectures || []).length);
          
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
        toast.error(t('errors:updateCourseProgressFailed'));
      } else {
        await refetchCompletedLectures();
        toast.success(t('courses:homeworkCompleted'));
      }
    } catch (error) {
      console.error('Error marking lecture as complete:', error);
      toast.error(t('errors:updateCourseProgressFailed'));
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
      if (firstSection?.lectures?.length > 0) {
        const firstLecture = firstSection.lectures[0];
        console.log('Auto-selecting first lecture:', firstLecture);
        handleLectureClick(firstLecture);
      }
    }
  }, [syllabusData, selectedLecture]);

  if (isLoading) {
    return <CourseLoadingState />;
  }

  // Check if the course was not found
  if (!course) {
    console.error('Course not found:', {
      courseId,
      isNewCourse,
      newCourseError,
      standardCourseError
    });
    
    // Show toast error
    useEffect(() => {
      toast.error(t('errors:courseNotFound', { id: courseId }));
    }, [courseId, t]);
    
    return <CourseNotFound />;
  }

  // Get materials based on course type
  const materials = isNewCourse && newCourse ? 
    newCourse.materials : 
    (standardCourse && !Array.isArray(standardCourse) ? standardCourse.materials as CourseMaterial[] | null : null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Database initialization component - runs migrations */}
      <DatabaseFixInitializer />
      
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
                  <TabsTrigger value="syllabus">{t('courses:syllabus')}</TabsTrigger>
                  <TabsTrigger value="materials">{t('courses:courseMaterials')}</TabsTrigger>
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
            <DialogTitle>{t('courses:confirmLeaveTitle')}</DialogTitle>
            <DialogDescription>
              {t('courses:confirmLeaveDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowExitWarning(false)}>
              {t('courses:continueLearning')}
            </Button>
            <Button onClick={() => navigate('/my-courses')}>
              {t('courses:confirmLeave')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseLearn;
