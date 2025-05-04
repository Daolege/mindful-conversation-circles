
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditableListComponent } from './EditableListComponent';
import { ModuleTitleEdit } from './ModuleTitleEdit';
import { CourseHighlights } from './CourseHighlights';

interface CourseOtherSettingsProps {
  courseId: number;
  whatyouwilllearn: string[];
  requirements: string[];
  audiences: string[];
  onAddWhatyouwilllearn: (item: string) => void;
  onAddRequirement: (item: string) => void;
  onAddAudience: (item: string) => void;
  onDeleteWhatyouwilllearn: (index: number) => void;
  onDeleteRequirement: (index: number) => void;
  onDeleteAudience: (index: number) => void;
  onReorderWhatyouwilllearn: (sourceIndex: number, destinationIndex: number) => void;
  onReorderRequirement: (sourceIndex: number, destinationIndex: number) => void;
  onReorderAudience: (sourceIndex: number, destinationIndex: number) => void;
  onUpdateWhatyouwilllearn: (index: number, value: string) => void;
  onUpdateRequirement: (index: number, value: string) => void;
  onUpdateAudience: (index: number, value: string) => void;
}

export function CourseOtherSettings({
  courseId,
  whatyouwilllearn,
  requirements,
  audiences,
  onAddWhatyouwilllearn,
  onAddRequirement,
  onAddAudience,
  onDeleteWhatyouwilllearn,
  onDeleteRequirement,
  onDeleteAudience,
  onReorderWhatyouwilllearn,
  onReorderRequirement,
  onReorderAudience,
  onUpdateWhatyouwilllearn,
  onUpdateRequirement,
  onUpdateAudience
}: CourseOtherSettingsProps) {
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
          <ModuleTitleEdit courseId={courseId} moduleType="objectives" />
          <EditableListComponent
            items={whatyouwilllearn}
            onAdd={onAddWhatyouwilllearn}
            onDelete={onDeleteWhatyouwilllearn}
            onReorder={onReorderWhatyouwilllearn}
            onUpdate={onUpdateWhatyouwilllearn}
            placeholder="添加学习目标..."
            emptyMessage="还没有添加学习目标，点击上方按钮添加。"
            defaultIcon="target"
          />
        </div>
      </TabsContent>
      
      <TabsContent value="requirements">
        <div className="space-y-4">
          <ModuleTitleEdit courseId={courseId} moduleType="requirements" />
          <EditableListComponent
            items={requirements}
            onAdd={onAddRequirement}
            onDelete={onDeleteRequirement}
            onReorder={onReorderRequirement}
            onUpdate={onUpdateRequirement}
            placeholder="添加学习模式..."
            emptyMessage="还没有添加学习模式，点击上方按钮添加。"
            defaultIcon="book-open"
          />
        </div>
      </TabsContent>
      
      <TabsContent value="audiences">
        <div className="space-y-4">
          <ModuleTitleEdit courseId={courseId} moduleType="audiences" />
          <EditableListComponent
            items={audiences}
            onAdd={onAddAudience}
            onDelete={onDeleteAudience}
            onReorder={onReorderAudience}
            onUpdate={onUpdateAudience}
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
