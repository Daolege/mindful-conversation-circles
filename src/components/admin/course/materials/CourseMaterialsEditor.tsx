import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, Loader2, AlertCircle, X, FileText, 
  GripVertical, Plus, Info, Check, Bug 
} from "lucide-react";
import { toast } from "sonner";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuth } from "@/contexts/authHooks";
import { supabase } from '@/integrations/supabase/client';
import { useCourseEditor } from "@/hooks/useCourseEditor";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; 
import { 
  getCourseMaterials, 
  uploadCourseMaterial, 
  deleteMaterial, 
  updateMaterialOrder, 
  updateMaterialsVisibility 
} from '@/lib/services/courseMaterialService';
import { v4 as uuidv4 } from 'uuid';

interface CourseMaterial {
  id: string;
  name: string;
  url: string;
  position: number;
  is_visible?: boolean;
  isMock?: boolean;
}

interface CourseMaterialItemProps {
  material: CourseMaterial;
  onDelete: (id: string) => void;
  onNameChange: (id: string, newName: string) => void;
}

// The SortableItem component for each material
const SortableMaterialItem = ({ material, onDelete, onNameChange }: CourseMaterialItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(material.name);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: material.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const handleNameBlur = () => {
    setIsEditing(false);
    if (name !== material.name) {
      onNameChange(material.id, name);
    }
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-all duration-200 rounded-lg border ${material.isMock ? 'border-orange-200' : 'border-gray-200'} mb-2 group cursor-grab`}
    >
      <div className="flex items-center space-x-3 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </div>
        
        <FileText className={`h-5 w-5 ${material.isMock ? 'text-orange-500' : 'text-gray-500'}`} />
        
        {isEditing ? (
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
            className="flex-1 h-8 px-2"
          />
        ) : (
          <span 
            className={`${material.isMock ? 'text-orange-700' : 'text-gray-700'} hover:text-gray-900 transition-colors flex-1`}
            onClick={() => setIsEditing(true)}
          >
            {material.name}
            {material.isMock && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-1 py-0.5 rounded">模拟文件</span>}
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm"
          className="rounded-10 hover:bg-gray-100"
          asChild
        >
          <a href={material.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            下载
          </a>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(material.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface CourseMaterialsEditorProps {
  courseId: number;
}

export const CourseMaterialsEditor = ({ courseId }: CourseMaterialsEditorProps) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [showExampleData, setShowExampleData] = useState<boolean>(false);
  const { user } = useAuth();
  
  // Connect to the CourseEditorContext
  const { sectionVisibility, setSectionVisibility: updateSectionVisibility } = useCourseEditor();
  // Use the materialsVisible state from CourseEditorContext, default to false
  const isVisible = sectionVisibility?.materials !== false;
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Important: For react-dropzone v11.7.1, we need to use the correct accept type
  const fileTypes = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/plain': ['.txt'],
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar']
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // Fix: Cast the fileTypes to any to resolve the type conflict
    accept: fileTypes as any,
    maxSize: 100 * 1024 * 1024, // 100MB max file size
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles, false);
      }
    }
  });

  // 生成示例文件数据 - 新函数：创建硬编码的示例文件列表
  const generateExampleMaterials = (): CourseMaterial[] => {
    console.log("[CourseMaterialsEditor] 生成示例文件数据");
    
    // 创建各种类型的示例文件，覆盖常见文件类型
    return [
      {
        id: `example-pdf-${uuidv4()}`,
        name: "课程讲义.pdf",
        url: "https://example.com/mock-file.pdf",
        position: 0,
        is_visible: true,
        isMock: true
      },
      {
        id: `example-docx-${uuidv4()}`,
        name: "学习指南.docx",
        url: "https://example.com/mock-file.docx",
        position: 1,
        is_visible: true,
        isMock: true
      },
      {
        id: `example-pptx-${uuidv4()}`,
        name: "课程幻灯片.pptx",
        url: "https://example.com/mock-file.pptx",
        position: 2,
        is_visible: true,
        isMock: true
      },
      {
        id: `example-xlsx-${uuidv4()}`,
        name: "成绩统计表.xlsx",
        url: "https://example.com/mock-file.xlsx",
        position: 3,
        is_visible: true,
        isMock: true
      },
      {
        id: `example-zip-${uuidv4()}`,
        name: "课程资源包.zip",
        url: "https://example.com/mock-file.zip",
        position: 4,
        is_visible: true,
        isMock: true
      }
    ];
  };
  
  // 检查存储桶是否已配置
  const checkStorageBuckets = async () => {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error("获取存储桶列表错误:", error);
        setDebugInfo(`获取存储桶列表错误: ${error.message}`);
        return null;
      }
      
      const courseFilesBucket = buckets?.find(b => b.name === 'course-files');
      if (courseFilesBucket) {
        setDebugInfo(null); // 清除之前的错误信息
      } else {
        setDebugInfo("未找到'course-files'存储桶，请联系管理员配置");
      }
      return courseFilesBucket;
    } catch (err) {
      console.error("检查存储桶错误:", err);
      setDebugInfo(`检查存储桶错误: ${err.message || err}`);
      return null;
    }
  };
  
  // 加载或显示示例文件列表
  const fetchMaterials = async () => {
    if (!courseId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // 先尝试从数据库获取真实材料
      console.log("[CourseMaterialsEditor] 从数据库获取课程材料，课程ID:", courseId);
      const { data, error } = await getCourseMaterials(courseId);
      
      if (error) {
        console.error("[CourseMaterialsEditor] 获取材料错误:", error);
        throw error;
      }
      
      const sortedMaterials = data?.sort((a, b) => a.position - b.position) || [];
      console.log("[CourseMaterialsEditor] 获取到材料数量:", sortedMaterials.length);
      
      // 标记为模拟文件并过滤掉隐藏的材料（在课程详细页中）
      const processedMaterials = sortedMaterials.map(material => ({
        ...material,
        isMock: material.name?.includes('模拟') || material.url?.includes('fallback') || false
      }));
      
      // 如果没有真实材料，使用示例材料或打开示例数据标志
      if (processedMaterials.length === 0) {
        console.log("[CourseMaterialsEditor] 没有找到真实材料，使用示例数据");
        setShowExampleData(true);
        setMaterials(generateExampleMaterials());
      } else {
        console.log("[CourseMaterialsEditor] 使用真实材料数据");
        setShowExampleData(false);
        setMaterials(processedMaterials);
      }
      
      // 统计真实文件和模拟文件数量
      const realFiles = processedMaterials.filter(m => !m.isMock).length;
      const mockFiles = processedMaterials.filter(m => m.isMock).length;
      
      if (debugMode) {
        setDebugInfo(`共有${processedMaterials.length}个文件，其中真实文件${realFiles}个，模拟文件${mockFiles}个`);
      }
      
      // If we have materials, set the visibility state based on the first material
      // Otherwise, use the default visibility from CourseEditorContext
      if (sortedMaterials.length > 0 && sortedMaterials[0].is_visible !== undefined) {
        updateSectionVisibility({
          ...sectionVisibility,
          materials: !!sortedMaterials[0].is_visible
        });
      }
    } catch (err: any) {
      console.error("[CourseMaterialsEditor] 获取材料失败:", err);
      setError(err.message || "无法加载课程附件");
      
      // 在出错时也显示示例数据，确保UI有内容显示
      console.log("[CourseMaterialsEditor] 出错时使用示例数据");
      setShowExampleData(true);
      setMaterials(generateExampleMaterials());
    } finally {
      setIsLoading(false);
    }
  };

  // 强制显示示例数据
  const showExampleMaterials = () => {
    console.log("[CourseMaterialsEditor] 手动显示示例材料");
    setShowExampleData(true);
    setMaterials(generateExampleMaterials());
    toast.info("已显示示例文件列表", { description: "这些是用于展示的模拟文件" });
  };

  // Generate mock file for upload functionality - 改进错误处理
  const generateMockFile = (fileName: string, fileType: string): File => {
    try {
      // Create a small ArrayBuffer (1KB for example)
      const size = 1024;
      const buffer = new ArrayBuffer(size);
      
      // Create a File object from the buffer
      // Convert fileType to proper MIME type if needed
      const mimeType = fileType.startsWith('.') 
        ? Object.entries(fileTypes).find(([_, exts]) => 
            (exts as string[]).includes(fileType))?.[0] || 'application/octet-stream'
        : fileType;
      
      // Use the File constructor with buffer
      return new File([buffer], fileName, { type: mimeType });
    } catch (err) {
      console.error('生成模拟文件错误:', err);
      // 返回一个基本的文本文件作为后备
      return new File(['默认文本内容'], 'fallback-file.txt', { type: 'text/plain' });
    }
  };
  
  const handleAddMockFile = () => {
    try {
      // Generate random file type from the available file types
      const fileExtensions = Object.values(fileTypes).flat();
      const randomExtension = fileExtensions[Math.floor(Math.random() * fileExtensions.length)];
      
      // Common document names for mock files - 使用英文文件名避免编码问题，并添加模拟标记
      const mockFileNames = [
        "模拟_课程材料",
        "模拟_学习指南",
        "模拟_练习题",
        "模拟_参考资料",
        "模拟_教学大纲", 
        "模拟_学习计划",
        "模拟_案例研究",
        "模拟_阅读材料",
        "模拟_常见问题",
        "模拟_总结"
      ];
      
      const randomName = mockFileNames[Math.floor(Math.random() * mockFileNames.length)];
      const fileName = `${randomName}${randomExtension}`;
      const mockFile = generateMockFile(fileName, randomExtension);
      
      // 调用文件上传函数，标记为模拟文件
      handleFileUpload([mockFile], true);
    } catch (err) {
      console.error('添加模拟文件错误:', err);
      toast.error('无法创建模拟文件', { description: '请尝试手动上传文件' });
    }
  };

  const handleFileUpload = async (files: File[], isMockFile: boolean = false) => {
    if (!courseId || !user) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      // 首先检查存储桶是否存在
      const bucket = await checkStorageBuckets();
      if (!bucket && !isMockFile) {
        throw new Error("未找到'course-files'存储桶，请确保已正确配置存储");
      }
      
      for (const file of files) {
        const position = materials.length > 0 ? Math.max(...materials.map(m => m.position)) + 1 : 0;
        
        console.log(`[CourseMaterialsEditor] 准备上传文件${isMockFile ? '(模拟)' : ''}: ${file.name}, 大小: ${file.size} bytes`);
        
        const { data, error, isMock } = await uploadCourseMaterial(courseId, file, file.name, position, isMockFile);
        
        if (error) {
          console.error('[CourseMaterialsEditor] 上传文件错误:', error);
          throw error;
        }
        
        if (data) {
          // 添加isMock标志用于UI显示
          const updatedData = {
            ...data,
            isMock: isMockFile
          };
          
          // 不再手动更新状态，直接重新获取完整列表以确保数据一致
          console.log('[CourseMaterialsEditor] 文件上传成功，刷新材料列表');
          
          if (isMockFile) {
            toast.info("模拟文件上传成功", { 
              description: "此为测试用途的模拟文件，在课程页面中不可见" 
            });
          } else {
            toast.success("文件上传成功", { description: file.name });
          }
          
          // 上传成功后重新获取材料列表
          await fetchMaterials();
        }
      }
    } catch (err: any) {
      console.error("Error uploading files:", err);
      
      // 区分模拟文件和真实文件的错误提示
      if (isMockFile) {
        toast.error("模拟文件上传失败", { 
          description: "这只是一个测试错误，不影响实际使用" 
        });
      } else {
        toast.error("上传文件失败", { 
          description: err.message || "可能是文件名包含特殊字符或存储配置问题" 
        });
      }
      
      setError(err.message || "上传文件失败");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    // 检查是否是示例文件，如果是则只从本地状态中删除
    if (id.startsWith('example-')) {
      console.log("[CourseMaterialsEditor] 删除示例文件:", id);
      setMaterials(prev => prev.filter(material => material.id !== id));
      toast.success("示例文件已从列表中移除");
      return;
    }
    
    try {
      const { error } = await deleteMaterial(id);
      
      if (error) {
        throw error;
      }
      
      // 成功删除后重新获取文件列表
      console.log("[CourseMaterialsEditor] 文件删除成功，刷新材料列表");
      await fetchMaterials();
      toast.success("文件已删除");
    } catch (err: any) {
      console.error("Error deleting material:", err);
      toast.error("删除文件失败", { description: err.message });
    }
  };
  
  const handleNameChange = async (id: string, newName: string) => {
    // 检查是否是示例文件，如果是则只更新本地状态
    if (id.startsWith('example-')) {
      console.log("[CourseMaterialsEditor] 更新示例文件名称:", id, newName);
      setMaterials(prev => 
        prev.map(material => 
          material.id === id ? { ...material, name: newName } : material
        )
      );
      toast.success("示例文件名已更新");
      return;
    }
    
    // Update name in UI immediately for responsiveness
    setMaterials(prev => 
      prev.map(material => 
        material.id === id ? { ...material, name: newName } : material
      )
    );
    
    try {
      // Call API to update the name in database
      const { data, error } = await supabase
        .from('course_materials')
        .update({ name: newName })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast.success("文件名已更新");
      // 成功更新后重新获取文件列表
      await fetchMaterials();
    } catch (err: any) {
      console.error("Error updating material name:", err);
      toast.error("更新文件名失败");
      // Revert name on error
      fetchMaterials();
    }
  };
  
  const handleVisibilityChange = async (checked: boolean) => {
    // 如果使用的是示例数据，只更新本地状态
    if (showExampleData) {
      console.log("[CourseMaterialsEditor] 更新示例数据可见性:", checked);
      updateSectionVisibility({
        ...sectionVisibility,
        materials: checked
      });
      
      setMaterials(prev => 
        prev.map(material => ({ ...material, is_visible: checked }))
      );
      
      toast.success(checked ? "示例附件已设为可见" : "示例附件已设为隐藏");
      return;
    }
    
    // Update visibility in CourseEditorContext first for responsive UI
    updateSectionVisibility({
      ...sectionVisibility,
      materials: checked
    });
    
    try {
      // Update visibility for all materials using the service function
      const { error } = await updateMaterialsVisibility(courseId, checked);
        
      if (error) throw error;
      
      // 成功更新后重新获取文件列表
      await fetchMaterials();
      
      toast.success(checked ? "课程附件已设为可见" : "课程附件已设为隐藏");
    } catch (err: any) {
      console.error("Error updating materials visibility:", err);
      toast.error("更新附件可见性失败");
    }
  };
  
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      // Find the indices of the items
      const oldIndex = materials.findIndex(item => item.id === active.id);
      const newIndex = materials.findIndex(item => item.id === over.id);
      
      // Update the UI immediately for responsiveness
      const newMaterials = arrayMove(materials, oldIndex, newIndex).map(
        (item, index) => ({ ...item, position: index })
      );
      
      setMaterials(newMaterials);
      
      // 如果使用的是示例数据，不需要更新数据库
      if (showExampleData) {
        console.log("[CourseMaterialsEditor] 更新示例数据顺序");
        toast.success("示例文件顺序已更新");
        return;
      }
      
      // Update in database
      try {
        const orderUpdates = newMaterials.map((material, index) => ({
          id: material.id,
          position: index
        }));
        
        const { error } = await updateMaterialOrder(orderUpdates);
        
        if (error) {
          throw error;
        }
        
        toast.success("课程附件顺序已更新");
      } catch (err: any) {
        console.error("Error updating material order:", err);
        toast.error("更新课程附件顺序失败");
        // Revert to original order on error
        fetchMaterials();
      }
    }
  };
  
  // 切换调试模式
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    if (!debugMode) {
      // 切换到调试模式时显示一些调试信息
      checkStorageBuckets().then(bucket => {
        const realFiles = materials.filter(m => !m.isMock).length;
        const mockFiles = materials.filter(m => m.isMock).length;
        setDebugInfo(`存储桶: ${bucket ? '已找到' : '未找到'}, 文件总数: ${materials.length} (真实: ${realFiles}, 模拟: ${mockFiles})`);
      });
    } else {
      // 关闭调试模式时清除调试信息
      setDebugInfo(null);
    }
  };
  
  // 组件加载时和课程ID变化时获取文件列表
  useEffect(() => {
    fetchMaterials();
    
    // 检查存储桶配置
    checkStorageBuckets();
  }, [courseId]);
  
  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">课程附件</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={toggleDebugMode} 
                    variant="ghost" 
                    size="icon" 
                    className={`h-6 w-6 rounded-full ${debugMode ? 'bg-orange-100 text-orange-700' : 'text-gray-400'}`}
                  >
                    <Bug className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{debugMode ? '关闭调试模式' : '开启调试模式'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="materials-visible"
              checked={isVisible}
              onCheckedChange={handleVisibilityChange}
            />
            <Label htmlFor="materials-visible">显示附件</Label>
          </div>
        </div>
        
        {debugInfo && (
          <Alert variant={debugMode ? "default" : "warning"} className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>{debugMode ? "调试信息" : "存储配置提示"}</AlertTitle>
            <AlertDescription>
              {typeof debugInfo === 'string' ? debugInfo : JSON.stringify(debugInfo)}
              {showExampleData && <div className="mt-1 text-sm font-medium">当前显示: 示例数据</div>}
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>
              {error}
              {error.includes('上传') && (
                <div className="mt-2 text-sm">
                  可能原因: 文件名包含特殊字符、文件大小超限或存储配置问题
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-wrap gap-4 mb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleAddMockFile} 
                  variant="outline" 
                  className="flex items-center gap-2 border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100"
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                  添加模拟文件
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>添加一个测试用的模拟文件，用于验证上传功能</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            onClick={() => fetchMaterials()} 
            variant="ghost"
            size="sm"
            className="text-gray-500"
            type="button"
          >
            <Check className="h-4 w-4 mr-1" />
            刷新列表
          </Button>

          {/* 新增：强制显示示例数据按钮 */}
          <Button 
            onClick={showExampleMaterials} 
            variant={showExampleData ? "default" : "outline"}
            size="sm"
            className={showExampleData ? "bg-blue-600 text-white" : "text-blue-600"}
            type="button"
          >
            <FileText className="h-4 w-4 mr-1" />
            显示示例文件
          </Button>
        </div>
        
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`h-10 w-10 mx-auto mb-4 ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
          <p className="text-gray-600 mb-2">拖拽文件到这里，或点击上传</p>
          <p className="text-sm text-gray-500">
            支持的文件格式：PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR (最大100MB)
          </p>
          {isUploading && (
            <div className="mt-4 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-primary">上传中...</span>
            </div>
          )}
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-800">已上传文件</h4>
            {materials.length > 0 && (
              <div className="text-xs text-gray-500">
                总计: {materials.length} | 
                {showExampleData ? 
                  " 示例文件" : 
                  `真实文件: ${materials.filter(m => !m.isMock).length} | 模拟文件: ${materials.filter(m => m.isMock).length}`}
              </div>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : materials.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={materials.map(m => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {materials.map((material) => (
                    <SortableMaterialItem 
                      key={material.id}
                      material={material}
                      onDelete={handleDelete}
                      onNameChange={handleNameChange}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <p className="text-gray-500 text-center py-4">暂无附件，请上传课程相关文件或点击"显示示例文件"</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
