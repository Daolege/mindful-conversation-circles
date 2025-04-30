
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SortConfig, SortField } from "@/lib/types/user-types";
import { Checkbox } from "@/components/ui/checkbox";

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
              aria-label="选择所有用户"
            />
          </div>
        </TableHead>
        <TableHead 
          className="w-[150px]"
          onClick={() => handleSortClick('registration_date')}
        >
          <div className="flex items-center cursor-pointer select-none">
            用户名{renderSortIcon('registration_date')}
          </div>
        </TableHead>
        <TableHead className="w-[200px]">邮箱</TableHead>
        <TableHead 
          className="w-[140px]"
          onClick={() => handleSortClick('roles')}
        >
          <div className="flex items-center cursor-pointer select-none">
            角色{renderSortIcon('roles')}
          </div>
        </TableHead>
        <TableHead 
          className="w-[100px]"
          onClick={() => handleSortClick('is_active')}
        >
          <div className="flex items-center cursor-pointer select-none">
            状态{renderSortIcon('is_active')}
          </div>
        </TableHead>
        <TableHead 
          className="w-[150px]"
          onClick={() => handleSortClick('registration_date')}
        >
          <div className="flex items-center cursor-pointer select-none">
            注册时间{renderSortIcon('registration_date')}
          </div>
        </TableHead>
        <TableHead 
          className="w-[150px]"
          onClick={() => handleSortClick('last_login_at')}
        >
          <div className="flex items-center cursor-pointer select-none">
            最后登录{renderSortIcon('last_login_at')}
          </div>
        </TableHead>
        <TableHead 
          className="w-[120px]"
          onClick={() => handleSortClick('login_method')}
        >
          <div className="flex items-center cursor-pointer select-none">
            登录方式{renderSortIcon('login_method')}
          </div>
        </TableHead>
        <TableHead className="w-[80px] text-right">操作</TableHead>
      </TableRow>
    </TableHeader>
  );
};
