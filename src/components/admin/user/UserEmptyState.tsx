
import React from "react";
import { Search } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { useTranslations } from '@/hooks/useTranslations';

export const UserEmptyState: React.FC<{ filterActive: boolean }> = ({ filterActive }) => {
  const { t } = useTranslations();
  
  return (
    <TableRow>
      <TableCell colSpan={9} className="text-center py-16 text-gray-500">
        <div className="flex flex-col items-center">
          <Search className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-lg font-medium">
            {filterActive ? t('admin:noMatchingUsers') : t('admin:noUsersYet')}
          </p>
          <p className="text-sm text-gray-400">
            {filterActive ? t('admin:tryDifferentSearchCriteria') : t('admin:noRegisteredUsers')}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};
