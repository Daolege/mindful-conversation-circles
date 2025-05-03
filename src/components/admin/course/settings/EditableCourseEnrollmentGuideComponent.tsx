
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, GripVertical, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// Define interfaces for our components
export interface CourseEnrollmentGuide {
  id: string;
  course_id: number;
  guide_type: string;
  title: string;
  content?: string;
  link?: string;
  image_url?: string;
  position: number;
}

interface EditableCourseEnrollmentGuideComponentProps {
  courseId?: number;
  guides: CourseEnrollmentGuide[];
  onChange: (newItems: CourseEnrollmentGuide[]) => void;
}

// Available social platform types for the guides
const availableSocialTypes = [
  { value: 'wechat', label: '微信群' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'qq', label: 'QQ群' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'discord', label: 'Discord' },
  { value: 'other', label: '其他' },
];

// Sortable guide item component
const SortableGuideItem = ({ guide, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedGuide, setEditedGuide] = useState({ ...guide });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(guide.image_url || null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: guide.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    let updatedGuide = { ...editedGuide };
    
    // If there's a new image, upload it
    if (imageFile) {
      try {
        const filePath = `course_guides/${guide.course_id}/${Date.now()}_${imageFile.name}`;
        
        // Upload the file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('course_guides')
          .upload(filePath, imageFile);
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the public URL
        const { data: urlData } = supabase
          .storage
          .from('course_guides')
          .getPublicUrl(filePath);
          
        // Update the image URL
        updatedGuide.image_url = urlData.publicUrl;
        setImagePreview(urlData.publicUrl);
        
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('上传图片失败');
      }
    }
    
    // Format WhatsApp link if needed
    if (guide.guide_type === 'whatsapp' && updatedGuide.content) {
      // Remove any non-numeric characters
      const phoneNumber = updatedGuide.content.replace(/\D/g, '');
      updatedGuide.link = `https://wa.me/${phoneNumber}`;
    }
    
    onEdit(guide.id, updatedGuide);
    setIsEditing(false);
    setImageFile(null);
  };

  const handleCancel = () => {
    setEditedGuide({ ...guide });
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(guide.image_url || null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片大小不能超过2MB');
      return;
    }
    
    setImageFile(file);
    
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const renderGuideForm = () => {
    if (editedGuide.guide_type === 'wechat') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">群名称</label>
            <Input
              value={editedGuide.title}
              onChange={(e) => setEditedGuide({...editedGuide, title: e.target.value})}
              placeholder="例如：课程学习交流群"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">群描述</label>
            <Textarea
              value={editedGuide.content || ''}
              onChange={(e) => setEditedGuide({...editedGuide, content: e.target.value})}
              placeholder="例如：请扫描二维码添加助教微信，加入课程学习群"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">微信二维码</label>
            <div className="flex items-center space-x-4">
              <Button variant="outline" type="button" onClick={() => document.getElementById(`file-${guide.id}`)?.click()}>
                <Upload className="h-4 w-4 mr-2" /> 上传二维码
              </Button>
              <input
                id={`file-${guide.id}`}
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageChange}
              />
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="二维码预览" 
                  className="w-32 h-32 object-contain border rounded-md" 
                />
              </div>
            )}
          </div>
        </div>
      );
    } else if (editedGuide.guide_type === 'whatsapp') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">群名称</label>
            <Input
              value={editedGuide.title}
              onChange={(e) => setEditedGuide({...editedGuide, title: e.target.value})}
              placeholder="例如：WhatsApp学习交流群"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">WhatsApp号码</label>
            <Input
              value={editedGuide.content || ''}
              onChange={(e) => setEditedGuide({...editedGuide, content: e.target.value})}
              placeholder="例如：+8613812345678"
            />
            <p className="text-xs text-muted-foreground">请输入完整号码，包含国家代码</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">标题</label>
            <Input
              value={editedGuide.title}
              onChange={(e) => setEditedGuide({...editedGuide, title: e.target.value})}
              placeholder="输入标题"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">描述</label>
            <Textarea
              value={editedGuide.content || ''}
              onChange={(e) => setEditedGuide({...editedGuide, content: e.target.value})}
              placeholder="输入描述内容"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">链接</label>
            <Input
              value={editedGuide.link || ''}
              onChange={(e) => setEditedGuide({...editedGuide, link: e.target.value})}
              placeholder="例如：https://example.com/group"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">图片（可选）</label>
            <div className="flex items-center space-x-4">
              <Button variant="outline" type="button" onClick={() => document.getElementById(`file-${guide.id}`)?.click()}>
                <Upload className="h-4 w-4 mr-2" /> 上传图片
              </Button>
              <input
                id={`file-${guide.id}`}
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageChange}
              />
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="图片预览" 
                  className="w-32 h-32 object-contain border rounded-md" 
                />
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-muted/40 rounded-lg p-3 mb-2 transition-all hover:bg-muted/60"
      onDoubleClick={!isEditing ? handleDoubleClick : undefined}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Select 
              value={editedGuide.guide_type}
              onValueChange={(value) => setEditedGuide({...editedGuide, guide_type: value})}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="选择社交软件类型" />
              </SelectTrigger>
              <SelectContent>
                {availableSocialTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {renderGuideForm()}
          
          <div className="flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCancel}
            >
              取消
            </Button>
            <Button 
              size="sm"
              onClick={handleSave}
            >
              保存
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3 flex-1">
            <div 
              {...attributes} 
              {...listeners} 
              className="cursor-grab active:cursor-grabbing p-1"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                  {availableSocialTypes.find(t => t.value === guide.guide_type)?.label || guide.guide_type}
                </span>
                <span className="ml-2 font-medium">{guide.title}</span>
              </div>
              {guide.content && <p className="text-sm text-muted-foreground line-clamp-1">{guide.content}</p>}
            </div>
            {guide.image_url && (
              <div className="h-10 w-10 rounded border overflow-hidden">
                <img src={guide.image_url} alt="预览" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => onDelete(guide.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )}
    </div>
  );
};

export const EditableCourseEnrollmentGuideComponent: React.FC<EditableCourseEnrollmentGuideComponentProps> = ({
  courseId,
  guides,
  onChange
}) => {
  const [items, setItems] = useState<CourseEnrollmentGuide[]>(guides);
  const [newGuideType, setNewGuideType] = useState<string>('wechat');
  const [newGuideTitle, setNewGuideTitle] = useState<string>('');

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setItems(guides);
  }, [guides]);

  const handleItemEdit = (id: string, updatedGuide: CourseEnrollmentGuide) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...updatedGuide } : item
    );
    setItems(updatedItems);
    onChange(updatedItems);
  };

  const handleItemDelete = (id: string) => {
    const newItems = items.filter(item => item.id !== id)
      .map((item, index) => ({ ...item, position: index }));
    
    setItems(newItems);
    onChange(newItems);
  };

  const handleAddItem = () => {
    if (!newGuideTitle.trim()) {
      toast.error("请输入标题");
      return;
    }

    const newItem: CourseEnrollmentGuide = {
      id: `temp-${Date.now()}`,
      course_id: courseId || 0,
      guide_type: newGuideType,
      title: newGuideTitle,
      content: '',
      link: '',
      image_url: '',
      position: items.length
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    onChange(newItems);
    setNewGuideType('wechat');
    setNewGuideTitle('');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(items, oldIndex, newIndex).map(
        (item, index) => ({
          ...item,
          position: index
        })
      );
      
      setItems(newItems);
      onChange(newItems);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>报名后引导</CardTitle>
        <CardDescription>添加学员报名后的联系方式和指引，双击卡片可以编辑</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <SortableContext 
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {items.map((item) => (
                <SortableGuideItem
                  key={item.id}
                  guide={item}
                  onEdit={handleItemEdit}
                  onDelete={handleItemDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        
        {items.length === 0 && (
          <div className="text-center py-8 bg-muted/30 rounded-lg text-muted-foreground">
            <p>暂无报名后引导信息，请添加</p>
          </div>
        )}
        
        <Separator className="my-4" />
        
        {/* Add new guide form */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-medium">添加新引导</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select value={newGuideType} onValueChange={setNewGuideType}>
              <SelectTrigger>
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                {availableSocialTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input 
              placeholder="输入标题" 
              value={newGuideTitle}
              onChange={(e) => setNewGuideTitle(e.target.value)}
              className="md:col-span-2"
            />
          </div>
          
          <Button onClick={handleAddItem} className="w-full">
            <PlusCircle className="h-4 w-4 mr-1" /> 添加引导
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
