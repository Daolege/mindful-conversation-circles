
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, GripVertical, Upload, Link } from "lucide-react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  EnrollmentGuide, 
  getEnrollmentGuides,
  addEnrollmentGuide,
  updateEnrollmentGuide,
  deleteEnrollmentGuide,
  updateEnrollmentGuideOrder,
  uploadGuideImage
} from '@/lib/services/courseEnrollmentGuidesService';
import { cn } from "@/lib/utils";

interface EnrollmentGuidesEditorProps {
  courseId: number;
  title?: string;
}

// Social media platform options
const platformOptions = [
  { value: 'wechat', label: '微信' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'qq', label: 'QQ' },
  { value: 'other', label: '其他' }
];

// Platform icons
const getPlatformIcon = (type: string) => {
  switch (type) {
    case 'wechat': return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm6.028 2.694c-1.684-.019-3.325.506-4.568 1.555-1.453 1.218-2.247 3.055-1.725 5.448.///059.272-.179.544-.208.816-.02.163-.028.327-.028.49 0 3.45 3.903 6.25 7.168 6.25.873 0 1.715-.13 2.487-.366a.59.59 0 0 1 .49.086l1.659.974c.059.039.128.059.198.059a.287.287 0 0 0 .287-.295c0-.073-.029-.145-.048-.213l-.338-1.293a.54.54 0 0 1 .185-.582c1.618-1.248 2.637-3.006 2.637-4.97 0-3.381-3.299-6.153-7.403-6.25-.258-.005-.517-.005-.793-.01zm-2.677 3.073a1.02 1.02 0 0 1 1.018 1.022 1.02 1.02 0 0 1-1.018 1.021 1.02 1.02 0 0 1-1.017-1.021c0-.564.455-1.022 1.017-1.022zm5.384 0a1.02 1.02 0 0 1 1.017 1.022 1.02 1.02 0 0 1-1.017 1.021 1.02 1.02 0 0 1-1.018-1.021c0-.564.455-1.022 1.018-1.022z"/></svg>;
    case 'whatsapp': return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M17.415 14.382c-.298-.149-1.759-.867-2.031-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0011.992 0C5.438 0 .102 5.335.1 11.892c-.001 2.096.546 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.892-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
    case 'telegram': return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;
    case 'qq': return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21.395 15.035a39.548 39.548 0 0 0-.803-2.264l-.841-2.265c.016-.297.025-.594.025-.89C19.776 4.32 16.212.788 11.87.788c-4.342 0-7.905 3.532-7.905 7.827 0 .296.01.593.024.89l-.84 2.264c-.271.73-.542 1.495-.803 2.264-.904 2.628-.669 3.7-.426 3.724.548.05 2.12-2.035 2.12-2.035 0 1.237.645 2.85 1.85 4.008-.486.159-1.058.358-1.44.575-1.371.773-.467 1.596-.033 1.684 1.436.29 2.805-.477 3.578-1.122a5.49 5.49 0 0 0 1.496-.995c.12.004.239.004.358.004.12 0 .238 0 .358-.004a5.49 5.49 0 0 0 1.496.995c.773.645 2.142 1.413 3.578 1.122.434-.087 1.338-.91-.034-1.684-.381-.217-.953-.416-1.439-.575 1.205-1.158 1.85-2.771 1.85-4.008 0 0 1.572 2.085 2.12 2.035.243-.023.478-1.096-.426-3.724"/></svg>;
    default: return <Link className="h-4 w-4" />;
  }
};

// Get required fields for each platform type
const getPlatformFields = (type: string) => {
  const fields = {
    title: true,
    content: true,
    link: false,
    image: false
  };

  switch (type) {
    case 'wechat':
      fields.image = true;
      break;
    case 'whatsapp':
      fields.link = true;
      break;
    case 'telegram':
      fields.link = true;
      fields.image = true;
      break;
    case 'qq':
      fields.link = true;
      fields.image = true;
      break;
    case 'other':
      fields.link = true;
      fields.image = true; // Image is still included but not required
      break;
  }

  return fields;
};

// Image Upload Component
const ImageUploader: React.FC<{
  imageUrl?: string;
  onChange: (url: string) => void;
  courseId: number;
  required?: boolean;
}> = ({ imageUrl, onChange, courseId, required = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('图片大小不能超过2MB');
      return;
    }
    
    setIsUploading(true);
    try {
      const { data, error } = await uploadGuideImage(courseId, file);
      if (error) {
        toast.error('上传图片失败');
        console.error('Upload error:', error);
        return;
      }
      
      if (data) {
        onChange(data);
        toast.success('图片上传成功');
      }
    } catch (error) {
      toast.error('上传图片时出错');
      console.error('Upload exception:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">
        二维码/图片 {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="flex flex-col space-y-2">
        {imageUrl && (
          <div className="relative w-32 h-32 border rounded-md overflow-hidden bg-gray-50">
            <img 
              src={imageUrl}
              alt="QR Code"
              className="w-full h-full object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => onChange('')}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        <div className="flex items-center">
          <label className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-md hover:bg-blue-100 transition-colors">
              <Upload className="h-4 w-4" />
              <span>{imageUrl ? '更换图片' : '上传图片'}</span>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          {isUploading && <span className="ml-2 text-sm text-gray-500">上传中...</span>}
        </div>
      </div>
    </div>
  );
};

// Sortable Item Component
const SortableGuideItem: React.FC<{
  id: string;
  item: EnrollmentGuide;
  courseId: number;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<EnrollmentGuide>) => void;
}> = ({ id, item, courseId, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content);
  const [link, setLink] = useState(item.link || '');
  const [imageUrl, setImageUrl] = useState(item.image_url || '');
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (title.trim() === '') {
      setTitle(item.title);
      toast.error('标题不能为空');
      return;
    }
    
    const fields = getPlatformFields(item.guide_type);
    
    // Check required fields
    if (fields.image && item.guide_type === 'wechat' && !imageUrl) {
      toast.error('微信联系方式需要上传图片');
      return;
    }
    
    const updates: Partial<EnrollmentGuide> = {
      title,
      content,
      link: fields.link ? link : undefined,
      image_url: fields.image ? imageUrl : undefined
    };
    
    onUpdate(id, updates);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleBlur();
    } else if (e.key === 'Escape') {
      setTitle(item.title);
      setContent(item.content);
      setLink(item.link || '');
      setImageUrl(item.image_url || '');
      setIsEditing(false);
    }
  };

  const fields = getPlatformFields(item.guide_type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="border rounded-lg p-4 mb-4 bg-white group"
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          {...listeners}
          className="cursor-grab p-2 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
          {getPlatformIcon(item.guide_type)}
          <span>{platformOptions.find(p => p.value === item.guide_type)?.label || '其他'}</span>
        </div>
        
        <div className="flex-grow"></div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <div className="space-y-4" onKeyDown={handleKeyDown}>
            <div>
              <Label htmlFor={`title-${id}`}>标题 <span className="text-red-500">*</span></Label>
              <Input
                id={`title-${id}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor={`content-${id}`}>内容</Label>
              <Textarea
                id={`content-${id}`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            
            {fields.link && (
              <div>
                <Label htmlFor={`link-${id}`}>
                  链接 {item.guide_type === 'whatsapp' && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id={`link-${id}`}
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="mt-1"
                  placeholder={
                    item.guide_type === 'whatsapp' ? "https://wa.me/123456789" : 
                    item.guide_type === 'telegram' ? "https://t.me/username" :
                    item.guide_type === 'qq' ? "QQ号/群号" : "https://"
                  }
                />
              </div>
            )}
            
            {fields.image && (
              <ImageUploader
                imageUrl={imageUrl}
                onChange={setImageUrl}
                courseId={courseId}
                required={item.guide_type === 'wechat'}
              />
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTitle(item.title);
                  setContent(item.content);
                  setLink(item.link || '');
                  setImageUrl(item.image_url || '');
                  setIsEditing(false);
                }}
              >
                取消
              </Button>
              <Button onClick={handleBlur}>保存</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 cursor-pointer">
            <div>
              <h4 className="font-medium text-lg">{title}</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{content}</p>
            </div>
            
            {fields.link && link && (
              <div className="flex items-center gap-2 text-blue-600">
                <Link className="h-4 w-4" />
                <span className="text-sm truncate">{link}</span>
              </div>
            )}
            
            {fields.image && imageUrl && (
              <div className="w-20 h-20 border rounded overflow-hidden bg-gray-50">
                <img 
                  src={imageUrl}
                  alt="QR Code/Image"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const EnrollmentGuidesEditor: React.FC<EnrollmentGuidesEditorProps> = ({
  courseId,
  title = "购买后引导页面"
}) => {
  const [guides, setGuides] = useState<EnrollmentGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New guide state
  const [newPlatform, setNewPlatform] = useState<string>('wechat');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load guides on component mount
  useEffect(() => {
    if (!courseId) return;
    
    const loadGuides = async () => {
      setIsLoading(true);
      const { data, error } = await getEnrollmentGuides(courseId);
      
      if (error) {
        toast.error('加载引导页面数据失败');
        console.error('Error loading guides:', error);
      } else if (data) {
        setGuides(data);
      }
      
      setIsLoading(false);
    };
    
    loadGuides();
  }, [courseId]);

  // Add new guide
  const handleAddGuide = async () => {
    // Validate required fields
    if (!newTitle.trim()) {
      toast.error('请输入标题');
      return;
    }
    
    const fields = getPlatformFields(newPlatform);
    
    // Check link for WhatsApp
    if (newPlatform === 'whatsapp' && !newLink.trim()) {
      toast.error('请输入WhatsApp链接');
      return;
    }
    
    // Check image for WeChat - only WeChat requires image
    if (newPlatform === 'wechat' && !newImageUrl) {
      toast.error('请上传微信二维码图片');
      return;
    }
    
    const newGuide: Omit<EnrollmentGuide, 'id' | 'created_at' | 'updated_at'> = {
      course_id: courseId,
      title: newTitle.trim(),
      content: newContent.trim(),
      guide_type: newPlatform as any,
      position: guides.length,
    };
    
    // Add optional fields if needed
    if (fields.link && newLink.trim()) {
      newGuide.link = newLink.trim();
    }
    
    if (fields.image && newImageUrl) {
      newGuide.image_url = newImageUrl;
    }
    
    const { data, error } = await addEnrollmentGuide(newGuide);
    
    if (error) {
      toast.error('添加引导项失败');
      console.error('Error adding guide:', error);
      return;
    }
    
    if (data) {
      setGuides([...guides, data]);
      toast.success('添加引导项成功');
      
      // Reset form
      setNewTitle('');
      setNewContent('');
      setNewLink('');
      setNewImageUrl('');
      setIsAddingNew(false);
    }
  };

  // Update guide
  const handleUpdateGuide = async (id: string, updates: Partial<EnrollmentGuide>) => {
    const { error } = await updateEnrollmentGuide(id, updates);
    
    if (error) {
      toast.error('更新引导项失败');
      console.error('Error updating guide:', error);
      return;
    }
    
    setGuides(guides.map(guide => {
      if (guide.id === id) {
        return { ...guide, ...updates };
      }
      return guide;
    }));
    
    toast.success('更新引导项成功');
  };

  // Delete guide
  const handleDeleteGuide = async (id: string) => {
    const { error } = await deleteEnrollmentGuide(id);
    
    if (error) {
      toast.error('删除引导项失败');
      console.error('Error deleting guide:', error);
      return;
    }
    
    const updatedGuides = guides.filter(guide => guide.id !== id);
    // Update positions
    const reorderedGuides = updatedGuides.map((guide, index) => ({
      ...guide,
      position: index
    }));
    
    setGuides(reorderedGuides);
    
    // Update positions in database
    await updateEnrollmentGuideOrder(
      reorderedGuides.map(guide => ({
        id: guide.id,
        position: guide.position
      }))
    );
    
    toast.success('删除引导项成功');
  };

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = guides.findIndex(guide => guide.id === active.id);
      const newIndex = guides.findIndex(guide => guide.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newGuides = [...guides];
        const [removed] = newGuides.splice(oldIndex, 1);
        newGuides.splice(newIndex, 0, removed);
        
        // Update positions
        const reorderedGuides = newGuides.map((guide, index) => ({
          ...guide,
          position: index
        }));
        
        setGuides(reorderedGuides);
        
        // Update positions in database
        const { error } = await updateEnrollmentGuideOrder(
          reorderedGuides.map(guide => ({
            id: guide.id,
            position: guide.position
          }))
        );
        
        if (error) {
          toast.error('更新排序失败');
          console.error('Error updating guide order:', error);
        }
      }
    }
  };

  const renderPlatformFields = () => {
    const fields = getPlatformFields(newPlatform);
    
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="new-title">标题 <span className="text-red-500">*</span></Label>
          <Input
            id="new-title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="输入标题"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="new-content">内容</Label>
          <Textarea
            id="new-content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="输入描述内容"
            className="mt-1"
            rows={3}
          />
        </div>
        
        {fields.link && (
          <div>
            <Label htmlFor="new-link">
              链接 {newPlatform === 'whatsapp' && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="new-link"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              placeholder={
                newPlatform === 'whatsapp' ? "https://wa.me/123456789" : 
                newPlatform === 'telegram' ? "https://t.me/username" :
                newPlatform === 'qq' ? "QQ号/群号" : "https://"
              }
              className="mt-1"
            />
          </div>
        )}
        
        {fields.image && (
          <ImageUploader
            imageUrl={newImageUrl}
            onChange={setNewImageUrl}
            courseId={courseId}
            required={newPlatform === 'wechat'}
          />
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>加载中...</span>
          </div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext 
                items={guides.map(guide => guide.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div>
                  {guides.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 border border-gray-100 rounded-lg">
                      还没有添加引导项，点击下方按钮添加
                    </div>
                  ) : (
                    guides.map((guide) => (
                      <SortableGuideItem
                        key={guide.id}
                        id={guide.id}
                        item={guide}
                        courseId={courseId}
                        onDelete={handleDeleteGuide}
                        onUpdate={handleUpdateGuide}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
            
            {isAddingNew ? (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-4">添加新引导项</h4>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="platform-type">平台类型</Label>
                    <Select
                      value={newPlatform}
                      onValueChange={setNewPlatform}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="选择平台类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {platformOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              {getPlatformIcon(option.value)}
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {renderPlatformFields()}
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingNew(false);
                        setNewTitle('');
                        setNewContent('');
                        setNewLink('');
                        setNewImageUrl('');
                      }}
                    >
                      取消
                    </Button>
                    <Button onClick={handleAddGuide}>保存</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingNew(true)}
                  className="w-full flex items-center justify-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  添加引导项
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EnrollmentGuidesEditor;
