import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCoursesByInstructorId,
  deleteCourse,
  updateCourseOrder,
} from '@/lib/services/courseService';
import { useAuth } from '@/contexts/authHooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { CalendarIcon } from 'lucide-react';

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

export const CourseManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: courses,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['instructor-courses', user?.id],
    queryFn: () => getCoursesByInstructorId(user?.id || ''),
    enabled: !!user?.id,
  });

  useEffect(() => {
    refetch(); // Refresh courses when the component mounts or user changes
  }, [user?.id, refetch]);

  const { mutate: deleteCourseAction, isPending: isDeleteLoading } = useMutation({
    mutationFn: (courseId: number) => deleteCourse(courseId),
    onSuccess: () => {
      toast.success('课程删除成功!');
      queryClient.invalidateQueries({ queryKey: ['instructor-courses', user?.id] }); // Fixed invalidation
    },
    onError: (error: any) => {
      toast.error(`删除课程失败: ${error.message || 'Unknown error'}`);
    },
  });

  const toggleCourseSelection = useCallback(
    (courseId: number) => {
      setSelectedCourses((prevSelected) =>
        prevSelected.includes(courseId)
          ? prevSelected.filter((id) => id !== courseId)
          : [...prevSelected, courseId]
      );
    },
    []
  );

  const handleSelectAllCourses = useCallback(() => {
    if (courses?.data) {
      // Ensure we're dealing with an array and each item has an id
      const courseArray = Array.isArray(courses.data) ? courses.data : [];
      const allCourseIds = courseArray
        .filter(course => course && typeof course === 'object' && 'id' in course)
        .map(course => (course as any).id);
        
      if (selectedCourses.length === allCourseIds.length) {
        setSelectedCourses([]); // Unselect all if all are currently selected
      } else {
        setSelectedCourses(allCourseIds); // Select all if not all are selected
      }
    }
  }, [courses, selectedCourses]);

  const handleDeleteSelectedCourses = useCallback(() => {
    if (selectedCourses.length === 0) {
      toast.warning('请选择要删除的课程。');
      return;
    }

    selectedCourses.forEach((courseId) => {
      deleteCourseAction(courseId);
    });

    setSelectedCourses([]); // Clear selected courses after deletion
  }, [selectedCourses, deleteCourseAction]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredCourses = React.useMemo(() => {
    if (!courses?.data) return [];

    // Ensure we're dealing with an array
    const courseArray = Array.isArray(courses.data) ? courses.data : [];
    
    return courseArray.filter((course) => {
      // Ensure course is an object with a title property
      if (course && typeof course === 'object' && 'title' in course) {
        const title = (course as any).title;
        return typeof title === 'string' && title.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  }, [courses, searchTerm]);

  const handleCreateCourse = () => {
    navigate('/course-editor/new');
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) {
      return; // Drag was aborted
    }

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) {
      return; // No actual change in position
    }

    // Reorder the courses array based on drag and drop
    const reorderedCourses = Array.from(courses?.data || []);
    const [movedCourse] = reorderedCourses.splice(startIndex, 1);
    reorderedCourses.splice(endIndex, 0, movedCourse);

    // Extract the IDs from the reordered courses
    const courseIds = reorderedCourses.map((course) => (course as any).id);

    // Optimistically update the UI
    queryClient.setQueryData(['instructor-courses', user?.id], (old: any) => {
      if (old?.data) {
        return {
          ...old,
          data: reorderedCourses,
        };
      }
      return old;
    });

    // Send the updated order to the server
    const { success, error } = await updateCourseOrder(courseIds);

    if (!success) {
      toast.error(`Failed to update course order: ${error?.message || 'Unknown error'}`);
      // If the update fails, revert the UI to the old state
      queryClient.invalidateQueries({ queryKey: ['instructor-courses', user?.id] });
    } else {
      toast.success('Course order updated successfully!');
    }
  };

  // Handle the delete action for a single course
  const handleDeleteCourse = (courseId: number) => {
    deleteCourseAction(courseId);
  };

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  if (isError) {
    return <div>Error loading courses. Please try again.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">课程管理</h1>

      <div className="mb-4 flex justify-between items-center">
        <Button onClick={handleCreateCourse} variant="knowledge">
          创建新课程
        </Button>
        <Input
          type="text"
          placeholder="搜索课程..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-md"
        />
      </div>

      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 rounded"
                    onChange={handleSelectAllCourses}
                    checked={
                      courses?.data && Array.isArray(courses.data)
                        ? selectedCourses.length === courses.data.length
                        : false
                    }
                  />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                课程名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                讲师
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分类
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  创建日期
                  <CalendarIcon className="ml-2 h-4 w-4" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                学员人数
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="courses-droppable">
              {(provided) => (
                <tbody
                  className="bg-white divide-y divide-gray-200"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {filteredCourses.map((course, index) => {
                    // Ensure we have id as a string
                    const courseId = (course as any).id?.toString();
                    if (!courseId) return null;
                    
                    return (
                      <Draggable
                        key={courseId}
                        draggableId={courseId}
                        index={index}
                      >
                        {(provided) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-indigo-600 rounded"
                                  checked={selectedCourses.includes((course as any).id)}
                                  onChange={() => toggleCourseSelection((course as any).id)}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {(course as any).title}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {(course as any).id}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {(course as any).status || 'Draft'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {(course as any).instructor_name || 'Unknown Instructor'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {(course as any).category || 'Uncategorized'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {formatDate((course as any).created_at)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {(course as any).enrollment_count || 0}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                              <button
                                onClick={() => navigate(`/course-editor/${(course as any).id}`)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => handleDeleteCourse((course as any).id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                删除
                              </button>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </tbody>
              )}
            </Droppable>
          </DragDropContext>
        </table>
        {filteredCourses.length === 0 && (
          <div className="text-center py-4">没有找到符合条件的课程。</div>
        )}
      </div>

      <div className="mt-4">
        <Button
          onClick={handleDeleteSelectedCourses}
          disabled={selectedCourses.length === 0 || isDeleteLoading}
          variant="destructive"
        >
          删除选中课程
        </Button>
      </div>
    </div>
  );
};
