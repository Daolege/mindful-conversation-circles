import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Plus, RefreshCw, GripVertical } from 'lucide-react';
import { HomeworkForm } from './HomeworkForm';
import { saveHomework, getHomeworksByLectureId, deleteHomework, debugHomeworkTable } from '@/lib/services/homeworkService';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import SaveStatusDisplay from '@/components/admin/course-editor/SaveStatusDisplay';
import { useCourseEditor } from '@/hooks/useCourseEditor';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useHomeworkDraggable } from '@/hooks/useHomeworkDraggable';
import { supabase } from '@/integrations/supabase/client';
import { Homework } from '@/lib/types/homework';

interface HomeworkPanelProps {
  lectureId: string;
  courseId?: number;
}

export const HomeworkPanel = ({ lectureId, courseId }: HomeworkPanelProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const params = useParams();
  const [effectiveCourseId, setEffectiveCourseId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<{success: boolean; error: string | null}>({
    success: false,
    error: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  // 使用Map来管理活跃的toast，按操作类型分类
  const [activeToasts, setActiveToasts] = useState<Record<string, string>>({
    save: '',
    delete: '',
    refresh: '',
    general: ''
  });
  
  // Added for tracking component mount state
  const isMounted = useRef(true);
  
  // 使用课程编辑器上下文
  const courseEditor = useCourseEditor();
  
  // Cleanup effect to handle component unmount
  useEffect(() => {
    return () => {
      // Mark component as unmounted
      isMounted.current = false;
      
      // Clear all active toasts when component unmounts
      console.log('[HomeworkPanel] Cleaning up toasts on unmount');
      Object.values(activeToasts).forEach(toastId => {
        if (toastId) {
          toast.dismiss(toastId);
        }
      });
      
      // Also dismiss any other potential toasts related to homework saving
      toast.dismiss();
    };
  }, [activeToasts]);
  
  // 清除特定类型的toast
  const clearToast = useCallback((type: string) => {
    const id = activeToasts[type];
    if (id) {
      toast.dismiss(id);
      if (isMounted.current) {
        setActiveToasts(prev => ({...prev, [type]: ''}));
      }
    }
  }, [activeToasts]);
  
  // 清除所有活跃的toast
  const clearAllToasts = useCallback(() => {
    Object.entries(activeToasts).forEach(([type, id]) => {
      if (id) toast.dismiss(id);
    });
    if (isMounted.current) {
      setActiveToasts({save: '', delete: '', refresh: '', general: ''});
    }
  }, [activeToasts]);
  
  // 显示toast并跟踪ID
  const showToast = useCallback((type: string, toastFn: () => string | number) => {
    // 先清除同类型的现有toast
    clearToast(type);
    // 确保ID被转换为字符串
    const id = String(toastFn());
    if (isMounted.current) {
      setActiveToasts(prev => ({...prev, [type]: id}));
    }
    return id;
  }, [clearToast]);
  
  // 改进课程ID提取逻辑
  const initializeCourseId = useCallback(() => {
    console.log('[HomeworkPanel] Initializing, getting course ID');
    console.log('[HomeworkPanel] Props courseId:', courseId);
    console.log('[HomeworkPanel] URL params:', params);
    console.log('[HomeworkPanel] CourseEditor context:', courseEditor?.data?.id);
    console.log('[HomeworkPanel] Current URL path:', window.location.pathname);
    
    // 尝试从多个来源获取课程ID
    let detectedCourseId: number | null = null;
    
    // 1. 首先检查URL路径中的数字（如/admin/courses-new/72）
    const pathMatch = window.location.pathname.match(/\/courses-new\/(\d+)/);
    if (pathMatch && pathMatch[1]) {
      const extractedId = Number(pathMatch[1]);
      if (!isNaN(extractedId) && extractedId > 0) {
        console.log('[HomeworkPanel] Extracted valid courseId from path:', extractedId);
        detectedCourseId = extractedId;
      }
    }
    
    // 2. 如果没有从路径获取到，尝试使用传递的courseId属性
    if (!detectedCourseId && courseId !== undefined) {
      const numericId = Number(courseId);
      if (!isNaN(numericId) && numericId > 0) {
        console.log('[HomeworkPanel] Using valid courseId from props:', numericId);
        detectedCourseId = numericId;
      }
    }
    
    // 3. 尝试从CourseEditor上下文获取
    if (!detectedCourseId && courseEditor?.data?.id) {
      const numericId = Number(courseEditor.data.id);
      if (!isNaN(numericId) && numericId > 0) {
        console.log('[HomeworkPanel] Using valid courseId from context:', numericId);
        detectedCourseId = numericId;
      }
    }
    
    // 4. 最后尝试URL参数
    if (!detectedCourseId && params.courseId && params.courseId !== 'new') {
      const numericId = Number(params.courseId);
      if (!isNaN(numericId) && numericId > 0) {
        console.log('[HomeworkPanel] Using valid courseId from URL params:', numericId);
        detectedCourseId = numericId;
      }
    }
    
    // 设置有效课程ID
    if (detectedCourseId !== null && detectedCourseId !== effectiveCourseId) {
      console.log('[HomeworkPanel] Setting effective course ID to:', detectedCourseId, '(type:', typeof detectedCourseId, ')');
      setEffectiveCourseId(detectedCourseId);
    } else if (!detectedCourseId) {
      console.log('[HomeworkPanel] Unable to determine valid course ID');
      // 清除无效的ID
      if (effectiveCourseId !== null) {
        setEffectiveCourseId(null);
      }
    }
    
    return detectedCourseId;
  }, [courseId, params, courseEditor, effectiveCourseId, window.location.pathname]);
  
  // 组件挂载和依赖项变化时尝试获取课程ID
  useEffect(() => {
    const courseId = initializeCourseId();
    if (!courseId) {
      console.warn('[HomeworkPanel] No valid course ID found on initialization');
    }
  }, [initializeCourseId]);
  
  // 获取作业的查询函数
  const fetchHomework = useCallback(async () => {
    if (!lectureId) {
      console.error('[HomeworkPanel] Missing lecture ID, cannot fetch homework');
      throw new Error('Missing lecture ID');
    }
    
    console.log('[HomeworkPanel] Fetching homework, lecture ID:', lectureId);
    console.log('[HomeworkPanel] Using course ID:', effectiveCourseId, 'type:', typeof effectiveCourseId);
    
    try {
      // 首先运行诊断以检查问题
      await debugHomeworkTable();
      
      // 获取此课时的作业，按position排序
      const result = await getHomeworksByLectureId(lectureId);
      
      console.log('[HomeworkPanel] Homework fetch result:', {
        success: !result.error,
        count: result.data?.length || 0,
        error: result.error?.message
      });

      // 返回数据，如果存在position字段则按position排序
      const sortedData = result.data ? 
        [...result.data].sort((a, b) => {
          // 如果存在position字段，按position排序
          if (a.position !== undefined && b.position !== undefined) {
            return a.position - b.position;
          }
          return 0; // 保持原顺序
        }) : 
        [];
      
      return sortedData;
    } catch (err) {
      console.error('[HomeworkPanel] Error fetching homework:', err);
      throw err;
    }
  }, [lectureId, effectiveCourseId]);
  
  // 使用TanStack Query获取作业
  const { 
    data: fetchedHomeworkList, 
    isLoading, 
    refetch: refetchHomework,
    error
  } = useQuery({
    queryKey: ['homework', lectureId, effectiveCourseId],
    queryFn: fetchHomework,
    enabled: !!lectureId,
    retry: 1,
    staleTime: 1000, // 短暂的失效时间确保频繁刷新
    refetchOnMount: true
  });
  
  // 使用拖拽排序的钩子
  const { 
    homeworks: homeworkList, 
    setHomeworks: setHomeworkList,
    isDragging, 
    setIsDragging,
    isSaving: isSortSaving,
    handleDragEnd
  } = useHomeworkDraggable(fetchedHomeworkList || [], (newList) => {
    // 清除缓存以确保数据一致性
    queryClient.setQueryData(
      ['homework', lectureId, effectiveCourseId], 
      newList
    );
  });
  
  // 当获取的作业发生变化时更新本地状态
  useEffect(() => {
    if (fetchedHomeworkList && !isDragging && !isSortSaving) {
      setHomeworkList(fetchedHomeworkList);
    }
  }, [fetchedHomeworkList, isDragging, isSortSaving, setHomeworkList]);
  
  // 创建或更新作业，确保course_id总是有效的数字类型
  const { mutateAsync: saveHomeworkMutation, isPending: isSaving } = useMutation({
    mutationFn: async (data: any) => {
      if (!isMounted.current) return null; // 安全检查
      
      setSaveStatus({ success: false, error: null });
      clearAllToasts();
      
      // 安全调用trackSaveAttempt
      if (courseEditor && typeof courseEditor.trackSaveAttempt === 'function') {
        try {
          courseEditor.trackSaveAttempt('homework');
          console.log('[HomeworkPanel] Successfully called courseEditor.trackSaveAttempt');
        } catch (err) {
          console.warn('[HomeworkPanel] Error in courseEditor.trackSaveAttempt:', err);
          // 继续执行，这只是用于UI状态
        }
      } else {
        console.log('[HomeworkPanel] courseEditor.trackSaveAttempt is not available');
      }
      
      // 获取有效的courseId
      const detectedCourseId = initializeCourseId();
      if (!detectedCourseId || isNaN(Number(detectedCourseId))) {
        const error = new Error(`无效的课程ID: ${detectedCourseId}`);
        console.error('[HomeworkPanel] Invalid course ID for save operation:', detectedCourseId);
        throw error;
      }
      
      console.log('[HomeworkPanel] Saving homework with data:', {
        ...data,
        courseId: detectedCourseId,
        courseIdType: typeof detectedCourseId
      });
      
      // 显示保存中的toast
      const toastId = showToast('save', () => toast.loading('正在保存作业...', {
        duration: 10000, // 最长10秒
        onAutoClose: () => {
          // 超时自动清除
          if (isMounted.current) {
            clearToast('save');
          }
        }
      }));
      
      try {
        // 确保course_id是数字类型
        const homeworkData = {
          ...data,
          course_id: Number(detectedCourseId)
        };
        
        // 如果没有指定position，赋予一个合理的值
        if (homeworkData.position === undefined || homeworkData.position === null) {
          // 如果是新建作业，将position设为现有作业数量+1
          // 如果是编辑作业，保持原position
          if (!homeworkData.id && homeworkList && homeworkList.length > 0) {
            homeworkData.position = homeworkList.length + 1;
          } else {
            homeworkData.position = 1; // 默认为1
          }
        }
        
        console.log('[HomeworkPanel] Final save data with position:', homeworkData.position);
        
        const result = await saveHomework(homeworkData);
        
        if (!isMounted.current) return null; // 检查组件是否已卸载
        
        if (result.error) {
          clearToast('save');
          const errorMsg = '保存失败: ' + (result.error.message || '未知错误');
          showToast('save', () => toast.error(errorMsg, { duration: 5000 }));
          
          // 安全调用handleSaveComplete
          if (courseEditor && typeof courseEditor.handleSaveComplete === 'function') {
            try {
              courseEditor.handleSaveComplete(false, result.error.message);
            } catch (err) {
              console.warn('[HomeworkPanel] Error in courseEditor.handleSaveComplete:', err);
            }
          }
          
          throw result.error;
        }
        
        clearToast('save');
        showToast('save', () => toast.success('作业保存成功', { duration: 3000 }));
        
        // 安全调用handleSaveComplete
        if (courseEditor && typeof courseEditor.handleSaveComplete === 'function') {
          try {
            courseEditor.handleSaveComplete(true);
          } catch (err) {
            console.warn('[HomeworkPanel] Error in courseEditor.handleSaveComplete:', err);
          }
        }
        
        setSaveStatus({ success: true, error: null });
        return result.data;
      } catch (error: any) {
        if (!isMounted.current) return null; // 检查组件是否已卸载
        
        clearToast('save');
        const errorMsg = '保存失败: ' + (error.message || '未知错误');
        showToast('save', () => toast.error(errorMsg, { duration: 5000 }));
        console.error('[HomeworkPanel] Save error details:', error);
        
        // 确保状态更新
        setSaveStatus({ success: false, error: errorMsg });
        throw error;
      }
    },
    onSuccess: (data) => {
      if (!isMounted.current) return; // 安全检查
      
      setShowAddForm(false);
      setEditingHomework(null);
      queryClient.invalidateQueries({ queryKey: ['homework', lectureId] });
      // 同时刷新讲座的作业状态查询
      queryClient.invalidateQueries({ queryKey: ['lecture-homework', lectureId] });
      
      // 3秒后清除成功提示
      setTimeout(() => {
        if (isMounted.current) {
          clearToast('save');
        }
      }, 3000);
    },
    onError: (error: Error) => {
      if (!isMounted.current) return; // 安全检查
      
      console.error('[HomeworkPanel] Mutation error:', error);
      setSaveStatus({ success: false, error: error.message });
      
      // 5秒后清除错误提示
      setTimeout(() => {
        if (isMounted.current) {
          clearToast('save');
        }
      }, 5000);
    }
  });
  
  // 删除作业
  const { mutateAsync: deleteHomeworkMutation, isPending: isDeleting } = useMutation({
    mutationFn: async (homeworkId: string) => {
      if (!isMounted.current) return null; // 安全检查
      
      clearAllToasts();
      const toastId = showToast('delete', () => toast.loading('正在删除作业...', { duration: 10000 }));
      
      try {
        const result = await deleteHomework(homeworkId);
        
        if (!isMounted.current) return null; // 检查组件是否已卸载
        
        if (!result.success) {
          clearToast('delete');
          showToast('delete', () => toast.error('删除失败: ' + (result.error?.message || '未知错误'), { duration: 5000 }));
          throw result.error;
        }
        
        clearToast('delete');
        showToast('delete', () => toast.success('作业删除成功', { duration: 3000 }));
        return true;
      } catch (error: any) {
        if (!isMounted.current) return null; // 检查组件是否已卸载
        
        clearToast('delete');
        showToast('delete', () => toast.error('删除失败: ' + (error?.message || '未知错误'), { duration: 5000 }));
        throw error;
      }
    },
    onSuccess: () => {
      if (!isMounted.current) return; // 安全检查
      
      queryClient.invalidateQueries({ queryKey: ['homework', lectureId] });
      // 同时刷新讲座的作业状态查询
      queryClient.invalidateQueries({ queryKey: ['lecture-homework', lectureId] });
      
      // 删除成功后，更新其他作业的位置，保持连续
      if (homeworkList && homeworkList.length > 1) {
        // 重新获取作业列表并重置位置
        refetchHomework().then(({ data }) => {
          if (data && data.length > 0) {
            // 重新编号
            const renumbered = data.map((item, index) => ({
              ...item,
              position: index + 1
            }));
            
            // 批量更新位置
            const updates = renumbered.map((item) => ({
              id: item.id,
              position: item.position
            }));
            
            // 并行执行所有更新
            const updatePromises = updates.map(update => 
              supabase
                .from('homework')
                .update({ position: update.position } as { position: number })
                .eq('id', update.id)
            );
            
            Promise.all(updatePromises).catch(err => {
              console.error('更新作业位置失败:', err);
            });
          }
        });
      }
      
      // 3秒后清除成功提示
      setTimeout(() => {
        if (isMounted.current) {
          clearToast('delete');
        }
      }, 3000);
    }
  });
  
  // 刷新作业数据
  const handleRefreshHomework = async () => {
    if (!isMounted.current) return; // 安全检查
    
    setIsRefreshing(true);
    clearAllToasts();
    
    try {
      showToast('refresh', () => toast.loading('正在刷新作业数据...', { duration: 10000 }));
      await refetchHomework();
      // 同时刷新讲座的作业状态查询
      await queryClient.invalidateQueries({ queryKey: ['lecture-homework', lectureId] });
      
      if (!isMounted.current) return; // 检查组件是否已卸载
      
      clearToast('refresh');
      showToast('refresh', () => toast.success('作业数据已刷新', { duration: 3000 }));
    } catch (error: any) {
      if (!isMounted.current) return; // 检查组件是否已卸载
      
      clearToast('refresh');
      showToast('refresh', () => toast.error('刷新失败: ' + (error?.message || '未知错误'), { duration: 5000 }));
    } finally {
      if (isMounted.current) {
        setIsRefreshing(false);
      }
    }
  };
  
  // 提交作业表单
  const handleFormSubmit = async (data: any) => {
    try {
      // 确保有课程ID
      if (!effectiveCourseId) {
        const detectedId = initializeCourseId();
        if (!detectedId) {
          throw new Error('无法获取有效的课程ID，请确保课程已保存');
        }
      }
      
      // 确保course_id是数字类型
      const result = await saveHomeworkMutation({
        ...data,
        course_id: Number(effectiveCourseId)
      });
      
      return result;
    } catch (error: any) {
      console.error('[HomeworkPanel] Form submission error:', error);
      throw error;
    }
  };
  
  // 编辑作业
  const handleEditHomework = (homework: Homework) => {
    console.log('[HomeworkPanel] Editing homework:', homework);
    setEditingHomework(homework);
    setShowAddForm(true);
  };
  
  // 取消编辑或添加
  const handleCancel = () => {
    console.log('[HomeworkPanel] Cancel edit/add');
    setShowAddForm(false);
    setEditingHomework(null);
  };
  
  // 删除作业
  const handleDeleteHomework = async (homeworkId: string) => {
    if (!window.confirm('确定删除此作业？此操作无法撤销。')) {
      return;
    }
    
    try {
      await deleteHomeworkMutation(homeworkId);
    } catch (error) {
      console.error('[HomeworkPanel] Error deleting homework:', error);
    }
  };
  
  // 添加新作业
  const handleShowAddForm = () => {
    console.log('[HomeworkPanel] Show add form');
    setEditingHomework(null);
    setShowAddForm(true);
  };

  // 如果没有课程ID，显示警告
  if (!effectiveCourseId && !isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg font-medium">课时作业</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <p className="text-yellow-800">
              无法加载作业数据：未找到有效的课程ID。请先保存课程基本信息。
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">课时作业</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshHomework}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* 状态显示区域 */}
        <SaveStatusDisplay 
          saving={isSaving || isSortSaving || isDeleting} 
          success={saveStatus.success}
          error={saveStatus.error}
        />
        
        {/* 添加/编辑表单 */}
        {showAddForm ? (
          <div className="mb-6 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-medium mb-4">
              {editingHomework ? '编辑作业' : '添加作业'}
            </h3>
            <HomeworkForm
              lectureId={lectureId}
              courseId={Number(effectiveCourseId)}
              initialData={editingHomework}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSubmitting={isSaving}
            />
          </div>
        ) : (
          <Button 
            onClick={handleShowAddForm}
            className="mb-4"
          >
            <Plus className="h-4 w-4 mr-1" />
            添加作业
          </Button>
        )}
        
        {/* 加载状态 */}
        {isLoading && (
          <div className="flex justify-center my-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        
        {/* 错误状态 */}
        {error && !isLoading && (
          <div className="bg-red-50 p-4 my-4 rounded-md border border-red-200">
            <p className="text-red-800">加载作业失败: {(error as Error).message}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 text-red-600 border-red-300"
              onClick={handleRefreshHomework}
            >
              重试
            </Button>
          </div>
        )}
        
        {/* 空状态 */}
        {!isLoading && !error && (!homeworkList || homeworkList.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <p>暂无作业</p>
            <p className="text-sm mt-1">点击"添加作业"按钮创建课时练习</p>
          </div>
        )}
        
        {/* 作业列表 - 使��拖拽排序 */}
        {!isLoading && !error && homeworkList && homeworkList.length > 0 && (
          <DragDropContext
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
          >
            <Droppable droppableId="homework-list">
              {(provided) => (
                <div 
                  className="space-y-4 mt-4"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {homeworkList.map((homework, index) => (
                    <Draggable 
                      key={homework.id} 
                      draggableId={homework.id} 
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border rounded-md p-4 transition-shadow ${
                            snapshot.isDragging 
                              ? 'shadow-lg bg-gray-50' 
                              : 'hover:shadow-md'
                          }`}
                          style={{
                            ...provided.draggableProps.style
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div 
                                {...provided.dragHandleProps}
                                className="cursor-move p-1 hover:bg-gray-100 rounded"
                              >
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-medium">{homework.title}</h4>
                                <p className="text-sm text-gray-500">
                                  {homework.type === 'single_choice' ? '单选题' :
                                   homework.type === 'multiple_choice' ? '多选题' :
                                   homework.type === 'fill_blank' ? '填空题' : '未知类型'}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditHomework(homework)}
                              >
                                编辑
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteHomework(homework.id)}
                              >
                                删除
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </CardContent>
    </Card>
  );
};
