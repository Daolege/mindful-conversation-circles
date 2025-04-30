
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Check, Trash, ArchiveX, Upload, FileEdit, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";

interface BatchCourseActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchDelete: () => void;
  onBatchPublish: () => void;
  onBatchDraft: () => void;
  onBatchArchive: () => void;
  isProcessing: boolean;
}

export const BatchCourseActionToolbar: React.FC<BatchCourseActionToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onBatchDelete,
  onBatchPublish,
  onBatchDraft,
  onBatchArchive,
  isProcessing
}) => {
  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const handleConfirmDialog = (
    type: string,
    title: string,
    description: string,
    onConfirm: () => void
  ) => {
    setConfirmAction({ type, title, description, onConfirm });
  };

  const executeAction = () => {
    if (confirmAction?.onConfirm) {
      confirmAction.onConfirm();
    }
    setConfirmAction(null);
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded-10 px-4 py-3 flex items-center space-x-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <Badge variant="outline" className="bg-gray-800 text-white">
          已选择 {selectedCount} 门课程
        </Badge>
        <div className="h-5 w-px bg-gray-300 mx-1" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                disabled={isProcessing}
                className="text-gray-700"
              >
                <X className="h-4 w-4 mr-1" /> 清除
              </Button>
            </TooltipTrigger>
            <TooltipContent>清除所有选择</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="h-5 w-px bg-gray-300 mx-1" />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfirmDialog(
                  'publish',
                  '批量发布课程',
                  `确认要发布 ${selectedCount} 门课程吗？此操作将使课程对外可见。`,
                  onBatchPublish
                )}
                className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                disabled={isProcessing}
              >
                <Upload className="h-4 w-4 mr-1" /> 发布
              </Button>
            </TooltipTrigger>
            <TooltipContent>批量发布选中课程</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfirmDialog(
                  'draft',
                  '设为草稿',
                  `确认要将 ${selectedCount} 门课程设为草稿状态吗？此操作将使课程不对外可见。`,
                  onBatchDraft
                )}
                className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                disabled={isProcessing}
              >
                <FileEdit className="h-4 w-4 mr-1" /> 设为草稿
              </Button>
            </TooltipTrigger>
            <TooltipContent>批量设为草稿状态</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfirmDialog(
                  'archive',
                  '归档课程',
                  `确认要将 ${selectedCount} 门课程归档吗？归档后的课程将被存档但不会显示在课程列表中。`,
                  onBatchArchive
                )}
                className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                disabled={isProcessing}
              >
                <ArchiveX className="h-4 w-4 mr-1" /> 归档
              </Button>
            </TooltipTrigger>
            <TooltipContent>批量归档选中课程</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfirmDialog(
                  'delete',
                  '批量删除课程',
                  `确认要删除 ${selectedCount} 门课程吗？此操作将永久删除所选课程及其所有内容，无法恢复。`,
                  onBatchDelete
                )}
                className="bg-gray-50 text-red-600 hover:bg-red-50 hover:text-red-700 border-gray-200"
                disabled={isProcessing}
              >
                <Trash className="h-4 w-4 mr-1" /> 删除
              </Button>
            </TooltipTrigger>
            <TooltipContent>批量删除选中课程</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isProcessing && (
          <Loader2 className="h-4 w-4 animate-spin text-gray-700 ml-2" />
        )}
      </div>

      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="rounded-10">
          <DialogHeader>
            <DialogTitle>{confirmAction?.title}</DialogTitle>
            <DialogDescription>{confirmAction?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmAction(null)} 
              className="rounded-10"
              disabled={isProcessing}
            >
              取消
            </Button>
            <Button 
              variant={confirmAction?.type === 'delete' ? 'destructive' : 'default'} 
              onClick={executeAction}
              disabled={isProcessing}
              className="rounded-10"
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
