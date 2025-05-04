
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SortConfig, SortField } from "@/lib/types/user-types";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from '@/hooks/useTranslations';

interface UserListHeaderProps {
  sortConfig: SortConfig;
  onSortChange: (field: SortField) => void;
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  hasUsers: boolean;
}

export const UserListHeader: React.FC<UserListHeaderProps> = ({
  sortConfig,
  onSortChange,
  allSelected,
  onSelectAll,
  hasUsers
}) => {
  const { t } = useTranslations();
  
  const renderSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const handleSortClick = (field: SortField) => {
    onSortChange(field);
  };

  return (
    <TableHeader className="bg-gray-50 sticky top-0 z-10">
      <TableRow>
        <TableHead className="w-[60px] text-center">
          <div className="flex items-center justify-center h-full">
            <Checkbox 
              checked={allSelected}
              onCheckedChange={onSelectAll}
              disabled={!hasUsers}
              aria-label={t('admin:selectAllUsers')}
            />
          </div>
        </TableHead>
        <TableHead 
          className="w-[150px]"
          onClick={() => handleSortClick('registration_date')}
        >
          <div className="flex items-center cursor-pointer select-none">
            {t('common:username')}{renderSortIcon('registration_date')}
          </div>
        </TableHead>
        <TableHead className="w-[200px]">{t('common:email')}</TableHead>
        <TableHead 
          className="w-[140px]"
          onClick={() => handleSortClick('roles')}
        >
          <div className="flex items-center cursor-pointer select-none">
            {t('common:role')}{renderSortIcon('roles')}
          </div>
        </TableHead>
        <TableHead 
          className="w-[100px]"
          onClick={() => handleSortClick('is_active')}
        >
          <div className="flex items-center cursor-pointer select-none">
            {t('admin:status')}{renderSortIcon('is_active')}
          </div>
        </TableHead>
        <TableHead 
          className="w-[150px]"
          onClick={() => handleSortClick('registration_date')}
        >
          <div className="flex items-center cursor-pointer select-none">
            {t('common:registrationTime')}{renderSortIcon('registration_date')}
          </div>
        </TableHead>
        <TableHead 
          className="w-[150px]"
          onClick={() => handleSortClick('last_login_at')}
        >
          <div className="flex items-center cursor-pointer select-none">
            {t('common:lastLogin')}{renderSortIcon('last_login_at')}
          </div>
        </TableHead>
        <TableHead 
          className="w-[120px]"
          onClick={() => handleSortClick('login_method')}
        >
          <div className="flex items-center cursor-pointer select-none">
            {t('common:loginMethod')}{renderSortIcon('login_method')}
          </div>
        </TableHead>
        <TableHead className="w-[80px] text-right">{t('admin:actions')}</TableHead>
      </TableRow>
    </TableHeader>
  );
};
