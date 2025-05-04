
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditableListComponent } from './EditableListComponent';
import { ModuleTitleEdit } from './ModuleTitleEdit';
import { CourseHighlights } from './CourseHighlights';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CourseOtherSettingsProps {
  courseId: number;
}

export function CourseOtherSettings({
  courseId
}: CourseOtherSettingsProps) {
  // 状态
  const [whatyouwilllearn, setWhatyouwilllearn] = useState<{ id: string; content: string; icon?: string; position: number }[]>([]);
  const [requirements, setRequirements] = useState<{ id: string; content: string; icon?: string; position: number }[]>([]);
  const [audiences, setAudiences] = useState<{ id: string; content: string; icon?: string; position: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初始加载课程设置
  useEffect(() => {
    if (courseId) {
      loadCourseSettings();
    }
  }, [courseId]);

  // 加载课程设置
  const loadCourseSettings = async () => {
    setIsLoading(true);
    try {
      // 加载学习目标
      const { data: objectives, error: objectivesError } = await supabase
        .from('course_learning_objectives')
        .select('*')
        .eq('course_id', courseId)
        .order('position');
      
      if (objectivesError) throw objectivesError;
      setWhatyouwilllearn(objectives || []);
      
      // 加载学习要求
      const { data: reqs, error: reqsError } = await supabase
        .from('course_requirements')
        .select('*')
        .eq('course_id', courseId)
        .order('position');
      
      if (reqsError) throw reqsError;
      setRequirements(reqs || []);
      
      // 加载适合人群
      const { data: auds, error: audsError } = await supabase
        .from('course_audiences')
        .select('*')
        .eq('course_id', courseId)
        .order('position');
      
      if (audsError) throw audsError;
      setAudiences(auds || []);
    } catch (error) {
      console.error('加载课程设置失败:', error);
      toast.error('加载课程设置失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理添加项目
  const handleAddItem = async (table: string, content: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    try {
      const position = await getNextPosition(table);
      const newId = uuidv4();
      
      const { error } = await supabase
        .rpc('admin_add_course_item', {
          p_table_name: table,
          p_course_id: courseId,
          p_content: content,
          p_position: position,
          p_id: newId,
          p_is_visible: true
        });
      
      if (error) throw error;
      
      setter(prev => [...prev, {
        id: newId,
        content,
        icon: 'check',
        position,
        is_visible: true
      }]);
      
      toast.success('添加成功');
    } catch (error) {
      console.error(`添加 ${table} 失败:`, error);
      toast.error('添加失败');
    }
  };
  
  // 获取下一个位置编号
  const getNextPosition = async (table: string) => {
    const { data, error } = await supabase
      .from(table)
      .select('position')
      .eq('course_id', courseId)
      .order('position', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    return data && data.length > 0 ? data[0].position + 1 : 0;
  };

  // 处理删除项目
  const handleDeleteItem = async (table: string, id: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setter(prev => prev.filter(item => item.id !== id));
      toast.success('删除成功');
    } catch (error) {
      console.error(`删除 ${table} 失败:`, error);
      toast.error('删除失败');
    }
  };

  // 处理重新排序
  const handleReorderItem = async (table: string, items: any[], sourceIndex: number, destinationIndex: number, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (sourceIndex === destinationIndex) return;
    
    const newItems = [...items];
    const [movedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, movedItem);
    
    // 更新位置编号
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      position: index
    }));
    
    setter(updatedItems);
    
    // 批量更新数据库
    try {
      for (const item of updatedItems) {
        const { error } = await supabase
          .from(table)
          .update({ position: item.position })
          .eq('id', item.id);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error(`重新排序 ${table} 失败:`, error);
      toast.error('重新排序失败');
      // 回退状态并重新加载
      loadCourseSettings();
    }
  };

  // 处理更新项目
  const handleUpdateItem = async (table: string, id: string, content: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ content })
        .eq('id', id);
      
      if (error) throw error;
      
      setter(prev => prev.map(item => 
        item.id === id ? { ...item, content } : item
      ));
    } catch (error) {
      console.error(`更新 ${table} 失败:`, error);
      toast.error('更新失败');
    }
  };

  // 处理添加学习目标
  const handleAddWhatyouwilllearn = (content: string) => {
    handleAddItem('course_learning_objectives', content, setWhatyouwilllearn);
  };

  // 处理删除学习目标
  const handleDeleteWhatyouwilllearn = (index: number) => {
    const id = whatyouwilllearn[index].id;
    handleDeleteItem('course_learning_objectives', id, setWhatyouwilllearn);
  };

  // 处理重排学习目标
  const handleReorderWhatyouwilllearn = (sourceIndex: number, destinationIndex: number) => {
    handleReorderItem('course_learning_objectives', whatyouwilllearn, sourceIndex, destinationIndex, setWhatyouwilllearn);
  };

  // 处理更新学习目标
  const handleUpdateWhatyouwilllearn = (index: number, content: string) => {
    const id = whatyouwilllearn[index].id;
    handleUpdateItem('course_learning_objectives', id, content, setWhatyouwilllearn);
  };

  // 处理添加学习要求
  const handleAddRequirement = (content: string) => {
    handleAddItem('course_requirements', content, setRequirements);
  };

  // 处理删除学习要求
  const handleDeleteRequirement = (index: number) => {
    const id = requirements[index].id;
    handleDeleteItem('course_requirements', id, setRequirements);
  };

  // 处理重排学习要求
  const handleReorderRequirement = (sourceIndex: number, destinationIndex: number) => {
    handleReorderItem('course_requirements', requirements, sourceIndex, destinationIndex, setRequirements);
  };

  // 处理更新学习要求
  const handleUpdateRequirement = (index: number, content: string) => {
    const id = requirements[index].id;
    handleUpdateItem('course_requirements', id, content, setRequirements);
  };

  // 处理添加适合人群
  const handleAddAudience = (content: string) => {
    handleAddItem('course_audiences', content, setAudiences);
  };

  // 处理删除适合人群
  const handleDeleteAudience = (index: number) => {
    const id = audiences[index].id;
    handleDeleteItem('course_audiences', id, setAudiences);
  };

  // 处理重排适合人群
  const handleReorderAudience = (sourceIndex: number, destinationIndex: number) => {
    handleReorderItem('course_audiences', audiences, sourceIndex, destinationIndex, setAudiences);
  };

  // 处理更新适合人群
  const handleUpdateAudience = (index: number, content: string) => {
    const id = audiences[index].id;
    handleUpdateItem('course_audiences', id, content, setAudiences);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">加载课程设置...</span>
      </div>
    );
  }

  return (
    <Tabs defaultValue="whatyouwilllearn">
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="whatyouwilllearn">学习目标</TabsTrigger>
        <TabsTrigger value="requirements">学习模式</TabsTrigger>
        <TabsTrigger value="audiences">适合人群</TabsTrigger>
        <TabsTrigger value="highlights">课程亮点</TabsTrigger>
      </TabsList>
      
      <TabsContent value="whatyouwilllearn">
        <div className="space-y-4">
          <ModuleTitleEdit 
            courseId={courseId} 
            moduleType="objectives" 
          />
          <EditableListComponent
            items={whatyouwilllearn}
            onAdd={handleAddWhatyouwilllearn}
            onDelete={handleDeleteWhatyouwilllearn}
            onReorder={handleReorderWhatyouwilllearn}
            onUpdate={handleUpdateWhatyouwilllearn}
            placeholder="添加学习目标..."
            emptyMessage="还没有添加学习目标，点击上方按钮添加。"
            defaultIcon="target"
          />
        </div>
      </TabsContent>
      
      <TabsContent value="requirements">
        <div className="space-y-4">
          <ModuleTitleEdit 
            courseId={courseId} 
            moduleType="requirements" 
          />
          <EditableListComponent
            items={requirements}
            onAdd={handleAddRequirement}
            onDelete={handleDeleteRequirement}
            onReorder={handleReorderRequirement}
            onUpdate={handleUpdateRequirement}
            placeholder="添加学习模式..."
            emptyMessage="还没有添加学习模式，点击上方按钮添加。"
            defaultIcon="book-open"
          />
        </div>
      </TabsContent>
      
      <TabsContent value="audiences">
        <div className="space-y-4">
          <ModuleTitleEdit 
            courseId={courseId} 
            moduleType="audiences" 
          />
          <EditableListComponent
            items={audiences}
            onAdd={handleAddAudience}
            onDelete={handleDeleteAudience}
            onReorder={handleReorderAudience}
            onUpdate={handleUpdateAudience}
            placeholder="添加适合人群..."
            emptyMessage="还没有添加适合人群，点击上方按钮添加。"
            defaultIcon="users"
          />
        </div>
      </TabsContent>
      
      <TabsContent value="highlights">
        <CourseHighlights courseId={courseId} />
      </TabsContent>
    </Tabs>
  );
}
