
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Trash2, ArrowUp, ArrowDown, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { CornerDownRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Define interfaces for our components
export interface CourseHighlight {
  id: string;
  course_id: number;
  icon: string;
  content: string;
  position: number;
  is_visible: boolean;
}

interface EditableCourseHighlightsComponentProps {
  courseId?: number;
  highlights: CourseHighlight[];
  onChange: (newItems: CourseHighlight[]) => void;
  lectureCount?: number;
  courseLanguage?: string;
}

// Available icons for selection
const availableIcons = [
  { name: 'video', label: '视频' },
  { name: 'clock', label: '时钟' },
  { name: 'book-open', label: '书本' },
  { name: 'globe', label: '地球' },
  { name: 'refresh', label: '刷新' },
  { name: 'users', label: '用户' },
  { name: 'file', label: '文件' },
];

export const EditableCourseHighlightsComponent: React.FC<EditableCourseHighlightsComponentProps> = ({
  courseId,
  highlights,
  onChange,
  lectureCount = 0,
  courseLanguage = '中文'
}) => {
  const [items, setItems] = useState<CourseHighlight[]>(highlights);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItemIcon, setNewItemIcon] = useState<string>('video');
  const [newItemContent, setNewItemContent] = useState<string>('');

  useEffect(() => {
    setItems(highlights);
  }, [highlights]);

  // Process dynamic content for display
  const processDisplayContent = (content: string): string => {
    if (content.includes('XX个精选章节')) {
      return content.replace('XX', lectureCount.toString());
    } else if (content.includes('课程语言')) {
      return content.replace('中文', courseLanguage);
    }
    return content;
  };

  const handleItemEdit = (id: string, icon: string, content: string) => {
    setItems(prevItems => prevItems.map(item => 
      item.id === id ? { ...item, icon, content } : item
    ));
    setEditingItemId(null);
    onChange(items.map(item => item.id === id ? { ...item, icon, content } : item));
  };

  const handleItemMove = (id: string, direction: 'up' | 'down') => {
    const index = items.findIndex(item => item.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === items.length - 1)
    ) return;
    
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap positions
    [newItems[index].position, newItems[targetIndex].position] = 
    [newItems[targetIndex].position, newItems[index].position];
    
    // Swap items in array
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    setItems(newItems);
    onChange(newItems);
  };

  const handleItemDelete = (id: string) => {
    const newItems = items.filter(item => item.id !== id)
      .map((item, index) => ({ ...item, position: index }));
    
    setItems(newItems);
    onChange(newItems);
  };

  const handleAddItem = () => {
    if (!newItemContent.trim()) {
      toast.error("请输入亮点内容");
      return;
    }

    const newItem: CourseHighlight = {
      id: `temp-${Date.now()}`,
      course_id: courseId || 0,
      icon: newItemIcon,
      content: newItemContent,
      position: items.length,
      is_visible: true
    };

    const newItems = [...items, newItem];
    setItems(newItems);
    onChange(newItems);
    setNewItemIcon('video');
    setNewItemContent('');
  };

  const handleResetToDefault = async () => {
    if (!courseId) return;
    
    try {
      const { data, error } = await supabase
        .rpc('reset_course_highlights', { p_course_id: courseId });
        
      if (error) throw error;
      
      // Reload highlights after reset
      const { data: newHighlights, error: loadError } = await supabase
        .from('course_highlights')
        .select('*')
        .eq('course_id', courseId)
        .order('position');
        
      if (loadError) throw loadError;
      
      if (newHighlights) {
        setItems(newHighlights);
        onChange(newHighlights);
        toast.success("课程亮点已重置为默认值");
      }
    } catch (error) {
      console.error("重置课程亮点失败:", error);
      toast.error("重置课程亮点失败");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          课程亮点
          {courseId && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleResetToDefault}
            >
              重置为默认
            </Button>
          )}
        </CardTitle>
        <CardDescription>添加并管理课程亮点，突出课程特色</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="bg-muted/40 rounded-lg p-3">
              {editingItemId === item.id ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Select 
                      defaultValue={item.icon}
                      onValueChange={(value) => {
                        const updatedItems = items.map(i => 
                          i.id === item.id ? { ...i, icon: value } : i
                        );
                        setItems(updatedItems);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="选择图标" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableIcons.map((icon) => (
                          <SelectItem key={icon.name} value={icon.name}>
                            {icon.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input 
                      defaultValue={item.content}
                      placeholder="亮点内容" 
                      onChange={(e) => {
                        const updatedItems = items.map(i => 
                          i.id === item.id ? { ...i, content: e.target.value } : i
                        );
                        setItems(updatedItems);
                      }}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setEditingItemId(null)}
                    >
                      <X className="h-4 w-4 mr-1" /> 取消
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleItemEdit(
                        item.id, 
                        items.find(i => i.id === item.id)?.icon || item.icon,
                        items.find(i => i.id === item.id)?.content || item.content
                      )}
                    >
                      <Save className="h-4 w-4 mr-1" /> 保存
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CornerDownRight className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="font-medium">{processDisplayContent(item.content)}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({item.icon})</span>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleItemMove(item.id, 'up')}
                      disabled={items.indexOf(item) === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleItemMove(item.id, 'down')}
                      disabled={items.indexOf(item) === items.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setEditingItemId(item.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleItemDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Add new highlight form */}
        <div className="flex gap-2 pt-2">
          <Select value={newItemIcon} onValueChange={setNewItemIcon}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="选择图标" />
            </SelectTrigger>
            <SelectContent>
              {availableIcons.map((icon) => (
                <SelectItem key={icon.name} value={icon.name}>
                  {icon.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input 
            placeholder="输入亮点内容" 
            value={newItemContent}
            onChange={(e) => setNewItemContent(e.target.value)}
          />
          
          <Button onClick={handleAddItem}>
            <PlusCircle className="h-4 w-4 mr-1" /> 添加
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
