
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import { HomeworkForm } from './HomeworkForm';
import { saveHomework, getHomeworksByLectureId, deleteHomework, debugHomeworkTable } from '@/lib/services/homeworkService';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import SaveStatusDisplay from '@/components/admin/course-editor/SaveStatusDisplay';
import { useCourseEditor } from '@/components/admin/course-editor/CourseEditorContext';

interface HomeworkPanelProps {
  lectureId: string;
  courseId?: number;
}

export const HomeworkPanel = ({ lectureId, courseId }: HomeworkPanelProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHomework, setEditingHomework] = useState<any>(null);
  const params = useParams();
  const [effectiveCourseId, setEffectiveCourseId] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<{success: boolean; error: string | null}>({
    success: false,
    error: null
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  
  // 改进: 使用Map来管理活跃的toast，按操作类型分类
  const [activeToasts, setActiveToasts] = useState<Record<string, string>>({
    save: '',
    delete: '',
    refresh: '',
    general: ''
  });
  
  // 使用课程编辑器上下文
  const courseEditor = useCourseEditor();
  
  // 清除特定类型的toast
  const clearToast = useCallback((type: string) => {
    const id = activeToasts[type];
    if (id) {
      toast.dismiss(id);
      setActiveToasts(prev => ({...prev, [type]: ''}));
    }
  }, [activeToasts]);
  
  // 清除所有活跃的toast
  const clearAllToasts = useCallback(() => {
    Object.entries(activeToasts).forEach(([type, id]) => {
      if (id) toast.dismiss(id);
    });
    setActiveToasts({save: '', delete: '', refresh: '', general: ''});
  }, [activeToasts]);
  
  // 显示toast并跟踪ID - 确保ID总是存储为字符串类型
  const showToast = useCallback((type: string, toastFn: () => string | number) => {
    // 先清除同类型的现有toast
    clearToast(type);
    // 确保ID被转换为字符串
    const id = String(toastFn());
    setActiveToasts(prev => ({...prev, [type]: id}));
    return id;
  }, [clearToast]);
  
  // 定义初始化函数，用于获取有效的课程ID - 改进版，确保在调用API前一定有courseId
  const initializeCourseId = useCallback(() => {
    console.log('[HomeworkPanel] Initializing, getting course ID');
    console.log('[HomeworkPanel] Props courseId:', courseId);
    console.log('[HomeworkPanel] URL params:', params);
    console.log('[HomeworkPanel] CourseEditor context:', courseEditor?.data?.id);
    console.log('[HomeworkPanel] Current URL path:', window.location.pathname);
    
    // 尝试从多个来源获取课程ID
    let detectedCourseId: number | null = null;
    
    // 1. 首先检查URL路径中的数字 - 这通常是最可靠的（如/admin/courses-new/72）
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
    
    // 设置有效课程ID，确保它是数字类型
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
  
  // 在组件挂载和依赖项变化时尝试获取课程ID
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
    
    if (!effectiveCourseId) {
      console.error('[HomeworkPanel] Missing course ID, cannot fetch homework');
      throw new Error('Missing course ID');
    }

    console.log('[HomeworkPanel] Fetching homework, lecture ID:', lectureId);
    console.log('[HomeworkPanel] Using course ID:', effectiveCourseId, 'type:', typeof effectiveCourseId);
    
    try {
      // 首先运行诊断以检查问题
      await debugHomeworkTable();
      
      // 然后获取此课时的作业
      const result = await getHomeworksByLectureId(lectureId);
      
      console.log('[HomeworkPanel] Homework fetch result:', {
        success: !result.error,
        count: result.data?.length || 0,
        error: result.error?.message
      });

      // 总是返回一个数组作为result.data，即使它是空的
      return result.data || [];
    } catch (err) {
      console.error('[HomeworkPanel] Error fetching homework:', err);
      throw err;
    }
  }, [lectureId, effectiveCourseId]);
  
  // 使用带有缓存的查询函数获取作业
  const { 
    data: homeworkList, 
    isLoading, 
    refetch: refetchHomework,
    error
  } = useQuery({
    queryKey: ['homework', lectureId, effectiveCourseId],
    queryFn: fetchHomework,
    enabled: !!lectureId && !!effectiveCourseId,
    retry: 1,
    staleTime: 1000, // 简短的失效时间以确保频繁刷新
    refetchOnMount: true
  });
  
  // 创建或更新作业 - 确保 course_id 总是有效
  const { mutateAsync: saveHomeworkMutation, isPending: isSaving } = useMutation({
    mutationFn: async (data: any) => {
      setSaveStatus({ success: false, error: null });
      clearAllToasts();
      
      // 安全地调用trackSaveAttempt - 先检查函数是否存在
      if (courseEditor && typeof courseEditor.trackSaveAttempt === 'function') {
        try {
          courseEditor.trackSaveAttempt('homework');
          console.log('[HomeworkPanel] Successfully called courseEditor.trackSaveAttempt');
        } catch (err) {
          console.warn('[HomeworkPanel] Error in courseEditor.trackSaveAttempt:', err);
          // Continue anyway, this is just for UI state
        }
      } else {
        console.log('[HomeworkPanel] courseEditor.trackSaveAttempt is not available');
      }
      
      // 确保有效的courseId - 这是关键修复
      if (!effectiveCourseId || isNaN(Number(effectiveCourseId))) {
        const error = new Error(`无效的课程ID: ${effectiveCourseId}`);
        console.error('[HomeworkPanel] Invalid course ID for save operation:', effectiveCourseId);
        throw error;
      }
      
      console.log('[HomeworkPanel] Saving homework with data:', {
        ...data,
        courseId: effectiveCourseId,
        courseIdType: typeof effectiveCourseId
      });
      
      // 显示保存中的toast - 确保ID被转换为字符串
      const toastId = showToast('save', () => toast.loading('正在保存作业...'));
      
      try {
        // 确保course_id正确设置 - 这是修复的重要部分
        const homeworkData = {
          ...data,
          course_id: effectiveCourseId // 确保这是一个数字
        };
        
        console.log('[HomeworkPanel] Final save data with course_id:', homeworkData.course_id, 'type:', typeof homeworkData.course_id);
        
        const result = await saveHomework(homeworkData);
        
        if (result.error) {
          clearToast('save');
          const errorMsg = '保存失败: ' + (result.error.message || '未知错误');
          showToast('save', () => toast.error(errorMsg));
          throw result.error;
        }
        
        clearToast('save');
        showToast('save', () => toast.success('作业保存成功'));
        return result.data;
      } catch (error: any) {
        clearToast('save');
        const errorMsg = '保存失败: ' + (error.message || '未知错误');
        showToast('save', () => toast.error(errorMsg));
        console.error('[HomeworkPanel] Save error details:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      setShowAddForm(false);
      setEditingHomework(null);
      setSaveStatus({ success: true, error: null });
      
      // 安全地调用handleSaveComplete - 先检查函数是否存在
      if (courseEditor && typeof courseEditor.handleSaveComplete === 'function') {
        try {
          courseEditor.handleSaveComplete(true);
          console.log('[HomeworkPanel] Successfully called courseEditor.handleSaveComplete');
        } catch (err) {
          console.warn('[HomeworkPanel] Error in courseEditor.handleSaveComplete:', err);
          // Continue anyway, this is just for UI state
        }
      } else {
        console.log('[HomeworkPanel] courseEditor.handleSaveComplete is not available');
      }
      
      // 延迟清除成功状态
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, success: false }));
      }, 3000);
      
      // 强制立即重新验证与重新获取
      queryClient.invalidateQueries({ queryKey: ['homework', lectureId, effectiveCourseId] });
      
      // 确保组件刷新作业列表，稍微延迟以允许服务器处理
      setTimeout(() => {
        console.log('[HomeworkPanel] Forcing homework list refetch after save');
        refetchHomework();
      }, 500);
    },
    onError: (error: any) => {
      const errorMessage = error.message || '保存作业失败';
      setSaveStatus({ success: false, error: errorMessage });
      
      // 安全地调用handleSaveComplete - 先检查函数是否存在
      if (courseEditor && typeof courseEditor.handleSaveComplete === 'function') {
        try {
          courseEditor.handleSaveComplete(false, errorMessage);
          console.log('[HomeworkPanel] Called handleSaveComplete with error');
        } catch (err) {
          console.warn('[HomeworkPanel] Error in courseEditor.handleSaveComplete with error:', err);
          // Continue anyway
        }
      } else {
        console.log('[HomeworkPanel] courseEditor.handleSaveComplete is not available for error handling');
      }
      
      console.error('[HomeworkPanel] Save error:', error);
    }
  });
  
  // 删除作业
  const { mutateAsync: deleteHomeworkMutation, isPending: isDeleting } = useMutation({
    mutationFn: async (homeworkId: string) => {
      clearAllToasts();
      // 确保ID被转换为字符串
      showToast('delete', () => toast.loading('正在删除作业...'));
      
      try {
        const result = await deleteHomework(homeworkId);
        if (!result.success) {
          clearToast('delete');
          const errorMsg = '删除失败: ' + (result.error?.message || '未知错误');
          showToast('delete', () => toast.error(errorMsg));
          throw new Error('删除失败');
        }
        clearToast('delete');
        showToast('delete', () => toast.success('作业已删除'));
        return result;
      } catch (error) {
        clearToast('delete');
        throw error;
      }
    },
    onSuccess: () => {
      // 强制立即重新验证与重新获取
      queryClient.invalidateQueries({ queryKey: ['homework', lectureId, effectiveCourseId] });
      
      // 确保组件刷新作业列表
      setTimeout(() => {
        refetchHomework();
      }, 500);
    },
    onError: (error: any) => {
      showToast('delete', () => toast.error('删除作业失败: ' + (error.message || '未知错误')));
    }
  });
  
  // 使用useCallback优化处理函数以防止不必要的重渲染
  const handleAddNewClick = useCallback(() => {
    setEditingHomework(null);
    setShowAddForm(true);
  }, []);
  
  const handleCancelForm = useCallback(() => {
    setShowAddForm(false);
    setEditingHomework(null);
  }, []);
  
  // 处理作业保存 - 修复版本确保course_id总是设置正确
  const handleSaveHomework = useCallback(async (data: any) => {
    try {
      // 再次验证课程ID的有效性
      if (!effectiveCourseId || isNaN(Number(effectiveCourseId))) {
        // 尝试重新获取课程ID
        const refreshedCourseId = initializeCourseId();
        
        if (!refreshedCourseId || isNaN(Number(refreshedCourseId))) {
          const errorMsg = '无法确定课程ID，无法保存作业';
          showToast('general', () => toast.error(errorMsg));
          setSaveStatus({ success: false, error: errorMsg });
          console.error('[HomeworkPanel] Still no valid course ID after refresh attempt');
          return;
        }
      }
      
      console.log('[HomeworkPanel] Preparing to save homework data', {
        ...data,
        courseId: effectiveCourseId,
        courseIdType: typeof effectiveCourseId
      });
      
      const homeworkData = {
        ...data,
        lecture_id: lectureId,
        course_id: effectiveCourseId // 确保course_id正确设置
      };
      
      if (editingHomework?.id) {
        homeworkData.id = editingHomework.id;
      }
      
      await saveHomeworkMutation(homeworkData);
    } catch (error: any) {
      console.error('[HomeworkPanel] Error saving homework', error);
      setSaveStatus({ success: false, error: error.message || '保存作业失败' });
    }
  }, [effectiveCourseId, lectureId, editingHomework, saveHomeworkMutation, showToast, initializeCourseId]);
  
  const handleDeleteHomework = useCallback(async (homeworkId: string) => {
    if (!confirm('确定要删除这个作业吗？')) return;
    
    try {
      await deleteHomeworkMutation(homeworkId);
    } catch (error: any) {
      showToast('general', () => toast.error('删除作业失败: ' + (error.message || '未知错误')));
    }
  }, [deleteHomeworkMutation, showToast]);
  
  const handleEditHomework = useCallback((homework: any) => {
    setEditingHomework(homework);
    setShowAddForm(true);
  }, []);
  
  const handleRefreshHomework = useCallback(async () => {
    setIsRefreshing(true);
    setSaveStatus({ success: false, error: null });
    clearAllToasts();
    
    // 首先重新确认课程ID（额外的健壮性）
    initializeCourseId();
    
    showToast('refresh', () => toast.loading('正在刷新作业列表...'));
    
    try {
      // 首先记录诊断信息
      const diagnosticResult = await debugHomeworkTable();
      console.log('[HomeworkPanel] Table diagnostics:', diagnosticResult);
      
      // 先强制清除缓存
      await queryClient.invalidateQueries({ queryKey: ['homework', lectureId, effectiveCourseId] });
      
      // 然后明确重新获取数据
      const result = await refetchHomework();
      
      console.log('[HomeworkPanel] Refresh result:', {
        data: result.data,
        isSuccess: result.isSuccess,
        dataLength: result.data?.length || 0
      });
      
      clearToast('refresh');
      showToast('refresh', () => toast.success(`作业列表已刷新 (${result.data?.length || 0}个作业)`));
    } catch (error: any) {
      console.error('Error refreshing homework:', error);
      const errorMsg = '刷新作业失败: ' + (error.message || '未知错误');
      clearToast('refresh');
      showToast('refresh', () => toast.error(errorMsg));
      setSaveStatus({ success: false, error: errorMsg });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, lectureId, effectiveCourseId, refetchHomework, clearToast, clearAllToasts, showToast, initializeCourseId]);
  
  // 组件挂载时自动刷新以确保数据已加载
  useEffect(() => {
    let isMounted = true;
    
    if (isMounted) {
      const timer = setTimeout(() => {
        if (isMounted) {
          // 重新获取课程ID（如果需要）
          const courseId = initializeCourseId();
          if (courseId) {
            console.log('[HomeworkPanel] Auto-refreshing data on mount with course ID:', courseId);
            refetchHomework().catch(err => {
              console.error('[HomeworkPanel] Error in initial data fetch:', err);
            });
          } else {
            console.warn('[HomeworkPanel] Cannot auto-refresh, no valid course ID available');
          }
        }
      }, 500);
      
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
    return () => { isMounted = false; };
  }, [initializeCourseId, refetchHomework]);
  
  // 组件卸载时清理toasts
  useEffect(() => {
    return () => {
      clearAllToasts();
    };
  }, [clearAllToasts]);

  // 显示错误（如果courseId缺失）
  if (!effectiveCourseId) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>作业管理</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => initializeCourseId()}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              重新获取课程ID
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
            <p className="text-yellow-700">无法加载作业管理，课程ID缺失</p>
            <p className="text-sm text-yellow-600 mt-2">课程ID: {courseId || '未提供'}</p>
            <p className="text-sm text-yellow-600">URL路径: {window.location.pathname}</p>
            <p className="text-sm text-yellow-600 mt-2">尝试从上下文中检测的课程ID: {courseEditor?.data?.id || '未找到'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            作业管理
            <span className="text-xs text-gray-500 font-normal">
              (课程ID: {effectiveCourseId})
            </span>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshHomework}
              className="flex items-center gap-1"
              disabled={isLoading || isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              刷新
            </Button>
            <Button
              onClick={handleAddNewClick}
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              添加作业
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 显示保存状态 */}
        <SaveStatusDisplay success={saveStatus.success} error={saveStatus.error} />
        
        {isLoading || isRefreshing ? (
          <div className="flex justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>{isRefreshing ? '刷新中...' : '加载中...'}</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <p className="text-red-700">加载作业失败: {(error as any).message || '未知错误'}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshHomework}
              className="mt-2"
            >
              重试
            </Button>
          </div>
        ) : (
          <>
            {showAddForm ? (
              <div className="border rounded-md p-4 my-4">
                <h3 className="font-medium mb-4">{editingHomework ? '编辑作业' : '添加新作业'}</h3>
                <HomeworkForm
                  lectureId={lectureId}
                  courseId={effectiveCourseId}
                  onSubmit={handleSaveHomework}
                  onCancel={handleCancelForm}
                  isSubmitting={isSaving}
                  initialData={editingHomework}
                />
              </div>
            ) : null}
            
            {homeworkList && homeworkList.length > 0 ? (
              <div className="space-y-3 mt-2">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-md mb-3">
                  <p className="text-blue-700 text-sm">找到 {homeworkList.length} 个作业</p>
                </div>
                {homeworkList.map((homework: any) => (
                  <div
                    key={homework.id}
                    className="border rounded-md p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{homework.title}</h3>
                        <p className="text-sm text-gray-500">
                          {homework.type === 'single_choice' ? '单选题' : 
                           homework.type === 'multiple_choice' ? '多选题' : '填空题'}
                        </p>
                        {homework.description && (
                          <p className="text-sm mt-1">{homework.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditHomework(homework)}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={() => handleDeleteHomework(homework.id)}
                          disabled={isDeleting}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-md">
                <p className="text-gray-500">暂无作业</p>
                <p className="text-sm text-gray-400 mt-1">点击"添加作业"按钮创建作业</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
