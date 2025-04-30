
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, GripVertical, Eye, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import type { CourseNew } from "@/lib/types/course-new";
import { Checkbox } from "@/components/ui/checkbox";

interface DraggableCourseRowProps {
  course: CourseNew;
  onEdit: (courseId: number) => void;
  onView?: (courseId: number) => void;
  onDelete: (courseId: number) => void;
  onViewHomework?: (courseId: number) => void; // New prop for homework view
  onDragStart?: (index: number) => void;
  onDragEnd?: () => void;
  onDragOver?: (index: number) => void;
  index: number;
  isSelected?: boolean;
  onSelectChange?: (id: number, isSelected: boolean) => void;
}

export const DraggableCourseRow = ({ 
  course, 
  onEdit, 
  onDelete,
  onView,
  onViewHomework, // New prop
  onDragStart,
  onDragEnd,
  onDragOver,
  index,
  isSelected = false,
  onSelectChange
}: DraggableCourseRowProps) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'yyyy-MM-dd');
  };
  
  const handleDragStart = (e: React.DragEvent) => {
    // Create a custom drag image that represents the entire row
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    
    // Apply styles to the drag image
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.opacity = '0.8';
    dragImage.style.backgroundColor = '#f3f4f6';
    dragImage.style.width = `${e.currentTarget.clientWidth}px`;
    dragImage.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    dragImage.style.border = '2px solid #3b82f6';
    dragImage.style.borderRadius = '4px';
    
    // Add the drag image to the DOM
    document.body.appendChild(dragImage);
    
    // Set the custom drag image
    e.dataTransfer.setDragImage(dragImage, 20, 20);
    
    // Store the drag image element to remove it later
    e.dataTransfer.setData('text/plain', 'row-being-dragged');
    
    // Set dragging state
    setIsDragging(true);
    
    // Call the parent's drag start handler
    onDragStart?.(index);
    
    // Clean up the drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (onSelectChange) {
      onSelectChange(course.id, checked);
    }
  };
  
  return (
    <TableRow 
      className={`relative hover:bg-gray-100 transition-colors ${isDragging ? 'opacity-50 bg-blue-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
      data-index={index}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(index);
      }}
      onDrop={() => {
        setIsDragging(false);
      }}
    >
      <TableCell className="w-[50px] pl-4">
        {onSelectChange && (
          <Checkbox 
            checked={isSelected}
            onCheckedChange={handleCheckboxChange}
            aria-label={`Select course ${course.title}`}
          />
        )}
      </TableCell>
      <TableCell className="w-[60px] select-none">
        <div 
          className="flex items-center gap-2 cursor-grab"
          draggable={true}
          onDragStart={handleDragStart}
          onDragEnd={() => {
            setIsDragging(false);
            onDragEnd?.();
          }}
        >
          <GripVertical 
            size={18}
            className="text-gray-500 hover:text-primary transition-colors drag-handle"
          />
          {course.display_order || index + 1}
        </div>
      </TableCell>
      <TableCell className="font-medium max-w-[200px] truncate">{course.title}</TableCell>
      <TableCell className="w-[80px] text-right">¥{course.price}</TableCell>
      <TableCell className="w-[100px] text-center">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(course.status)}`}>
          {course.status === 'published' ? '已发布' : course.status === 'draft' ? '草稿' : '已归档'}
        </span>
      </TableCell>
      <TableCell className="w-[100px] text-center">{course.enrollment_count || 0}</TableCell>
      <TableCell className="w-[120px] text-center">{formatDate(course.created_at)}</TableCell>
      <TableCell className="w-[120px] text-center">{formatDate(course.updated_at)}</TableCell>
      <TableCell className="w-[180px] text-right">
        <div className="flex items-center justify-end space-x-2">
          {onView && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(course.id)}
              title="查看课程"
            >
              <Eye size={16} />
            </Button>
          )}
          {onViewHomework && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewHomework(course.id)}
              title="查看作业"
            >
              <BookOpen size={16} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(course.id)}
            title="编辑课程"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(course.id)}
            title="删除课程"
          >
            <Trash size={16} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
