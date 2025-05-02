
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShieldCheck, ShieldX, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { UserRole } from "@/lib/types/user-types";
import { useTranslations } from "@/hooks/useTranslations";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface UserActionsDropdownProps {
  userId: string;
  isAdmin: boolean;
  isActive: boolean;
  onRoleChange: (userId: string, role: UserRole, hasRole: boolean) => Promise<void>;
  onStatusChange: (userId: string, isCurrentlyActive: boolean) => Promise<void>;
  isUpdating: boolean;
}

export const UserActionsDropdown = ({
  userId,
  isAdmin,
  isActive,
  onRoleChange,
  onStatusChange,
  isUpdating,
}: UserActionsDropdownProps) => {
  const { t } = useTranslations();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'disable' | 'enable'>('disable');
  const [internalIsActive, setInternalIsActive] = useState(isActive);

  // Update internal state when props change
  React.useEffect(() => {
    setInternalIsActive(isActive);
  }, [isActive]);

  const handleStatusChangeClick = (currentStatus: boolean) => {
    setActionType(currentStatus ? 'disable' : 'enable');
    setConfirmDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    try {
      // Update internal state optimistically 
      setInternalIsActive(!internalIsActive);
      await onStatusChange(userId, internalIsActive);
      // If there was an error, the state would be reset in the catch block
    } catch (error) {
      // Revert the optimistic update if the operation failed
      setInternalIsActive(internalIsActive);
      console.error("Failed to change user status:", error);
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover:bg-gray-100 rounded-full w-8 h-8 p-0 transition-all duration-300 hover:scale-110 hover:shadow-md"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">{t('admin:openActionsMenu')}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-lg"
        >
          <DropdownMenuItem
            onClick={() => onRoleChange(userId, 'admin', isAdmin)}
            disabled={isUpdating}
            className="group flex items-center gap-2 px-3 py-2 hover:bg-gray-100/80 text-gray-800 transition-all duration-300 rounded-md"
          >
            {isAdmin ? (
              <>
                <ShieldX 
                  size={16} 
                  className="text-destructive group-hover:text-destructive/80 transition-colors flex-shrink-0 group-hover:scale-110 duration-300" 
                />
                <span>{t('admin:removeAdmin')}</span>
              </>
            ) : (
              <>
                <ShieldCheck 
                  size={16} 
                  className="text-primary group-hover:text-primary/80 transition-colors flex-shrink-0 group-hover:scale-110 duration-300" 
                />
                <span>{t('admin:setAsAdmin')}</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusChangeClick(internalIsActive)}
            disabled={isUpdating}
            className="group flex items-center justify-between w-full px-3 py-2 hover:bg-gray-100/80 text-gray-800 transition-all duration-300 rounded-md"
          >
            <span>{internalIsActive ? t('admin:disableUser') : t('admin:enableUser')}</span>
            <Switch 
              checked={internalIsActive}
              className={`${internalIsActive 
                ? 'bg-primary group-hover:bg-primary/80' 
                : 'bg-destructive group-hover:bg-destructive/80'} 
                transition-all duration-300`} 
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-2xl rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className={actionType === 'disable' ? "text-destructive animate-pulse" : "text-green-600 animate-pulse"} />
              {actionType === 'disable' ? t('admin:confirmDisableUser') : t('admin:confirmEnableUser')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              {actionType === 'disable' ? t('admin:disableUserDescription') : t('admin:enableUserDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="transition-all duration-300 hover:bg-gray-100">{t('actions:cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmStatusChange}
              className={`${actionType === 'disable' 
                ? "bg-destructive hover:bg-destructive/90" 
                : "bg-green-600 hover:bg-green-700"} 
                transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg`}
            >
              {t('actions:confirm')} {actionType === 'disable' ? t('actions:disable') : t('actions:enable')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
