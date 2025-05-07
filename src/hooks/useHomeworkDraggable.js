
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useHomeworkDraggable = (initialHomeworks = [], onOrderChange = null) => {
  const [homeworks, setHomeworks] = useState(initialHomeworks);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 重新编号和排序
  const renumberHomeworks = useCallback((items) => {
    return items.map((item, index) => ({
      ...item,
      position: index + 1
    }));
  }, []);

  // 更新作业列表
  const updateHomeworkList = useCallback((newList) => {
    setHomeworks(newList);
    if (onOrderChange) {
      onOrderChange(newList);
    }
  }, [onOrderChange]);

  // 处理拖拽结束
  const handleDragEnd = useCallback(async (result) => {
    setIsDragging(false);

    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    // 重排序数组
    const newItems = Array.from(homeworks);
    const [removed] = newItems.splice(sourceIndex, 1);
    newItems.splice(destinationIndex, 0, removed);

    // 更新位置
    const renumbered = renumberHomeworks(newItems);
    updateHomeworkList(renumbered);

    // 保存新顺序到数据库
    setIsSaving(true);
    const toastId = toast.loading('保存作业顺序...');

    try {
      // 批量更新作业位置
      const updates = renumbered.map((item) => ({
        id: item.id,
        position: item.position
      }));

      // 并行执行所有更新
      const updatePromises = updates.map(update => 
        supabase
          .from('homework')
          .update({ position: update.position })
          .eq('id', update.id)
      );
      
      await Promise.all(updatePromises);
      
      toast.dismiss(toastId);
      toast.success('作业顺序已更新');
    } catch (error) {
      console.error('保存作业顺序失败:', error);
      toast.dismiss(toastId);
      toast.error('更新作业顺序失败: ' + (error.message || '未知错误'));
      
      // 恢复原始顺序
      setHomeworks(initialHomeworks);
    } finally {
      setIsSaving(false);
    }
  }, [homeworks, initialHomeworks, renumberHomeworks, updateHomeworkList]);

  return {
    homeworks,
    setHomeworks,
    isDragging,
    setIsDragging,
    isSaving,
    handleDragEnd,
    renumberHomeworks
  };
};
