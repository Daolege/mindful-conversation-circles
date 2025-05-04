import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CourseHighlight {
  id?: number;
  course_id: number;
  title: string;
  description?: string;
  position: number;
}

interface CourseHighlightsListProps {
  courseId: number;
  onSaveSuccess?: () => void;
}

export const CourseHighlightsList: React.FC<CourseHighlightsListProps> = ({
  courseId,
  onSaveSuccess
}) => {
  const [highlights, setHighlights] = useState<CourseHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newHighlight, setNewHighlight] = useState<CourseHighlight>({
    course_id: courseId,
    title: '',
    description: '',
    position: 0
  });

  useEffect(() => {
    loadHighlights();
  }, [courseId]);

  const loadHighlights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_highlights')
        .select('*')
        .eq('course_id', courseId)
        .order('position');
      
      if (error) throw error;
      
      setHighlights(data || []);
    } catch (error) {
      console.error('Error loading highlights:', error);
      toast.error('加载课程亮点失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHighlight = async () => {
    if (!newHighlight.title.trim()) {
      toast.error('请输入亮点标题');
      return;
    }

    setSaving(true);
    try {
      const position = highlights.length;
      const { data, error } = await supabase
        .from('course_highlights')
        .insert([{
          ...newHighlight,
          position
        }])
        .select();
      
      if (error) throw error;
      
      setHighlights([...highlights, data[0]]);
      setNewHighlight({
        course_id: courseId,
        title: '',
        description: '',
        position: highlights.length + 1
      });
      
      if (onSaveSuccess) onSaveSuccess();
      toast.success('成功添加课程亮点');
    } catch (error) {
      console.error('Error adding highlight:', error);
      toast.error('添加课程亮点失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHighlight = async (id: number) => {
    if (!window.confirm('确认要删除此亮点吗？')) {
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('course_highlights')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      const updatedHighlights = highlights.filter(h => h.id !== id);
      setHighlights(updatedHighlights);
      
      // Update positions
      const reorderedHighlights = updatedHighlights.map((highlight, index) => ({
        ...highlight,
        position: index
      }));
      
      await updateHighlightsOrder(reorderedHighlights);
      setHighlights(reorderedHighlights);
      
      if (onSaveSuccess) onSaveSuccess();
      toast.success('成功删除课程亮点');
    } catch (error) {
      console.error('Error deleting highlight:', error);
      toast.error('删除课程亮点失败');
    } finally {
      setSaving(false);
    }
  };

  const moveHighlight = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === highlights.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const reorderedHighlights = [...highlights];
    const item = reorderedHighlights[index];
    
    reorderedHighlights.splice(index, 1);
    reorderedHighlights.splice(newIndex, 0, item);
    
    // Update positions
    const updatedHighlights = reorderedHighlights.map((highlight, idx) => ({
      ...highlight,
      position: idx
    }));
    
    setHighlights(updatedHighlights);
    await updateHighlightsOrder(updatedHighlights);
    
    if (onSaveSuccess) onSaveSuccess();
  };

  const updateHighlightsOrder = async (highlights: CourseHighlight[]) => {
    try {
      const updates = highlights.map(highlight => ({
        id: highlight.id,
        position: highlight.position
      }));
      
      // Use Promise.all to wait for all updates to complete
      const promises = updates.map(item => 
        supabase
          .from('course_highlights')
          .update({ position: item.position })
          .eq('id', item.id)
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error updating highlight order:', error);
      toast.error('更新亮点顺序失败');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">课程亮点列表</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-sm text-slate-500">正在加载课程亮点...</p>
          ) : (
            <>
              {highlights.length > 0 ? (
                <div className="space-y-3">
                  {highlights.map((highlight, index) => (
                    <div key={highlight.id} className="flex items-start gap-2 p-3 border rounded-md bg-white">
                      <div className="flex flex-col items-center mt-1 mr-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveHighlight(index, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => moveHighlight(index, 'down')}
                          disabled={index === highlights.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium">{highlight.title}</h3>
                        {highlight.description && (
                          <p className="text-sm text-slate-600 mt-1">{highlight.description}</p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => highlight.id && handleDeleteHighlight(highlight.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-slate-500 py-6 border border-dashed rounded-md">
                  暂无课程亮点，点击"添加亮点"按钮添加
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="font-medium">添加新亮点</h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="new-title">亮点标题 *</Label>
                    <Input
                      id="new-title"
                      value={newHighlight.title}
                      onChange={(e) => setNewHighlight({ ...newHighlight, title: e.target.value })}
                      placeholder="输入亮点标题"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-description">亮点描述（可选）</Label>
                    <Textarea
                      id="new-description"
                      value={newHighlight.description || ''}
                      onChange={(e) => setNewHighlight({ ...newHighlight, description: e.target.value })}
                      placeholder="输入亮点描述"
                      rows={3}
                    />
                  </div>
                  
                  <Button
                    onClick={handleAddHighlight}
                    disabled={saving || !newHighlight.title.trim()}
                    className="w-full"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {saving ? '添加中...' : '添加亮点'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseHighlightsList;
