import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, AlertCircle, X, FileText, GripVertical, Plus } from "lucide-react";
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
import { getCourseMaterials, uploadCourseMaterial, deleteMaterial, updateMaterialOrder, updateMaterialsVisibility } from '@/lib/services/courseMaterialService';

interface CourseMaterial {
  id: string;
  name: string;
  url: string;
  position: number;
  is_visible?: boolean;
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
      className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-all duration-200 rounded-lg border border-gray-200 mb-2 group cursor-grab"
    >
      <div className="flex items-center space-x-3 flex-1">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </div>
        
        <FileText className="h-5 w-5 text-gray-500" />
        
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
            className="text-gray-700 hover:text-gray-900 transition-colors flex-1"
            onClick={() => setIsEditing(true)}
          >
            {material.name}
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
  const { user } = useAuth();
  
  // Connect to the CourseEditorContext
  const { sectionVisibility, setSectionVisibility } = useCourseEditor();
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
        handleFileUpload(acceptedFiles);
      }
    }
  });
  
  // Load course materials when component mounts
  useEffect(() => {
    fetchMaterials();
  }, [courseId]);
  
  const fetchMaterials = async () => {
    if (!courseId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await getCourseMaterials(courseId);
      if (error) {
        throw error;
      }
      
      const sortedMaterials = data?.sort((a, b) => a.position - b.position) || [];
      setMaterials(sortedMaterials);
      
      // If we have materials, set the visibility state based on the first material
      // Otherwise, use the default visibility from CourseEditorContext
      if (sortedMaterials.length > 0 && sortedMaterials[0].is_visible !== undefined) {
        setSectionVisibility('materials', !!sortedMaterials[0].is_visible);
      }
    } catch (err: any) {
      console.error("Error fetching materials:", err);
      setError(err.message || "无法加载课程附件");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock file for upload functionality
  const generateMockFile = (fileName: string, fileType: string): File => {
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
  };
  
  const handleAddMockFile = () => {
    // Generate random file type from the available file types
    const fileExtensions = Object.values(fileTypes).flat();
    const randomExtension = fileExtensions[Math.floor(Math.random() * fileExtensions.length)];
    
    // Common document names for mock files
    const mockFileNames = [
      "课程教材",
      "学习指南",
      "练习题",
      "参考资料",
      "课程大纲",
      "学习计划",
      "实践案例",
      "附加阅读",
      "常见问题解答",
      "知识点总结"
    ];
    
    const randomName = mockFileNames[Math.floor(Math.random() * mockFileNames.length)];
    const fileName = `${randomName}${randomExtension}`;
    const mockFile = generateMockFile(fileName, randomExtension);
    
    handleFileUpload([mockFile]);
  };

  const handleFileUpload = async (files: File[]) => {
    if (!courseId || !user) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      for (const file of files) {
        const position = materials.length > 0 ? Math.max(...materials.map(m => m.position)) + 1 : 0;
        
        const { data, error } = await uploadCourseMaterial(courseId, file, file.name, position);
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setMaterials(prev => [...prev, data]);
          toast.success("文件上传成功", { description: file.name });
        }
      }
    } catch (err: any) {
      console.error("Error uploading files:", err);
      toast.error("上传文件失败", { description: err.message });
      setError(err.message || "上传文件失败");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await deleteMaterial(id);
      
      if (error) {
        throw error;
      }
      
      setMaterials(prev => prev.filter(material => material.id !== id));
      toast.success("文件已删除");
    } catch (err: any) {
      console.error("Error deleting material:", err);
      toast.error("删除文件失败", { description: err.message });
    }
  };
  
  const handleNameChange = async (id: string, newName: string) => {
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
    } catch (err: any) {
      console.error("Error updating material name:", err);
      toast.error("更新文件名失败");
      // Revert name on error
      fetchMaterials();
    }
  };
  
  const handleVisibilityChange = async (checked: boolean) => {
    // Update visibility in CourseEditorContext first for responsive UI
    setSectionVisibility('materials', checked);
    
    try {
      // Update visibility for all materials using the service function
      const { error } = await updateMaterialsVisibility(courseId, checked);
        
      if (error) throw error;
      
      // Update local state
      setMaterials(prev => 
        prev.map(material => ({ ...material, is_visible: checked }))
      );
      
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
  
  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">课程附件</h3>
          <div className="flex items-center gap-2">
            <Switch
              id="materials-visible"
              checked={isVisible}
              onCheckedChange={handleVisibilityChange}
            />
            <Label htmlFor="materials-visible">显示附件</Label>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-4 mb-2">
          <Button 
            onClick={handleAddMockFile} 
            variant="outline" 
            className="flex items-center gap-2"
            type="button"
          >
            <Plus className="h-4 w-4" />
            添加模拟文件
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
          <h4 className="font-medium text-gray-800">已上传文件</h4>
          
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
            <p className="text-gray-500 text-center py-4">暂无附件，请上传课程相关文件</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
