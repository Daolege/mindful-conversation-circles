
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ChevronLeft, Search, FileText } from "lucide-react";
import { toast } from "sonner";
import { CourseSection } from "@/lib/types/course-new";
import { getCourseNewById } from "@/lib/services/courseNewService";
import { 
  getCourseStructureForHomework, 
  getHomeworkSubmissionsByCourse,
  getHomeworkSubmissionsByLecture 
} from "@/lib/services/homeworkSubmissionService";
import { CourseStructureNav } from './CourseStructureNav';
import { HomeworkSubmissionList } from './HomeworkSubmissionList';
import { HomeworkSubmissionDetail } from './HomeworkSubmissionDetail';

const HomeworkSubmissionsView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseStructure, setCourseStructure] = useState<CourseSection[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [showSubmissionDetail, setShowSubmissionDetail] = useState(false);
  
  // 加载课程信息和作业结构
  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        // 加载课程基本信息
        const { data: course, error: courseError } = await getCourseNewById(parseInt(courseId));
        if (courseError) {
          toast.error("加载课程信息失败");
          return;
        }
        
        if (course) {
          setCourseTitle(course.title || '未命名课程');
          
          // 加载课程章节和课时结构
          const { data: structure, error: structureError } = await getCourseStructureForHomework(parseInt(courseId));
          if (structureError) {
            toast.error("加载课程结构失败");
            return;
          }
          
          setCourseStructure(structure || []);
          
          // 加载课程的所有作业提交
          const { data: allSubmissions, count } = await getHomeworkSubmissionsByCourse(parseInt(courseId));
          if (allSubmissions) {
            setSubmissions(allSubmissions);
            setTotalSubmissions(count);
          }
        }
      } catch (err) {
        console.error("加载课程数据出错:", err);
        toast.error("加载课程数据出错");
      } finally {
        setLoading(false);
      }
    };
    
    loadCourseData();
  }, [courseId]);
  
  // 处理课时选择
  const handleLectureSelect = async (lectureId: string) => {
    setSelectedLectureId(lectureId);
    setActiveTab('lecture');
    setCurrentPage(1);
    setLoading(true);
    
    try {
      const { data, count } = await getHomeworkSubmissionsByLecture(parseInt(courseId || '0'), lectureId);
      if (data) {
        setSubmissions(data);
        setTotalSubmissions(count);
      }
    } catch (err) {
      console.error("加载课时作业出错:", err);
      toast.error("加载课时作业出错");
    } finally {
      setLoading(false);
    }
  };
  
  // 处理返回所有作业
  const handleViewAllSubmissions = async () => {
    setSelectedLectureId(null);
    setActiveTab('all');
    setCurrentPage(1);
    setLoading(true);
    
    try {
      const { data, count } = await getHomeworkSubmissionsByCourse(parseInt(courseId || '0'));
      if (data) {
        setSubmissions(data);
        setTotalSubmissions(count);
      }
    } catch (err) {
      console.error("加载所有作业出错:", err);
      toast.error("加载所有作业出错");
    } finally {
      setLoading(false);
    }
  };
  
  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 实现搜索逻辑，可能需要调用后端API
    // 这里简单用前端过滤模拟
    toast.info("搜索功能待实现");
  };
  
  // 处理查看作业详情
  const handleViewSubmission = (submissionId: string) => {
    setSelectedSubmission(submissionId);
    setShowSubmissionDetail(true);
  };
  
  // 处理返回课程列表
  const handleBackToCourses = () => {
    navigate('/admin?tab=courses-new');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackToCourses}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{courseTitle} - 作业提交管理</h1>
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="搜索学员或作业..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
          <Button type="submit" size="sm">搜索</Button>
        </form>
      </div>
      
      <div className="grid grid-cols-12 gap-4">
        {/* 左侧课程结构导航 */}
        <div className="col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">课程结构</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>加载中...</span>
                </div>
              ) : courseStructure.length > 0 ? (
                <CourseStructureNav 
                  sections={courseStructure}
                  onLectureSelect={handleLectureSelect}
                  selectedLectureId={selectedLectureId}
                  onViewAll={handleViewAllSubmissions}
                />
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>此课程暂无章节或课时</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* 右侧作业列表 */}
        <div className="col-span-9">
          <Card>
            <CardHeader className="pb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="all" onClick={handleViewAllSubmissions}>所有作业</TabsTrigger>
                    {selectedLectureId && (
                      <TabsTrigger value="lecture">
                        {courseStructure
                          .flatMap(s => s.lectures || [])
                          .find(l => l.id === selectedLectureId)?.title || '课时作业'}
                      </TabsTrigger>
                    )}
                  </TabsList>
                  <div className="text-sm text-gray-500">
                    共 {totalSubmissions} 个作业提交
                  </div>
                </div>
              </Tabs>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>加载作业提交中...</span>
                </div>
              ) : (
                <HomeworkSubmissionList 
                  submissions={submissions}
                  onViewSubmission={handleViewSubmission}
                  currentPage={currentPage}
                  totalSubmissions={totalSubmissions}
                  onPageChange={setCurrentPage}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* 作业提交详情弹窗 */}
      {selectedSubmission && (
        <HomeworkSubmissionDetail 
          submissionId={selectedSubmission}
          open={showSubmissionDetail}
          onClose={() => {
            setShowSubmissionDetail(false);
            setSelectedSubmission(null);
          }}
        />
      )}
    </div>
  );
};

export default HomeworkSubmissionsView;
