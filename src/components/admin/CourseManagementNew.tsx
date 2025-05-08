import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { getAllCoursesNew, deleteCourseNew, batchDeleteCourses, batchUpdateCourseStatus } from '@/lib/services/courseNewService';
import { CourseNew } from '@/lib/types/course-new';
import { supabase } from '@/integrations/supabase/client';
import { DraggableCourseRow } from './course/DraggableCourseRow';
import { BatchCourseActionToolbar } from './course/BatchCourseActionToolbar';
import { Edit, Trash, MoreVertical, Eye, Copy, 
  FileText, ArrowUpDown, FileCheck 
} from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const CourseManagementNew = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseNew[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<CourseNew[]>([]);
  const draggedItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);
  
  // 选择状态相关
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);
  
  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      const filtered = courses.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);
  
  useEffect(() => {
    // 检查是否应该设置"全选"状态
    if (filteredCourses.length > 0 && selectedCourseIds.size === filteredCourses.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedCourseIds, filteredCourses]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllCoursesNew();
      
      if (error) {
        console.error("Error loading courses:", error);
        toast.error("加载课程列表失败");
        return;
      }
      
      if (data) {
        // Sort by display_order
        const sortedCourses = [...data].sort((a, b) => a.display_order - b.display_order);
        setCourses(sortedCourses);
        setFilteredCourses(sortedCourses);
      } else {
        setCourses([]);
        setFilteredCourses([]);
      }
    } catch (err) {
      console.error("Error in loadCourses:", err);
      toast.error("加载课程列表时出错");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    navigate('/admin/courses-new/new');
  };

  const handleEditCourse = (courseId: number) => {
    navigate(`/admin/courses-new/${courseId}`);
  };

  const handleViewCourse = (courseId: number) => {
    window.open(`/courses-new/${courseId}`, '_blank');
  };

  const handleViewHomework = (courseId: number) => {
    navigate(`/admin/courses-new/${courseId}/homework`);
  };

  const confirmDeleteCourse = (courseId: number) => {
    setCourseToDelete(courseId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (courseToDelete === null) return;
    
    try {
      setDeleting(true);
      const { success, error } = await deleteCourseNew(courseToDelete);
      
      if (error) {
        console.error("Error deleting course:", error);
        toast.error("删除课程失败", { description: error.message });
        return;
      }
      
      if (success) {
        toast.success("课程已成功删除");
        // Refresh the course list
        loadCourses();
      } else {
        toast.error("删除课程失败");
      }
    } catch (err: any) {
      console.error("Error in handleDeleteCourse:", err);
      toast.error("删除课程时出错", { description: err.message });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const handleDragStart = (index: number) => {
    draggedItemIndex.current = index;
    setIsDragging(true);
  };

  const handleDragOver = (index: number) => {
    dragOverItemIndex.current = index;
  };

  const handleDrop = async () => {
    // 检查我们是否有有效的拖拽源和目标索引
    if (draggedItemIndex.current === null || 
        dragOverItemIndex.current === null || 
        draggedItemIndex.current === dragOverItemIndex.current) {
      setIsDragging(false);
      return;
    }
    
    const startIndex = draggedItemIndex.current;
    const endIndex = dragOverItemIndex.current;
    
    // 创建课程的副本用于重排序
    const updatedCourses = [...filteredCourses];
    const [draggedCourse] = updatedCourses.splice(startIndex, 1);
    updatedCourses.splice(endIndex, 0, draggedCourse);
    
    // 乐观地更新UI
    setFilteredCourses(updatedCourses);
    setIsDragging(false);
    
    try {
      // 更新每个课程的display_order以匹配新的排序顺序
      const updatePromises = updatedCourses.map(async (course, index) => {
        const { error } = await supabase
          .from('courses_new')
          .update({ display_order: index + 1 })
          .eq('id', course.id);
          
        if (error) throw error;
      });
      
      await Promise.all(updatePromises);
      toast.success("课程排序已更新");
      
      // 更新原始课程列表以反映新顺序
      const newCourses = [...courses];
      for (const course of updatedCourses) {
        const idx = newCourses.findIndex(c => c.id === course.id);
        if (idx !== -1) {
          newCourses[idx].display_order = course.display_order;
        }
      }
      setCourses(newCourses.sort((a, b) => a.display_order - b.display_order));
    } catch (err) {
      console.error("Error updating course order:", err);
      toast.error("更新课程排序失败");
      // 如果更新失败，重新加载课程列表以恢复原始排序
      loadCourses();
    }
    
    // 重置拖拽状态
    draggedItemIndex.current = null;
    dragOverItemIndex.current = null;
  };
  
  // 处理课程选择
  const handleSelectCourse = (courseId: number, isSelected: boolean) => {
    const newSelectedIds = new Set(selectedCourseIds);
    
    if (isSelected) {
      newSelectedIds.add(courseId);
    } else {
      newSelectedIds.delete(courseId);
    }
    
    setSelectedCourseIds(newSelectedIds);
  };
  
  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredCourses.map(course => course.id));
      setSelectedCourseIds(allIds);
    } else {
      setSelectedCourseIds(new Set());
    }
    setSelectAll(checked);
  };
  
  // 清除选择
  const handleClearSelection = () => {
    setSelectedCourseIds(new Set());
    setSelectAll(false);
  };
  
  // 批量删除课程
  const handleBatchDelete = async () => {
    if (selectedCourseIds.size === 0) return;
    
    try {
      setBatchProcessing(true);
      const courseIds = Array.from(selectedCourseIds);
      
      const { success, error } = await batchDeleteCourses(courseIds);
      
      if (error) {
        console.error("批量删除课程失败:", error);
        toast.error("批量删除课程失败", { description: error.message });
        return;
      }
      
      if (success) {
        toast.success(`已成功删除 ${courseIds.length} 门课程`);
        handleClearSelection();
        loadCourses();
      }
    } catch (err: any) {
      console.error("批量删除课程时出错:", err);
      toast.error("批量删除课程时出错", { description: err.message });
    } finally {
      setBatchProcessing(false);
    }
  };
  
  // 批量更新课程状态
  const handleBatchUpdateStatus = async (status: 'published' | 'draft' | 'archived') => {
    if (selectedCourseIds.size === 0) return;
    
    try {
      setBatchProcessing(true);
      const courseIds = Array.from(selectedCourseIds);
      
      const { success, error } = await batchUpdateCourseStatus(courseIds, status);
      
      if (error) {
        console.error(`批量更新课程状态为 ${status} 失败:`, error);
        toast.error(`批量更新课程状态失败`, { description: error.message });
        return;
      }
      
      if (success) {
        const statusText = status === 'published' ? '已发布' : status === 'draft' ? '草稿' : '已归档';
        toast.success(`已成功将 ${courseIds.length} 门课程状态更新为${statusText}`);
        handleClearSelection();
        loadCourses();
      }
    } catch (err: any) {
      console.error(`批量更新课程状态为 ${status} 时出错:`, err);
      toast.error("批量更新课程状态时出错", { description: err.message });
    } finally {
      setBatchProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>课程管理 (新版)</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="搜索课程..."
              className="w-[240px] pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateCourse} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            创建新课程
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="relative" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
            <Table>
              <TableCaption>共 {filteredCourses.length} 个课程</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] pl-4">
                    <Checkbox 
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                      aria-label="全选"
                    />
                  </TableHead>
                  <TableHead className="w-[60px]">排序</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead className="w-[80px] text-right">价格</TableHead>
                  <TableHead className="w-[100px] text-center">状态</TableHead>
                  <TableHead className="w-[100px] text-center">报名人数</TableHead>
                  <TableHead className="w-[120px] text-center">创建日期</TableHead>
                  <TableHead className="w-[120px] text-center">更新日期</TableHead>
                  <TableHead className="w-[180px] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course, index) => (
                  <DraggableCourseRow
                    key={course.id}
                    course={course}
                    index={index}
                    onEdit={handleEditCourse}
                    onDelete={confirmDeleteCourse}
                    onView={handleViewCourse}
                    onViewHomework={handleViewHomework}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={() => setIsDragging(false)}
                    isSelected={selectedCourseIds.has(course.id)}
                    onSelectChange={handleSelectCourse}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            {searchTerm ? (
              <p className="text-gray-500">未找到匹配的课程，请尝试其他关键词</p>
            ) : (
              <p className="text-gray-500">还没有创建任何课程，点击"创建新课程"按钮开始</p>
            )}
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除课程</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，课程的所有内容、章节和课时都将被永久删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  删除中...
                </>
              ) : (
                "确认删除"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 批量操作工具栏 */}
      <BatchCourseActionToolbar
        selectedCount={selectedCourseIds.size}
        onClearSelection={handleClearSelection}
        onBatchDelete={handleBatchDelete}
        onBatchPublish={() => handleBatchUpdateStatus('published')}
        onBatchDraft={() => handleBatchUpdateStatus('draft')}
        onBatchArchive={() => handleBatchUpdateStatus('archived')}
        isProcessing={batchProcessing}
      />
    </Card>
  );
};

export default CourseManagementNew;
