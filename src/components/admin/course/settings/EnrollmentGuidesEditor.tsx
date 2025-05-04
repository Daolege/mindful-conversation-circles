
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { MessageCircle, Trash2, UploadCloud, PlusCircle } from 'lucide-react';
import IconDisplay from '@/components/course-detail/IconDisplay';
import {
  EnrollmentGuide,
  getEnrollmentGuides,
  addEnrollmentGuide,
  updateEnrollmentGuide,
  deleteEnrollmentGuide,
  updateGuidesOrder,
  uploadGuideImage,
  validateGuideByType,
  PLATFORM_TYPES
} from '@/lib/services/enrollmentGuidesService';

interface EnrollmentGuidesEditorProps {
  courseId: number;
}

export const EnrollmentGuidesEditor: React.FC<EnrollmentGuidesEditorProps> = ({ courseId }) => {
  const [guides, setGuides] = useState<EnrollmentGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingGuide, setEditingGuide] = useState<EnrollmentGuide | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  
  // Used for creating a new guide
  const [newGuide, setNewGuide] = useState<EnrollmentGuide>({
    course_id: courseId,
    title: '',
    content: '',
    guide_type: 'wechat',
    position: 0,
  });

  // Load guides when component mounts or courseId changes
  useEffect(() => {
    loadGuides();
  }, [courseId]);

  const loadGuides = async () => {
    setLoading(true);
    const { data, error } = await getEnrollmentGuides(courseId);
    
    if (error) {
      toast.error('加载报名后引导信息失败');
    } else if (data) {
      setGuides(data);
    }
    
    setLoading(false);
  };

  // Reset the form for adding a new guide
  const resetNewGuideForm = () => {
    setNewGuide({
      course_id: courseId,
      title: '',
      content: '',
      guide_type: 'wechat',
      position: guides.length,
    });
  };

  // Handle adding a new guide
  const handleAddGuide = async () => {
    const validationError = validateGuideByType(newGuide);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    
    const { data, error } = await addEnrollmentGuide(newGuide);
    
    if (error) {
      toast.error('添加报名后引导失败');
    } else {
      toast.success('成功添加报名后引导');
      setGuides([...guides, data]);
      resetNewGuideForm();
      setIsAdding(false);
    }
    
    setSaving(false);
  };

  // Handle updating a guide
  const handleUpdateGuide = async () => {
    if (!editingGuide || !editingGuide.id) return;
    
    const validationError = validateGuideByType(editingGuide);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    
    const { data, error } = await updateEnrollmentGuide(editingGuide.id, editingGuide);
    
    if (error) {
      toast.error('更新报名后引导失败');
    } else {
      toast.success('成功更新报名后引导');
      setGuides(guides.map(guide => guide.id === editingGuide.id ? data : guide));
      setEditingGuide(null);
      setIsEditing(false);
    }
    
    setSaving(false);
  };

  // Handle deleting a guide
  const handleDeleteGuide = async (id: string) => {
    if (!window.confirm('确认要删除此引导信息吗？')) {
      return;
    }
    
    setSaving(true);
    
    const { success, error } = await deleteEnrollmentGuide(id);
    
    if (error) {
      toast.error('删除报名后引导失败');
    } else if (success) {
      toast.success('成功删除报名后引导');
      setGuides(guides.filter(guide => guide.id !== id));
      
      // Update positions for remaining guides
      const updatedGuides = guides
        .filter(guide => guide.id !== id)
        .map((guide, index) => ({
          ...guide,
          position: index
        }));
      
      setGuides(updatedGuides);
      
      // Update positions in the database
      await updateGuidesOrder(
        updatedGuides.map((guide, index) => ({
          id: guide.id!,
          position: index
        }))
      );
    }
    
    setSaving(false);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isForNewGuide: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setFileUploading(true);
    
    const file = files[0];
    const { url, error } = await uploadGuideImage(courseId, file);
    
    if (error) {
      toast.error('上传图片失败');
    } else if (url) {
      if (isForNewGuide) {
        setNewGuide({
          ...newGuide,
          image_url: url
        });
      } else if (editingGuide) {
        setEditingGuide({
          ...editingGuide,
          image_url: url
        });
      }
      toast.success('成功上传图片');
    }
    
    setFileUploading(false);
  };

  // Render form fields based on platform type
  const renderPlatformFields = (guide: EnrollmentGuide, isForNewGuide: boolean) => {
    const updateField = (field: string, value: any) => {
      if (isForNewGuide) {
        setNewGuide({
          ...newGuide,
          [field]: value
        });
      } else if (editingGuide) {
        setEditingGuide({
          ...editingGuide,
          [field]: value
        });
      }
    };

    switch(guide.guide_type) {
      case 'wechat':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-title' : 'edit-title'}>微信群标题 *</Label>
              <Input
                id={isForNewGuide ? 'new-title' : 'edit-title'}
                value={guide.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="例如：2025年春季课程群"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-content' : 'edit-content'}>添加说明</Label>
              <Textarea
                id={isForNewGuide ? 'new-content' : 'edit-content'}
                value={guide.content || ''}
                onChange={(e) => updateField('content', e.target.value)}
                placeholder="例如：进群请备注报名课程"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>微信群二维码 *</Label>
              {guide.image_url ? (
                <div className="relative w-full">
                  <img
                    src={guide.image_url}
                    alt="微信群二维码"
                    className="h-40 object-contain border rounded-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => updateField('image_url', '')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center border border-dashed rounded-md p-4 cursor-pointer hover:bg-slate-50">
                  <Label htmlFor={isForNewGuide ? 'new-image' : 'edit-image'} className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <UploadCloud className="h-8 w-8 text-slate-400" />
                      <span className="mt-2 text-sm text-slate-600">点击上传二维码图片</span>
                    </div>
                  </Label>
                  <Input
                    id={isForNewGuide ? 'new-image' : 'edit-image'}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, isForNewGuide)}
                    disabled={fileUploading}
                  />
                </div>
              )}
            </div>
          </>
        );
        
      case 'whatsapp':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-title' : 'edit-title'}>WhatsApp群标题 *</Label>
              <Input
                id={isForNewGuide ? 'new-title' : 'edit-title'}
                value={guide.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="例如：2025年春季课程WhatsApp群"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-link' : 'edit-link'}>WhatsApp群链接</Label>
              <Input
                id={isForNewGuide ? 'new-link' : 'edit-link'}
                value={guide.link || ''}
                onChange={(e) => updateField('link', e.target.value)}
                placeholder="例如：https://chat.whatsapp.com/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-content' : 'edit-content'}>添加说明</Label>
              <Textarea
                id={isForNewGuide ? 'new-content' : 'edit-content'}
                value={guide.content || ''}
                onChange={(e) => updateField('content', e.target.value)}
                placeholder="例如：点击链接或扫描二维码加入群组"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>WhatsApp群二维码（可选）</Label>
              {guide.image_url ? (
                <div className="relative w-full">
                  <img
                    src={guide.image_url}
                    alt="WhatsApp群二维码"
                    className="h-40 object-contain border rounded-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => updateField('image_url', '')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center border border-dashed rounded-md p-4 cursor-pointer hover:bg-slate-50">
                  <Label htmlFor={isForNewGuide ? 'new-image' : 'edit-image'} className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <UploadCloud className="h-8 w-8 text-slate-400" />
                      <span className="mt-2 text-sm text-slate-600">点击上传二维码图片</span>
                    </div>
                  </Label>
                  <Input
                    id={isForNewGuide ? 'new-image' : 'edit-image'}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, isForNewGuide)}
                    disabled={fileUploading}
                  />
                </div>
              )}
            </div>
          </>
        );
        
      case 'qq':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-title' : 'edit-title'}>QQ群标题 *</Label>
              <Input
                id={isForNewGuide ? 'new-title' : 'edit-title'}
                value={guide.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="例如：2025年春季课程QQ群"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-content' : 'edit-content'}>QQ群号</Label>
              <Input
                id={isForNewGuide ? 'new-content' : 'edit-content'}
                value={guide.content || ''}
                onChange={(e) => updateField('content', e.target.value)}
                placeholder="例如：123456789"
              />
            </div>
            
            <div className="space-y-2">
              <Label>QQ群二维码（可选）</Label>
              {guide.image_url ? (
                <div className="relative w-full">
                  <img
                    src={guide.image_url}
                    alt="QQ群二维码"
                    className="h-40 object-contain border rounded-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => updateField('image_url', '')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center border border-dashed rounded-md p-4 cursor-pointer hover:bg-slate-50">
                  <Label htmlFor={isForNewGuide ? 'new-image' : 'edit-image'} className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <UploadCloud className="h-8 w-8 text-slate-400" />
                      <span className="mt-2 text-sm text-slate-600">点击上传二维码图片</span>
                    </div>
                  </Label>
                  <Input
                    id={isForNewGuide ? 'new-image' : 'edit-image'}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, isForNewGuide)}
                    disabled={fileUploading}
                  />
                </div>
              )}
            </div>
          </>
        );
        
      case 'telegram':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-title' : 'edit-title'}>Telegram群标题 *</Label>
              <Input
                id={isForNewGuide ? 'new-title' : 'edit-title'}
                value={guide.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="例如：2025年春季课程Telegram群"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-link' : 'edit-link'}>Telegram群链接 *</Label>
              <Input
                id={isForNewGuide ? 'new-link' : 'edit-link'}
                value={guide.link || ''}
                onChange={(e) => updateField('link', e.target.value)}
                placeholder="例如：https://t.me/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-content' : 'edit-content'}>添加说明</Label>
              <Textarea
                id={isForNewGuide ? 'new-content' : 'edit-content'}
                value={guide.content || ''}
                onChange={(e) => updateField('content', e.target.value)}
                placeholder="例如：点击链接加入Telegram群组"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Telegram群二维码（可选）</Label>
              {guide.image_url ? (
                <div className="relative w-full">
                  <img
                    src={guide.image_url}
                    alt="Telegram群二维码"
                    className="h-40 object-contain border rounded-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => updateField('image_url', '')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center border border-dashed rounded-md p-4 cursor-pointer hover:bg-slate-50">
                  <Label htmlFor={isForNewGuide ? 'new-image' : 'edit-image'} className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <UploadCloud className="h-8 w-8 text-slate-400" />
                      <span className="mt-2 text-sm text-slate-600">点击上传二维码图片</span>
                    </div>
                  </Label>
                  <Input
                    id={isForNewGuide ? 'new-image' : 'edit-image'}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, isForNewGuide)}
                    disabled={fileUploading}
                  />
                </div>
              )}
            </div>
          </>
        );
        
      case 'discord':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-title' : 'edit-title'}>Discord服务器标题 *</Label>
              <Input
                id={isForNewGuide ? 'new-title' : 'edit-title'}
                value={guide.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="例如：2025年春季课程Discord服务器"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-link' : 'edit-link'}>Discord邀请链接 *</Label>
              <Input
                id={isForNewGuide ? 'new-link' : 'edit-link'}
                value={guide.link || ''}
                onChange={(e) => updateField('link', e.target.value)}
                placeholder="例如：https://discord.gg/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-content' : 'edit-content'}>添加说明</Label>
              <Textarea
                id={isForNewGuide ? 'new-content' : 'edit-content'}
                value={guide.content || ''}
                onChange={(e) => updateField('content', e.target.value)}
                placeholder="例如：点击链接加入Discord服务器"
                rows={3}
              />
            </div>
          </>
        );
        
      case 'custom':
      default:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-title' : 'edit-title'}>标题 *</Label>
              <Input
                id={isForNewGuide ? 'new-title' : 'edit-title'}
                value={guide.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="输入标题"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-link' : 'edit-link'}>链接</Label>
              <Input
                id={isForNewGuide ? 'new-link' : 'edit-link'}
                value={guide.link || ''}
                onChange={(e) => updateField('link', e.target.value)}
                placeholder="例如：https://example.com/..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={isForNewGuide ? 'new-content' : 'edit-content'}>内容</Label>
              <Textarea
                id={isForNewGuide ? 'new-content' : 'edit-content'}
                value={guide.content || ''}
                onChange={(e) => updateField('content', e.target.value)}
                placeholder="添加说明内容"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>图片（可选）</Label>
              {guide.image_url ? (
                <div className="relative w-full">
                  <img
                    src={guide.image_url}
                    alt="图片"
                    className="h-40 object-contain border rounded-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => updateField('image_url', '')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center border border-dashed rounded-md p-4 cursor-pointer hover:bg-slate-50">
                  <Label htmlFor={isForNewGuide ? 'new-image' : 'edit-image'} className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <UploadCloud className="h-8 w-8 text-slate-400" />
                      <span className="mt-2 text-sm text-slate-600">点击上传图片</span>
                    </div>
                  </Label>
                  <Input
                    id={isForNewGuide ? 'new-image' : 'edit-image'}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, isForNewGuide)}
                    disabled={fileUploading}
                  />
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">报名后引导设置</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-sm text-slate-500">正在加载报名后引导信息...</p>
          ) : (
            <>
              {guides.length > 0 ? (
                <div className="space-y-4">
                  {guides.map((guide) => (
                    <div key={guide.id} className="border rounded-md p-4 bg-white">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-slate-100 rounded-md">
                            <IconDisplay iconName={PLATFORM_TYPES.find(type => type.value === guide.guide_type)?.icon || 'message-circle'} size={16} />
                          </div>
                          <h3 className="font-medium">{guide.title}</h3>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingGuide(guide);
                              setIsEditing(true);
                            }}
                          >
                            编辑
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => guide.id && handleDeleteGuide(guide.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </div>
                      
                      {guide.image_url && (
                        <div className="mt-2">
                          <img
                            src={guide.image_url}
                            alt={guide.title}
                            className="h-20 object-contain"
                          />
                        </div>
                      )}
                      
                      {guide.content && (
                        <p className="text-sm text-slate-600 mt-2">{guide.content}</p>
                      )}
                      
                      {guide.link && (
                        <div className="mt-2">
                          <a
                            href={guide.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {guide.link}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-slate-500 py-6 border border-dashed rounded-md">
                  暂无报名后引导信息，点击"添加引导"按钮添加
                </div>
              )}

              {/* Add New Guide Button */}
              {!isAdding && !isEditing && (
                <Button
                  type="button"
                  onClick={() => {
                    resetNewGuideForm();
                    setIsAdding(true);
                  }}
                  className="w-full"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  添加引导
                </Button>
              )}

              {/* Add New Guide Form */}
              {isAdding && (
                <Card className="border border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">添加新引导</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-guide-type">选择平台类型 *</Label>
                        <Select
                          value={newGuide.guide_type}
                          onValueChange={(value) => {
                            setNewGuide({
                              ...newGuide,
                              guide_type: value,
                              image_url: '',
                              link: '',
                              content: ''
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择平台类型" />
                          </SelectTrigger>
                          <SelectContent>
                            {PLATFORM_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <IconDisplay iconName={type.icon} size={16} />
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {renderPlatformFields(newGuide, true)}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAdding(false)}
                    >
                      取消
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddGuide}
                      disabled={saving || fileUploading}
                    >
                      {saving ? '添加中...' : '添加引导'}
                    </Button>
                  </CardFooter>
                </Card>
              )}

              {/* Edit Guide Form */}
              {isEditing && editingGuide && (
                <Card className="border border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">编辑引导</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-guide-type">选择平台类型 *</Label>
                        <Select
                          value={editingGuide.guide_type}
                          onValueChange={(value) => {
                            setEditingGuide({
                              ...editingGuide,
                              guide_type: value,
                              // We don't reset fields here to preserve data
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择平台类型" />
                          </SelectTrigger>
                          <SelectContent>
                            {PLATFORM_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <IconDisplay iconName={type.icon} size={16} />
                                  <span>{type.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {renderPlatformFields(editingGuide, false)}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingGuide(null);
                        setIsEditing(false);
                      }}
                    >
                      取消
                    </Button>
                    <Button
                      type="button"
                      onClick={handleUpdateGuide}
                      disabled={saving || fileUploading}
                    >
                      {saving ? '保存中...' : '保存更改'}
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnrollmentGuidesEditor;
