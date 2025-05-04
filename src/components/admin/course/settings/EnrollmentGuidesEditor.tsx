
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, X, GripVertical, ArrowUp, ArrowDown, Trash2, Check, Edit } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useDraggableSort } from "@/hooks/useDraggableSort";
import { 
  getEnrollmentGuides, 
  addEnrollmentGuide, 
  deleteEnrollmentGuide, 
  updateEnrollmentGuide,
  updateEnrollmentGuideOrder,
  uploadGuideImage,
  EnrollmentGuide
} from "@/lib/services/courseEnrollmentGuidesService";

interface EnrollmentGuidesEditorProps {
  courseId: number;
}

// Interface for platform specific fields
interface PlatformField {
  name: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder: string;
  required: boolean;
}

// Interface for platform configuration
interface PlatformConfig {
  title: string;
  fields: PlatformField[];
  requiresImage: boolean;
}

const EnrollmentGuidesEditor: React.FC<EnrollmentGuidesEditorProps> = ({ courseId }) => {
  const [guides, setGuides] = useState<EnrollmentGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<EnrollmentGuide | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link: '',
    guide_type: 'wechat' as EnrollmentGuide['guide_type'],
    image_file: null as File | null
  });
  
  // Get platform specific fields based on type
  const getPlatformFields = (type: EnrollmentGuide['guide_type']): PlatformConfig => {
    switch (type) {
      case 'wechat':
        return {
          title: '微信群',
          fields: [
            { name: 'title', label: '标题', type: 'text', placeholder: '例如：加入官方微信群', required: true },
            { name: 'content', label: '描述', type: 'textarea', placeholder: '例如：扫描下方二维码，加入官方微信群获取课程学习支持', required: true }
          ],
          requiresImage: true
        };
      case 'whatsapp':
        return {
          title: 'WhatsApp群',
          fields: [
            { name: 'title', label: '标题', type: 'text', placeholder: '例如：加入WhatsApp讨论群', required: true },
            { name: 'content', label: '描述', type: 'textarea', placeholder: '例如：扫描二维码或点击链接加入WhatsApp群组', required: true },
            { name: 'link', label: '链接', type: 'text', placeholder: '例如：https://chat.whatsapp.com/...', required: true }
          ],
          requiresImage: true
        };
      case 'telegram':
        return {
          title: 'Telegram频道',
          fields: [
            { name: 'title', label: '标题', type: 'text', placeholder: '例如：加入Telegram频道', required: true },
            { name: 'content', label: '描述', type: 'textarea', placeholder: '例如：点击下方链接加入我们的Telegram频道获取最新消息', required: true },
            { name: 'link', label: '链接', type: 'text', placeholder: '例如：https://t.me/...', required: true }
          ],
          requiresImage: true
        };
      case 'qq':
        return {
          title: 'QQ群',
          fields: [
            { name: 'title', label: '标题', type: 'text', placeholder: '例如：加入QQ学习群', required: true },
            { name: 'content', label: '描述', type: 'textarea', placeholder: '例如：扫描二维码或搜索群号加入QQ学习群', required: true },
            { name: 'link', label: '群号', type: 'text', placeholder: '例如：123456789', required: false }
          ],
          requiresImage: true
        };
      case 'other':
        return {
          title: '其他指南',
          fields: [
            { name: 'title', label: '标题', type: 'text', placeholder: '例如：其他学习资源', required: true },
            { name: 'content', label: '描述', type: 'textarea', placeholder: '例如：通过以下方式获取更多学习资源和帮助', required: true },
            { name: 'link', label: '链接', type: 'text', placeholder: '例如：https://example.com/...', required: false }
          ],
          requiresImage: false // 修改为不要求图片
        };
      default:
        return {
          title: '其他',
          fields: [
            { name: 'title', label: '标题', type: 'text', placeholder: '输入标题', required: true },
            { name: 'content', label: '内容', type: 'textarea', placeholder: '输入内容', required: true }
          ],
          requiresImage: false
        };
    }
  };

  // Load guides when component mounts
  useEffect(() => {
    const loadGuides = async () => {
      setLoading(true);
      try {
        const { data, error } = await getEnrollmentGuides(courseId);
        if (error) {
          toast.error("加载指南失败");
        } else if (data) {
          setGuides(data);
        }
      } catch (err) {
        console.error("Error loading guides:", err);
        toast.error("加载指南时出错");
      } finally {
        setLoading(false);
      }
    };
    
    loadGuides();
  }, [courseId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle guide type selection
  const handleTypeChange = (value: EnrollmentGuide['guide_type']) => {
    setFormData({
      ...formData,
      guide_type: value
    });
  };

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData({
        ...formData,
        image_file: e.target.files[0]
      });
    }
  };

  // Open add guide dialog
  const openAddDialog = () => {
    setFormData({
      title: '',
      content: '',
      link: '',
      guide_type: 'wechat',
      image_file: null
    });
    setAddDialogOpen(true);
  };

  // Open edit guide dialog
  const openEditDialog = (guide: EnrollmentGuide) => {
    setCurrentGuide(guide);
    setFormData({
      title: guide.title,
      content: guide.content || '',
      link: guide.link || '',
      guide_type: guide.guide_type,
      image_file: null
    });
    setEditDialogOpen(true);
  };

  // Add new guide
  const handleAddGuide = async () => {
    // Get platform configuration
    const platformConfig = getPlatformFields(formData.guide_type);
    
    // Validate required fields
    const requiredFields = platformConfig.fields.filter(field => field.required);
    for (const field of requiredFields) {
      if (!formData[field.name]) {
        toast.error(`请填写${field.label}`);
        return;
      }
    }
    
    // Validate image if required
    if (platformConfig.requiresImage && !formData.image_file) {
      toast.error("请上传图片");
      return;
    }

    try {
      let imageUrl = '';
      // Upload image if selected
      if (formData.image_file) {
        const uploadResult = await uploadGuideImage(courseId, formData.image_file);
        if (uploadResult.error) {
          toast.error("图片上传失败");
          return;
        }
        imageUrl = uploadResult.data || '';
      }

      // Add guide to database
      const newGuide: Omit<EnrollmentGuide, 'id' | 'created_at' | 'updated_at'> = {
        course_id: courseId,
        title: formData.title,
        content: formData.content,
        link: formData.link || undefined,
        guide_type: formData.guide_type,
        image_url: imageUrl || undefined,
        position: guides.length
      };

      const { data, error } = await addEnrollmentGuide(newGuide);
      if (error) {
        toast.error("添加指南失败");
        return;
      }
      
      if (data) {
        setGuides([...guides, data]);
        toast.success("指南添加成功");
        setAddDialogOpen(false);
      }
    } catch (err) {
      console.error("Error adding guide:", err);
      toast.error("添加指南时出错");
    }
  };

  // Update existing guide
  const handleUpdateGuide = async () => {
    if (!currentGuide) return;
    
    // Get platform configuration
    const platformConfig = getPlatformFields(formData.guide_type);
    
    // Validate required fields
    const requiredFields = platformConfig.fields.filter(field => field.required);
    for (const field of requiredFields) {
      if (!formData[field.name]) {
        toast.error(`请填写${field.label}`);
        return;
      }
    }
    
    try {
      // Define updates object
      let updates: Partial<EnrollmentGuide> = {
        title: formData.title,
        content: formData.content,
        link: formData.link || undefined,
        guide_type: formData.guide_type
      };
      
      // Upload new image if selected
      if (formData.image_file) {
        const uploadResult = await uploadGuideImage(courseId, formData.image_file);
        if (uploadResult.error) {
          toast.error("图片上传失败");
          return;
        }
        updates.image_url = uploadResult.data || undefined;
      }

      const { data, error } = await updateEnrollmentGuide(currentGuide.id, updates);
      if (error) {
        toast.error("更新指南失败");
        return;
      }
      
      if (data) {
        setGuides(guides.map(guide => guide.id === currentGuide.id ? data : guide));
        toast.success("指南更新成功");
        setEditDialogOpen(false);
      }
    } catch (err) {
      console.error("Error updating guide:", err);
      toast.error("更新指南时出错");
    }
  };

  // Delete guide
  const handleDeleteGuide = async (id: string) => {
    if (confirm('确定要删除这个指南吗？')) {
      try {
        const { error } = await deleteEnrollmentGuide(id);
        if (error) {
          toast.error("删除指南失败");
          return;
        }
        
        setGuides(guides.filter(guide => guide.id !== id));
        toast.success("指南删除成功");
      } catch (err) {
        console.error("Error deleting guide:", err);
        toast.error("删除指南时出错");
      }
    }
  };
  
  // Handle drag-and-drop reordering
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const newGuides = Array.from(guides);
    const [reorderedItem] = newGuides.splice(result.source.index, 1);
    newGuides.splice(result.destination.index, 0, reorderedItem);
    
    // Update positions
    const updatedGuides = newGuides.map((guide, index) => ({
      ...guide,
      position: index
    }));
    
    setGuides(updatedGuides);
    
    // Save updated positions to database
    try {
      const positionUpdates = updatedGuides.map(guide => ({
        id: guide.id,
        position: guide.position
      }));
      
      await updateEnrollmentGuideOrder(positionUpdates);
    } catch (err) {
      console.error("Error updating guide positions:", err);
      toast.error("更新指南顺序时出错");
    }
  };

  // Move a guide up
  const moveGuideUp = async (index: number) => {
    if (index <= 0) return;
    
    const newGuides = [...guides];
    const temp = newGuides[index];
    newGuides[index] = newGuides[index - 1];
    newGuides[index - 1] = temp;
    
    // Update positions
    const updatedGuides = newGuides.map((guide, idx) => ({
      ...guide,
      position: idx
    }));
    
    setGuides(updatedGuides);
    
    // Save updated positions to database
    try {
      const positionUpdates = [
        { id: updatedGuides[index - 1].id, position: index - 1 },
        { id: updatedGuides[index].id, position: index }
      ];
      
      await updateEnrollmentGuideOrder(positionUpdates);
    } catch (err) {
      console.error("Error updating guide positions:", err);
      toast.error("更新指南顺序时出错");
    }
  };

  // Move a guide down
  const moveGuideDown = async (index: number) => {
    if (index >= guides.length - 1) return;
    
    const newGuides = [...guides];
    const temp = newGuides[index];
    newGuides[index] = newGuides[index + 1];
    newGuides[index + 1] = temp;
    
    // Update positions
    const updatedGuides = newGuides.map((guide, idx) => ({
      ...guide,
      position: idx
    }));
    
    setGuides(updatedGuides);
    
    // Save updated positions to database
    try {
      const positionUpdates = [
        { id: updatedGuides[index].id, position: index },
        { id: updatedGuides[index + 1].id, position: index + 1 }
      ];
      
      await updateEnrollmentGuideOrder(positionUpdates);
    } catch (err) {
      console.error("Error updating guide positions:", err);
      toast.error("更新指南顺序时出错");
    }
  };

  // Get icon for guide type
  const getGuideTypeIcon = (type: EnrollmentGuide['guide_type']) => {
    switch (type) {
      case 'wechat': return '微信';
      case 'whatsapp': return 'WhatsApp';
      case 'telegram': return 'Telegram';
      case 'qq': return 'QQ';
      default: return '其他';
    }
  };

  // Get Dialog content based on platform type
  const renderDialogContent = (isEdit = false) => {
    const platformConfig = getPlatformFields(formData.guide_type);
    
    return (
      <>
        <div className="mb-4">
          <Label>平台类型</Label>
          <Select 
            value={formData.guide_type}
            onValueChange={(value) => handleTypeChange(value as EnrollmentGuide['guide_type'])}
            disabled={isEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wechat">微信</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="qq">QQ</SelectItem>
              <SelectItem value="other">其他</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {platformConfig.fields.map((field) => (
          <div key={field.name} className="mb-4">
            <Label>{field.label}{field.required ? ' *' : ''}</Label>
            {field.type === 'textarea' ? (
              <Textarea
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                className="mt-1"
              />
            ) : (
              <Input
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                className="mt-1"
              />
            )}
          </div>
        ))}
        
        <div className="mb-4">
          <Label>{platformConfig.requiresImage ? '图片 *' : '图片'}</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1"
          />
          {isEdit && !formData.image_file && currentGuide?.image_url && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">当前已有图片。如需更改，请选择新的图片。</p>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">课程购买成功指南</h3>
        <Button onClick={openAddDialog} className="flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          添加指南
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : guides.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-500">暂无购买成功指南</p>
          <Button onClick={openAddDialog} className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            添加第一个指南
          </Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="guides">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {guides.map((guide, index) => (
                  <Draggable key={guide.id} draggableId={guide.id} index={index}>
                    {(provided) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="mb-4"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex flex-1 items-start">
                              <div
                                {...provided.dragHandleProps}
                                className="mr-3 cursor-grab"
                              >
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center mb-1">
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2 py-0.5 rounded">
                                    {getGuideTypeIcon(guide.guide_type)}
                                  </span>
                                  <h4 className="text-base font-medium">{guide.title}</h4>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{guide.content}</p>
                                {guide.link && (
                                  <a 
                                    href={guide.link}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                                  >
                                    {guide.link}
                                  </a>
                                )}
                                {guide.image_url && (
                                  <div className="mt-2">
                                    <img 
                                      src={guide.image_url} 
                                      alt={guide.title} 
                                      className="h-16 w-16 object-cover rounded" 
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex ml-4">
                              <button
                                onClick={() => moveGuideUp(index)}
                                disabled={index === 0}
                                className={`p-1 ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:text-blue-600'}`}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => moveGuideDown(index)}
                                disabled={index === guides.length - 1}
                                className={`p-1 ${index === guides.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:text-blue-600'}`}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openEditDialog(guide)}
                                className="p-1 text-gray-500 hover:text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteGuide(guide.id)}
                                className="p-1 text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Add Guide Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加指南</DialogTitle>
          </DialogHeader>
          {renderDialogContent()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>取消</Button>
            <Button onClick={handleAddGuide}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Guide Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑指南</DialogTitle>
          </DialogHeader>
          {renderDialogContent(true)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>取消</Button>
            <Button onClick={handleUpdateGuide}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnrollmentGuidesEditor;
