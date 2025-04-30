
import React from 'react';
import { CourseSection, CourseLecture } from '@/lib/types/course-new';
import { SectionItem } from './SectionItem';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

interface SectionListProps {
  sections: CourseSection[];
  expandedSectionIds: Set<string>;
  onToggleSectionExpand: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onSectionUpdate: (sectionId: string, updates: Partial<CourseSection>) => void;
  onLectureAdd: (sectionId: string, title: string, isFree: boolean) => Promise<boolean>;
  onLectureUpdate: (sectionId: string, lectureId: string, updates: Partial<CourseLecture>) => void;
  onLectureDelete: (sectionId: string, lectureId: string) => void;
  onLecturesReorder: (sectionId: string, lectures: CourseLecture[]) => void;
  onHomeworkRequirementChange: (sectionId: string, lectureId: string, requiresHomework: boolean) => void;
  onSectionsReorder?: (sections: CourseSection[]) => void;
}

export const SectionList: React.FC<SectionListProps> = ({
  sections,
  expandedSectionIds,
  onToggleSectionExpand,
  onDeleteSection,
  onSectionUpdate,
  onLectureAdd,
  onLectureUpdate,
  onLectureDelete,
  onLecturesReorder,
  onHomeworkRequirementChange,
  onSectionsReorder
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 的移动距离才会触发拖拽
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    console.log('章节拖动完成:', { activeId: active.id, overId: over.id });
    
    const oldIndex = sections.findIndex((section) => section.id === active.id);
    const newIndex = sections.findIndex((section) => section.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const newSections = arrayMove(sections, oldIndex, newIndex).map(
        (section, index) => ({
          ...section,
          position: index
        })
      );
      
      console.log('重新排序后的章节:', newSections.map(s => ({ id: s.id, title: s.title, position: s.position })));
      
      if (onSectionsReorder) {
        onSectionsReorder(newSections);
      }
    }
  };

  if (sections.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg">
        <p className="text-gray-500">还没有章节，点击上方按钮添加第一个章节</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
    >
      <SortableContext 
        items={sections.map(section => section.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {sections.map((section, index) => (
            <SectionItem
              key={section.id}
              section={section}
              isExpanded={expandedSectionIds.has(section.id)}
              isLast={index === sections.length - 1}
              onToggleExpand={() => onToggleSectionExpand(section.id)}
              onDelete={() => onDeleteSection(section.id)}
              onUpdate={(updates) => onSectionUpdate(section.id, updates)}
              onLectureAdd={(title, isFree) => onLectureAdd(section.id, title, isFree)}
              onLectureUpdate={(lectureId, updates) => onLectureUpdate(section.id, lectureId, updates)}
              onLectureDelete={(lectureId) => onLectureDelete(section.id, lectureId)}
              onLecturesReorder={(updatedLectures) => onLecturesReorder(section.id, updatedLectures)}
              onHomeworkRequirementChange={(lectureId, requiresHomework) => 
                onHomeworkRequirementChange(section.id, lectureId, requiresHomework)
              }
              dragHandleProps={{
                id: section.id,
                data: {
                  type: 'section',
                  section: section
                }
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
