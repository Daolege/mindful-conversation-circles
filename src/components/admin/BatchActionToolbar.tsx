
import React from "react";
import { Button } from "@/components/ui/button";
import { X, UserPlus, UserMinus, UserCheck, UserX, Loader2 } from "lucide-react";
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

interface BatchActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchEnable: () => void;
  onBatchDisable: () => void;
  onBatchSetAdmin: () => void;
  onBatchRemoveAdmin: () => void;
  isProcessing: boolean;
}

export const BatchActionToolbar: React.FC<BatchActionToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onBatchEnable,
  onBatchDisable,
  onBatchSetAdmin,
  onBatchRemoveAdmin,
  isProcessing
}) => {
  const [confirmAction, setConfirmAction] = React.useState<{
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
          已选择 {selectedCount} 项
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
                  'enable',
                  '批量启用用户',
                  `确认要启用 ${selectedCount} 个用户吗？此操作将允许这些用户登录系统。`,
                  onBatchEnable
                )}
                className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                disabled={isProcessing}
              >
                <UserCheck className="h-4 w-4 mr-1" /> 启用
              </Button>
            </TooltipTrigger>
            <TooltipContent>批量启用选中用户</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfirmDialog(
                  'disable',
                  '批量禁用用户',
                  `确认要禁用 ${selectedCount} 个用户吗？此操作将阻止这些用户登录系统。`,
                  onBatchDisable
                )}
                className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                disabled={isProcessing}
              >
                <UserX className="h-4 w-4 mr-1" /> 禁用
              </Button>
            </TooltipTrigger>
            <TooltipContent>批量禁用选中用户</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfirmDialog(
                  'makeAdmin',
                  '批量设为管理员',
                  `确认要将 ${selectedCount} 个用户设置为管理员吗？此操作将赋予这些用户管理系统的权限。`,
                  onBatchSetAdmin
                )}
                className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                disabled={isProcessing}
              >
                <UserPlus className="h-4 w-4 mr-1" /> 设为管理员
              </Button>
            </TooltipTrigger>
            <TooltipContent>批量设置为管理员</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfirmDialog(
                  'removeAdmin',
                  '批量移除管理员',
                  `确认要将 ${selectedCount} 个用户从管理员角色移除吗？此操作将撤销这些用户的管理权限。`,
                  onBatchRemoveAdmin
                )}
                className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                disabled={isProcessing}
              >
                <UserMinus className="h-4 w-4 mr-1" /> 移除管理员
              </Button>
            </TooltipTrigger>
            <TooltipContent>批量移除管理员权限</TooltipContent>
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
            <Button variant="outline" onClick={() => setConfirmAction(null)} className="rounded-10">取消</Button>
            <Button 
              variant={confirmAction?.type === 'disable' ? 'destructive' : 'default'} 
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
