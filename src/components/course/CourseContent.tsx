import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Video, Download, Users, Clock, BookOpen } from "lucide-react";
import type { Course, CourseMaterial } from "@/lib/types/course";
import { VideoPlayer } from "./VideoPlayer";
import { CourseMaterials } from "./CourseMaterials";
import { CourseProgress } from "./CourseProgress";
import { HomeworkModule } from "./HomeworkModule";
import { useAuth } from "@/contexts/authHooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CourseContentProps {
  course: Course;
}

export const CourseContent = ({ course }: CourseContentProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedLecture, setSelectedLecture] = useState<{title: string; videoUrl?: string; id?: string} | null>(null);
  const { user } = useAuth();
  
  console.log(`[CourseContent] Initializing with activeTab: ${activeTab}, user authenticated: ${!!user}`);
  
  const whatYouWillLearn = course.whatyouwilllearn || [];
  const requirements = course.requirements || [];
  const syllabusData = Array.isArray(course.syllabus) ? course.syllabus : [];
  const courseId = course.id.toString();
  const videoCount = course.lectures || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部横幅 */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold mb-6">{course.title}</h1>
            <p className="text-lg opacity-90 mb-8">{course.description}</p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center bg-white/10 rounded-full px-4 py-2">
                <Users className="h-5 w-5 mr-2" />
                <span>{course.studentcount || 0} 名学员</span>
              </div>
              
              <div className="flex items-center bg-white/10 rounded-full px-4 py-2">
                <Clock className="h-5 w-5 mr-2" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center bg-white/10 rounded-full px-4 py-2">
                <BookOpen className="h-5 w-5 mr-2" />
                <span>{videoCount} 个章节</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button className="bg-white text-purple-700 hover:bg-gray-100">
                立即学习
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/20">
                课程试看
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tabs list */}
          <TabsList className="w-full bg-gray-50 p-1 rounded-lg flex">
            <TabsTrigger value="overview" className="flex-1 py-2 px-4 rounded-md focus:outline-none data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm">
              课程概述
            </TabsTrigger>
            <TabsTrigger value="curriculum" className="flex-1 py-2 px-4 rounded-md focus:outline-none data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm">
              课程大纲
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex-1 py-2 px-4 rounded-md focus:outline-none data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium text-sm">
              课程资料
            </TabsTrigger>
          </TabsList>

          {/* Overview tab content */}
          <TabsContent value="overview" className="space-y-8">
            {/* Learning Objectives */}
            <div>
              <h2 className="text-2xl font-bold mb-4">您将学到什么</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {whatYouWillLearn.map((item, index) => (
                  <div key={index} className="flex items-start p-4 bg-purple-50 rounded-lg">
                    <Check className="h-5 w-5 text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Requirements */}
            <div>
              <h2 className="text-2xl font-bold mb-4">课程要求</h2>
              <ul className="space-y-3 pl-5 list-disc">
                {requirements.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Curriculum tab content */}
          <TabsContent value="curriculum">
            <h2 className="text-2xl font-bold mb-6">课程大纲</h2>
            <Accordion type="single" collapsible className="w-full">
              {syllabusData.map((section, index) => (
                <AccordionItem key={index} value={`section-${index}`}>
                  <AccordionTrigger className="hover:bg-gray-50 px-4 py-3">
                    <div className="flex justify-between w-full items-center">
                      <span className="font-medium">{section.title}</span>
                      <Badge variant="secondary">{section.lectures?.length || 0} 讲</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="py-2">
                    <ul className="divide-y">
                      {section.lectures?.map((lecture, lectureIndex) => (
                        <li
                          key={lectureIndex}
                          onClick={() => setSelectedLecture({
                            title: lecture.title || "未命名讲座",
                            videoUrl: lecture.videoUrl,
                            id: lecture.id || lecture.title
                          })}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center">
                            <Video className="h-4 w-4 text-purple-600 mr-3" />
                            <span>{lecture.title}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {lecture.duration || "时长未知"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
          
          {/* Materials tab content */}
          <TabsContent value="materials">
            <CourseMaterials materials={course?.materials as CourseMaterial[] | null} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
