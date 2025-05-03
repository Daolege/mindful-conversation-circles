
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CourseBasicForm from "./course-editor/CourseBasicForm";
import { CourseOtherSettings } from './course/settings/CourseOtherSettings';
import { useCourseActions } from '@/hooks/useCourseActions';
import { useCourseEditor } from '@/hooks/useCourseEditor';
import { CourseOutlineEditor } from './course/outline';
import { toast } from "sonner";
import { CourseSection } from "@/lib/types/course-new";

interface CourseNewEditorRefactoredProps {
  initialCourseId: number | null;
  initialActiveTab?: string;
  courseTitle?: string;
  savedSections?: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
  };
  sectionVisibility?: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
    materials: boolean;
  };
}

const CourseNewEditorRefactored: React.FC<CourseNewEditorRefactoredProps> = ({
  initialCourseId,
  initialActiveTab = 'basic',
  courseTitle = '',
  savedSections = { objectives: false, requirements: false, audiences: false },
  sectionVisibility = { objectives: true, requirements: true, audiences: true, materials: false }
}) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [courseSections, setCourseSections] = useState<CourseSection[]>([]);
  const [hasOutlineChanges, setHasOutlineChanges] = useState(false);
  const navigate = useNavigate();
  const { isEditMode, saveCourse, saving, handleBack } = useCourseActions(initialCourseId?.toString() || 'new');
  const courseEditorContext = useCourseEditor();
  
  const handleTabChange = (value: string) => {
    // If there are unsaved changes in the outline, confirm before changing tabs
    if (value !== 'curriculum' && hasOutlineChanges) {
      const confirm = window.confirm("您有未保存的大纲更改，确定要离开吗？");
      if (!confirm) {
        return;
      }
    }
    
    setActiveTab(value);
  };

  const handleSave = async (formValues: any) => {
    await saveCourse(formValues, courseSections);
  };

  const handleSectionsChange = (sections: CourseSection[]) => {
    setCourseSections(sections);
    setHasOutlineChanges(true);
  };

  const handleOutlineSaveSuccess = () => {
    setHasOutlineChanges(false);
    toast.success("课程大纲保存成功");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? `编辑课程: ${courseTitle}` : "创建新课程"}
          </h1>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="curriculum" disabled={!isEditMode}>课程大纲</TabsTrigger>
          <TabsTrigger value="settings" disabled={!isEditMode}>其他设置</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <CourseBasicForm 
            onSave={handleSave}
            saving={saving}
            initialData={courseEditorContext?.data}
          />
        </TabsContent>

        <TabsContent value="curriculum">
          {!isEditMode ? (
            <Card className="p-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-medium mb-2">请先保存课程基本信息</h2>
                <p className="text-gray-500 mb-4">
                  需要先创建课程才能编辑课程大纲
                </p>
                <Button onClick={() => setActiveTab('basic')}>返回基本信息</Button>
              </div>
            </Card>
          ) : (
            <CourseOutlineEditor 
              courseId={initialCourseId!}
              onSectionsChange={handleSectionsChange}
              onSaveSuccess={handleOutlineSaveSuccess}
            />
          )}
        </TabsContent>

        <TabsContent value="settings">
          {!isEditMode ? (
            <Card className="p-6">
              <div className="text-center py-8">
                <h2 className="text-xl font-medium mb-2">请先保存课程基本信息</h2>
                <p className="text-gray-500 mb-4">
                  需要先创建课程才能编辑其他设置
                </p>
                <Button onClick={() => setActiveTab('basic')}>返回基本信息</Button>
              </div>
            </Card>
          ) : (
            <CourseOtherSettings 
              courseId={initialCourseId!}
              savedSections={savedSections}
              sectionVisibility={sectionVisibility}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseNewEditorRefactored;
