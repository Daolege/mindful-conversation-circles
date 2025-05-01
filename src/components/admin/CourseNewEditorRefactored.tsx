import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CourseOutlineEditor } from './course/outline/CourseOutlineEditor';
import { BasicInfoForm } from './course/outline/BasicInfoForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackButton } from './course/BackButton';
import { Loader2 } from 'lucide-react';
import { getCourseNewById } from '@/lib/services/courseNewService';
import { toast } from 'sonner';
import { CourseEditorProvider } from './course-editor/CourseEditorContext';
import { CourseMaterialsEditor } from './course/materials/CourseMaterialsEditor';
import { CourseOtherSettings } from './course/settings/CourseOtherSettings';

interface CourseNewEditorRefactoredProps {
  initialCourseId?: number | null;
  initialActiveTab?: string;
  courseTitle?: string;
  savedSections?: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
  };
  sectionVisibility?: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
    materials: boolean;
  };
}

const CourseNewEditorRefactored = ({ 
  initialCourseId, 
  initialActiveTab = 'basic',
  courseTitle = '',
  savedSections = {
    objectives: false,
    requirements: false,
    audiences: false
  },
  sectionVisibility = {
    objectives: true,
    requirements: true,
    audiences: true,
    materials: false // Default materials to hidden
  }
}: CourseNewEditorRefactoredProps) => {
  const { courseId: urlCourseId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || initialActiveTab;
  const navigate = useNavigate();
  
  // 存储courseId到组件状态
  const [courseId, setCourseId] = useState<number | null>(initialCourseId || null);
  const [activeTab, setActiveTab] = useState(tabParam);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [courseExists, setCourseExists] = useState(false);
  const [courseData, setCourseData] = useState(null);
  const [isDataRefresh, setIsDataRefresh] = useState(false);
  
  // 初始化处理
  useEffect(() => {
    console.log("[CourseNewEditorRefactored] 组件初始化，检查课程ID");
    // 通过props传入的courseId优先级最高
    if (initialCourseId !== undefined && initialCourseId !== null) {
      setCourseId(initialCourseId);
      setCourseExists(true);
      console.log("[CourseNewEditorRefactored] 使用props中的courseId:", initialCourseId);
      return;
    }
    
    // 其次检查URL中的courseId
    if (urlCourseId && urlCourseId !== "new") {
      const numericId = Number(urlCourseId);
      if (!isNaN(numericId)) {
        setCourseId(numericId);
        verifyCourseExists(numericId);
        console.log("[CourseNewEditorRefactored] 使用URL中的courseId:", numericId);
      } else {
        console.error("[CourseNewEditorRefactored] URL中的courseId无效:", urlCourseId);
        toast.error("无效的课程ID");
      }
    } else {
      console.log("[CourseNewEditorRefactored] 创建新课程模式");
      setCourseId(null);
      setCourseExists(false);
    }
  }, [initialCourseId, urlCourseId]);
  
  // 验证课程是否存在
  const verifyCourseExists = async (id: number) => {
    if (!id || isNaN(id)) return;
    
    setIsLoading(true);
    try {
      console.log("[CourseNewEditorRefactored] 验证课程是否存在:", id);
      const { data, error } = await getCourseNewById(id);
      
      if (error) {
        console.error("[CourseNewEditorRefactored] 获取课程信息失败:", error);
        toast.error("获取课程信息失败");
        setCourseExists(false);
      } else if (data) {
        console.log("[CourseNewEditorRefactored] 课程��在:", data);
        setCourseExists(true);
        setCourseData(data);
      } else {
        console.error("[CourseNewEditorRefactored] 课程不存在");
        toast.error("课程不存在");
        setCourseExists(false);
      }
    } catch (err) {
      console.error("[CourseNewEditorRefactored] 验证课程时出错:", err);
      setCourseExists(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 更新URL当标签变化时
  useEffect(() => {
    if (activeTab !== tabParam) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', activeTab);
      setSearchParams(newParams);
      console.log("[CourseNewEditorRefactored] 更新URL tab参数:", activeTab);
    }
  }, [activeTab, tabParam, setSearchParams, searchParams]);

  // 处理章节变化
  const handleSectionsChange = (updatedSections) => {
    setSections(updatedSections);
    console.log('[CourseNewEditorRefactored] Sections updated:', updatedSections);
  };

  // 处理标签变化 
  const handleTabChange = (tab: string) => {
    console.log("[CourseNewEditorRefactored] Tab change requested:", tab, "Current courseId:", courseId);
    
    // 如果切换到需要courseId的标签，但没有courseId
    if (tab !== 'basic' && !courseId) {
      console.log("[CourseNewEditorRefactored] 不能切换到需要courseId的标签");
      toast.error("请先保存课程基本信息");
      return;
    }
    
    setActiveTab(tab);
    
    // 如果切换到课程大纲标签，触发数据刷新
    if (tab === 'curriculum') {
      setIsDataRefresh(prev => !prev);
    }
    
    // 如果切换到其他设置标签，也触发数据刷新
    if (tab === 'settings') {
      setIsDataRefresh(prev => !prev);
    }
  };

  // 处理课程创建成功和导航
  const handleCourseCreated = (newCourseId: number) => {
    console.log("[CourseNewEditorRefactored] 课程创建成功，ID:", newCourseId);
    
    setCourseId(newCourseId);
    setCourseExists(true);
    
    // 更新URL以反映新课程ID并切换到设置标签，确保加载默认内容
    setActiveTab('settings');
    navigate(`/admin/courses-new/${newCourseId}?tab=settings`, { replace: true });
    toast.success("请检查并编辑默认的课程学习目标、学习要求和适合人群", {
      duration: 5000,
    });
  };
  
  // 处理保存成功
  const handleOutlineSaveSuccess = () => {
    console.log("[CourseNewEditorRefactored] 课程大纲保存成功");
    
    // 触发章节数据刷新
    setIsDataRefresh(prev => !prev);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">加载课程数据...</p>
      </div>
    );
  }

  console.log("[CourseNewEditorRefactored] Rendering with saved sections:", savedSections);
  console.log("[CourseNewEditorRefactored] Rendering with section visibility:", sectionVisibility);

  return (
    <CourseEditorProvider value={{ 
      data: { 
        id: courseId, 
        title: courseData?.title,
        description: courseData?.description 
      },
      savedSections: savedSections,
      sectionVisibility: sectionVisibility
    }}>
      <div className="space-y-6">
        <div className="space-y-2">
          <BackButton />
          {courseTitle && (
            <h1 className="text-2xl font-semibold text-gray-800 px-1">
              {courseTitle}
            </h1>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">基本信息</TabsTrigger>
              <TabsTrigger value="curriculum" disabled={!courseId}>课程大纲</TabsTrigger>
              <TabsTrigger value="materials" disabled={!courseId}>课程附件</TabsTrigger>
              <TabsTrigger value="settings" disabled={!courseId}>其他设置</TabsTrigger>
              <TabsTrigger value="preview" disabled={!courseId}>预览</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <BasicInfoForm 
                onTabChange={handleTabChange} 
                onCourseCreated={handleCourseCreated} 
                courseId={courseId}
              />
            </TabsContent>
            
            <TabsContent value="curriculum">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : courseId ? (
                <CourseOutlineEditor
                  courseId={courseId}
                  onSectionsChange={handleSectionsChange}
                  onSaveSuccess={handleOutlineSaveSuccess}
                  key={`outline-${courseId}-${isDataRefresh}`}
                />
              ) : (
                <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-600">请先保存课程基本信息</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="materials">
              {courseId ? (
                <CourseMaterialsEditor courseId={courseId} />
              ) : (
                <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-600">请先保存课程基本信息</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings">
              {courseId ? (
                <CourseOtherSettings
                  courseId={courseId}
                  key={`settings-${courseId}-${isDataRefresh}`}
                />
              ) : (
                <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-600">请先保存课程基本信息</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="preview">
              <div className="text-center py-8 text-gray-500">
                课程预览功能开发中...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </CourseEditorProvider>
  );
};

export default CourseNewEditorRefactored;
