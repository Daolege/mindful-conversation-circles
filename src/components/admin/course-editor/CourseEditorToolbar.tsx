
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, RefreshCw, Loader2 } from 'lucide-react';

interface CourseEditorToolbarProps {
  isEditMode: boolean;
  onSave: () => void;
  onBack: () => void;
  onRefresh: () => void;
  isSaving?: boolean;
}

const CourseEditorToolbar: React.FC<CourseEditorToolbarProps> = ({ 
  isEditMode, 
  onSave, 
  onBack,
  onRefresh,
  isSaving = false
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? "编辑课程" : "创建新课程"}
        </h1>
      </div>
      <div className="flex gap-2">
        {isEditMode && (
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            className="flex items-center gap-2"
            disabled={isSaving}
          >
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
        )}
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 border border-black bg-black text-white hover:bg-gray-800"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              保存课程
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CourseEditorToolbar;
