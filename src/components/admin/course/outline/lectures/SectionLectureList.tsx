
import React, { useEffect } from 'react';
import { LectureItem } from './LectureItem';
import { CourseLecture } from '@/lib/types/course-new';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove,
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { useCourseEditor } from '@/components/admin/course-editor/CourseEditorContext';
import { useParams } from 'react-router-dom';

interface SectionLectureListProps {
  lectures: CourseLecture[];
  onUpdate: (lectureId: string, updates: Partial<CourseLecture>) => void;
  onDelete: (lectureId: string) => void;
  onReorder: (updatedLectures: CourseLecture[]) => void;
  onHomeworkRequirementChange?: (lectureId: string, requiresHomework: boolean) => void;
}

export const SectionLectureList = ({
  lectures,
  onUpdate,
  onDelete,
  onReorder,
  onHomeworkRequirementChange
}: SectionLectureListProps) => {
  const params = useParams();
  
  // Use CourseEditorContext with error handling
  let courseId: number | undefined;
  let courseEditorData: any = null;
  
  try {
    const courseEditor = useCourseEditor();
    courseEditorData = courseEditor?.data;
    courseId = courseEditor?.data?.id ? Number(courseEditor.data.id) : undefined;
    
    console.log('[SectionLectureList] Successfully got context:', courseEditor);
  } catch (err) {
    console.warn('[SectionLectureList] CourseEditorContext not available:', err);
  }
  
  // Log detailed initialization info 
  useEffect(() => {
    console.log('[SectionLectureList] Initializing with context data:', courseEditorData);
    console.log('[SectionLectureList] URL params:', params);
    
    // If courseId isn't available from context, try to get it from URL params
    if (!courseId && params.courseId) {
      const paramsCourseId = Number(params.courseId);
      if (!isNaN(paramsCourseId)) {
        courseId = paramsCourseId;
        console.log('[SectionLectureList] Using courseId from URL params:', courseId);
      }
    }
    
    // Try to extract from path as last resort
    if (!courseId) {
      const pathParts = window.location.pathname.split('/');
      for (let i = 0; i < pathParts.length; i++) {
        if (pathParts[i] === 'courses-new' && i + 1 < pathParts.length) {
          const possibleId = Number(pathParts[i + 1]);
          if (!isNaN(possibleId)) {
            courseId = possibleId;
            console.log('[SectionLectureList] Extracted courseId from path:', courseId);
            break;
          }
        }
      }
    }
    
    console.log('[SectionLectureList] Final resolved courseId:', courseId);
  }, [params, courseEditorData, courseId]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!lectures.length) {
    return (
      <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md border border-dashed border-gray-200">
        该章节暂无课时
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = lectures.findIndex(lecture => lecture.id === active.id);
      const newIndex = lectures.findIndex(lecture => lecture.id === over?.id);
      
      // Update positions
      const reorderedLectures = arrayMove(lectures, oldIndex, newIndex).map(
        (lecture, index) => ({ ...lecture, position: index })
      );
      
      onReorder(reorderedLectures);
    }
  };

  const handleHomeworkRequirement = (lectureId: string, requiresHomework: boolean) => {
    if (onHomeworkRequirementChange) {
      onHomeworkRequirementChange(lectureId, requiresHomework);
    }
  };

  // If we couldn't determine courseId, use a fallback (current URL path)
  if (!courseId) {
    // Extract from URL as last resort
    const pathMatch = window.location.pathname.match(/\/courses-new\/(\d+)/);
    if (pathMatch && pathMatch[1]) {
      courseId = parseInt(pathMatch[1], 10);
      console.log('[SectionLectureList] Last resort courseId from URL path:', courseId);
    }
  }

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext
          items={lectures.map(lecture => lecture.id)}
          strategy={verticalListSortingStrategy}
        >
          {lectures.map((lecture, index) => (
            <LectureItem
              key={lecture.id}
              id={lecture.id}
              title={lecture.title || `课时 ${index + 1}`}
              position={index}
              sectionId={lecture.section_id || ''}
              isFree={lecture.is_free}
              duration={lecture.duration}
              requiresHomeworkCompletion={lecture.requires_homework_completion}
              showHomeworkSettings={true}
              onUpdate={(updates) => onUpdate(lecture.id, updates)}
              onDelete={() => onDelete(lecture.id)}
              courseId={courseId}
              onHomeworkRequirementChange={(requiresHomework) =>
                handleHomeworkRequirement(lecture.id, requiresHomework)
              }
              dragHandleProps={{
                id: lecture.id,
                data: {
                  type: 'lecture',
                  lecture
                }
              }}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
