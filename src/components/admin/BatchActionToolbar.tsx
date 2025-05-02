
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
import { useTranslations } from "@/hooks/useTranslations";

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
  const { t } = useTranslations();
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
          {t('admin:selected', { count: selectedCount })}
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
                <X className="h-4 w-4 mr-1" /> {t('actions:clear')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('admin:clearAllSelections')}</TooltipContent>
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
                  t('admin:batchEnableUsers'),
                  t('admin:batchEnableUsersDescription', { count: selectedCount }),
                  onBatchEnable
                )}
                className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                disabled={isProcessing}
              >
                <UserCheck className="h-4 w-4 mr-1" /> {t('actions:enable')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('admin:batchEnableSelectedUsers')}</TooltipContent>
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
                  t('admin:batchDisableUsers'),
                  t('admin:batchDisableUsersDescription', { count: selectedCount }),
                  onBatchDisable
                )}
                className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                disabled={isProcessing}
              >
                <UserX className="h-4 w-4 mr-1" /> {t('actions:disable')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('admin:batchDisableSelectedUsers')}</TooltipContent>
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
                  t('admin:batchSetAdmin'),
                  t('admin:batchSetAdminDescription', { count: selectedCount }),
                  onBatchSetAdmin
                )}
                className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                disabled={isProcessing}
              >
                <UserPlus className="h-4 w-4 mr-1" /> {t('admin:setAsAdmin')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('admin:batchSetAsAdmins')}</TooltipContent>
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
                  t('admin:batchRemoveAdmin'),
                  t('admin:batchRemoveAdminDescription', { count: selectedCount }),
                  onBatchRemoveAdmin
                )}
                className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                disabled={isProcessing}
              >
                <UserMinus className="h-4 w-4 mr-1" /> {t('admin:removeAdmin')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('admin:batchRemoveAdminRights')}</TooltipContent>
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
            <Button variant="outline" onClick={() => setConfirmAction(null)} className="rounded-10">
              {t('actions:cancel')}
            </Button>
            <Button 
              variant={confirmAction?.type === 'disable' ? 'destructive' : 'default'} 
              onClick={executeAction}
              disabled={isProcessing}
              className="rounded-10"
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('actions:confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
