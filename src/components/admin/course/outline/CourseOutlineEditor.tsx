
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2, Save, Plus, RefreshCw, AlertCircle, CheckCircle, Check, Square } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCourseOutlineManager } from './hooks/useCourseOutlineManager';
import { SectionList } from './sections/SectionList';
import { AddSectionForm } from './sections/AddSectionForm';
import { ConfirmDialog } from '../../shared/ConfirmDialog';
import { CourseSection } from '@/lib/types/course-new';
import { saveCourseOutline } from '@/lib/services/sectionService';

interface CourseOutlineEditorProps {
  courseId: number;
  sections?: CourseSection[];
  initialSections?: CourseSection[];
  onSectionsChange?: (sections: CourseSection[]) => void;
  onSaveSuccess?: () => void;
  hideToolbarButtons?: boolean;
  autoShowAddForm?: boolean;
}

export const CourseOutlineEditor = ({
  courseId,
  sections = [],
  initialSections = [],
  onSectionsChange,
  onSaveSuccess,
  hideToolbarButtons = false,
  autoShowAddForm = false
}: CourseOutlineEditorProps) => {
  const [showAddSectionForm, setShowAddSectionForm] = useState(autoShowAddForm);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [requiresSequentialLearning, setRequiresSequentialLearning] = useState(false);
  const [requiresHomeworkCompletion, setRequiresHomeworkCompletion] = useState(false);
  
  useEffect(() => {
    setShowAddSectionForm(autoShowAddForm);
    setSaving(false);
    setSaveSuccess(false);
    setSaveError(null);
  }, [courseId, autoShowAddForm]);
  
  const {
    sections: managedSections,
    loading,
    loadError,
    expandedSectionIds,
    deletingSectionId,
    toggleSectionExpansion,
    addSection,
    updateSection,
    deleteSection,
    addLecture,
    updateLecture,
    deleteLecture,
    updateLecturesOrder,
    reorderSections,
    refreshSections,
    setDeletingSectionId,
    homeworkSettings: {
      updateLectureHomeworkRequirement
    }
  } = useCourseOutlineManager({
    courseId,
    initialSections: sections.length > 0 ? sections : initialSections,
    onSectionsChange
  });

  const handleAddSectionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowAddSectionForm(true);
  };

  const handleSectionAdded = (newSection: CourseSection) => {
    console.log("添加新章节:", newSection);
    const success = addSection(newSection);
    
    if (success) {
      toast.success("章节添加成功");
    } else {
      toast.error("添加章节失败");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      const success = await deleteSection(sectionId);
      if (success) {
        toast.success("章节已删除");
      } else {
        toast.error("删除章节失败");
      }
    } finally {
      setDeletingSectionId(null);
    }
  };

  const handleSaveOutline = async () => {
    if (!courseId) {
      toast.error("课程ID不能为空");
      return;
    }
    
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      const { success, error } = await saveCourseOutline(courseId, managedSections);
      
      if (!success) {
        throw error || new Error("保存失败");
      }
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      
      setSaveSuccess(true);
      toast.success("课程大纲保存成功");
      
      setTimeout(() => {
        refreshSections();
      }, 1000);
      
    } catch (error: any) {
      console.error("保存课程大纲失败:", error);
      setSaveError(error.message || "保存失败");
      toast.error("保存课程大纲失败", {
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRetryLoading = () => {
    setRetryCount(prev => prev + 1);
    refreshSections();
  };

  const handleSectionsReorder = (reorderedSections: CourseSection[]) => {
    reorderSections(reorderedSections);
  };

  // Toggle functions for the button-style toggles
  const handleSequentialLearningToggle = (value: boolean) => {
    setRequiresSequentialLearning(value);
  };

  const handleHomeworkCompletionToggle = (value: boolean) => {
    setRequiresHomeworkCompletion(value);
  };

  const renderStatusMessage = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-lg">加载章节...</p>
        </div>
      );
    }
    
    if (loadError) {
      return (
        <div className="text-center py-8 text-red-500">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-lg">{loadError}</p>
          <Button variant="outline" className="mt-4" onClick={handleRetryLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            重新加载
          </Button>
        </div>
      );
    }
    
    if (managedSections.length === 0) {
      return (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-gray-500 mb-2">还没有章节</p>
          <p className="text-gray-400 text-sm mb-6">点击上方"添加章节"按钮开始构建您的课程大纲</p>
          <Button 
            onClick={handleAddSectionClick}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            添加第一个章节
          </Button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      {saveSuccess && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>保存成功</AlertTitle>
          <AlertDescription>
            课程大纲已成功保存。所有章节和课时信息已更新。
          </AlertDescription>
        </Alert>
      )}
      
      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>保存失败</AlertTitle>
          <AlertDescription>
            {saveError}
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>课程大纲</CardTitle>
            {!hideToolbarButtons && (
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-2 mr-4">
                  <Button
                    variant={requiresSequentialLearning ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSequentialLearningToggle(!requiresSequentialLearning)}
                    className="text-sm h-9"
                  >
                    {requiresSequentialLearning ? (
                      <Check className="h-4 w-4 mr-1 border rounded text-white" />
                    ) : (
                      <Square className="h-4 w-4 mr-1" />
                    )}
                    按顺序学习
                  </Button>
                  
                  <Button
                    variant={requiresHomeworkCompletion ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleHomeworkCompletionToggle(!requiresHomeworkCompletion)}
                    className="text-sm h-9"
                  >
                    {requiresHomeworkCompletion ? (
                      <Check className="h-4 w-4 mr-1 border rounded text-white" />
                    ) : (
                      <Square className="h-4 w-4 mr-1" />
                    )}
                    须提交作业
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleRetryLoading}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  刷新数据
                </Button>
                <Button
                  onClick={handleAddSectionClick}
                  className="flex items-center gap-2"
                  disabled={showAddSectionForm || loading}
                >
                  <Plus className="h-4 w-4" />
                  添加章节
                </Button>
                <Button
                  className="flex items-center gap-2 border border-black bg-black text-white hover:bg-gray-800"
                  onClick={handleSaveOutline}
                  disabled={saving || loading}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  保存大纲
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {renderStatusMessage()}
          
          {showAddSectionForm && (
            <div className="mb-4">
              <AddSectionForm
                courseId={courseId}
                position={managedSections.length}
                onCancel={() => setShowAddSectionForm(false)}
                onSectionAdded={handleSectionAdded}
                isVisible={showAddSectionForm}
              />
            </div>
          )}

          {!loading && !loadError && managedSections.length > 0 && (
            <SectionList
              sections={managedSections}
              expandedSectionIds={expandedSectionIds}
              onToggleSectionExpand={toggleSectionExpansion}
              onDeleteSection={setDeletingSectionId}
              onSectionUpdate={updateSection}
              onLectureAdd={addLecture}
              onLectureUpdate={updateLecture}
              onLectureDelete={deleteLecture}
              onLecturesReorder={updateLecturesOrder}
              onHomeworkRequirementChange={(sectionId, lectureId, requiresHomework) => {
                updateLectureHomeworkRequirement(lectureId, requiresHomework);
              }}
              onSectionsReorder={handleSectionsReorder}
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        title="删除章节"
        description="确定要删除这个章节吗？此操作不可撤销，章节下的所有课时也将被删除。"
        open={!!deletingSectionId}
        onCancel={() => setDeletingSectionId(null)}
        onConfirm={() => {
          if (deletingSectionId) {
            handleDeleteSection(deletingSectionId);
          }
        }}
      />
    </div>
  );
};
