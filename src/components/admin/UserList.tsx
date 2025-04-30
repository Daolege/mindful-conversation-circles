
import React, { useState, useCallback } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { SortConfig, SortField, UserWithRoles } from "@/lib/types/user-types";
import { UserListHeader } from "./user/UserListHeader";
import { UserRow } from "./user/UserRow";
import { UserEmptyState } from "./user/UserEmptyState";
import { UserLoadingState } from "./user/UserLoadingState"; 
import { format } from "date-fns";
import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { BatchActionToolbar } from "./BatchActionToolbar";

interface UserListProps {
  users: UserWithRoles[] | undefined;
  isLoading: boolean;
  updatedUserIds: Set<string>;
  isUpdating: boolean;
  onRoleChange: (userId: string, role: string, hasRole: boolean) => Promise<void>;
  onStatusChange: (userId: string, isCurrentlyActive: boolean) => Promise<void>;
  sortConfig: SortConfig;
  onSortChange: (field: SortField) => void;
  activeFilters?: {
    status: string | null;
    role: string | null;
    dateRange: {
      from: Date | null;
      to: Date | null;
    } | null;
  };
}

export const UserList: React.FC<UserListProps> = ({
  users,
  isLoading,
  updatedUserIds,
  isUpdating,
  onRoleChange,
  onStatusChange,
  sortConfig,
  onSortChange,
  activeFilters
}) => {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  const exportToExcel = useCallback(() => {
    if (!users || users.length === 0) {
      toast.error("没有可导出的用户数据");
      return;
    }

    try {
      toast.info("正在准备导出数据...");
      
      // Transform data for Excel export
      const exportData = users.map(user => ({
        name: user.full_name || user.email?.split('@')[0] || '未知用户',
        email: user.email || '未设置',
        roles: user.roles?.join(', ') || '普通用户',
        status: user.is_active !== false ? '正常' : '已禁用',
        registrationDate: user.registration_date ? 
          format(new Date(user.registration_date), 'yyyy-MM-dd HH:mm') : 
          format(new Date(user.created_at), 'yyyy-MM-dd HH:mm'),
        lastLoginDate: user.last_login_at ? 
          format(new Date(user.last_login_at), 'yyyy-MM-dd HH:mm') : 
          '从未登录',
        loginMethod: user.login_method ? 
          user.login_method.charAt(0).toUpperCase() + user.login_method.slice(1) : 
          '未知'
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Column headers translation
      XLSX.utils.sheet_add_aoa(worksheet, [
        ['用户名', '邮箱', '角色', '状态', '注册时间', '最后登录时间', '登录方式']
      ], { origin: 'A1' });

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '用户列表');
      
      // Generate Excel file
      XLSX.writeFile(workbook, `用户列表_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
      
      toast.success("用户数据已成功导出为Excel文件");
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error("导出Excel文件时发生错误");
    }
  }, [users]);

  // 选择用户处理
  const handleSelectUser = (userId: string, isSelected: boolean) => {
    const newSelectedUsers = new Set(selectedUsers);
    if (isSelected) {
      newSelectedUsers.add(userId);
    } else {
      newSelectedUsers.delete(userId);
    }
    setSelectedUsers(newSelectedUsers);
  };

  const handleSelectAll = (checked: boolean) => {
    if (!users) return;
    
    if (checked) {
      const allUserIds = users.map(user => user.id);
      setSelectedUsers(new Set(allUserIds));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleClearSelection = () => {
    setSelectedUsers(new Set());
  };

  // 批量操作
  const batchSetUserStatus = async (active: boolean) => {
    if (selectedUsers.size === 0 || !users) return;
    
    try {
      setIsBatchProcessing(true);
      const selectedUserIds = Array.from(selectedUsers);
      
      // Get user details for the toast message
      const userCount = selectedUserIds.length;
      
      // For real implementation, use supabase batch update or transaction
      let successCount = 0;
      for (const userId of selectedUserIds) {
        const user = users.find(u => u.id === userId);
        if (!user) continue;
        
        // Only update if the status is different
        if ((user.is_active !== false) !== active) {
          await onStatusChange(userId, !active);
          successCount++;
        }
      }
      
      toast.success(
        active ? `成功启用 ${successCount} 个用户` : `成功禁用 ${successCount} 个用户`,
        { description: `${userCount - successCount} 个用户状态未变更` }
      );
      
      // Don't clear selection to allow for further batch operations
    } catch (error) {
      console.error('Batch status update error:', error);
      toast.error(active ? "批量启用用户失败" : "批量禁用用户失败");
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const batchSetAdminRole = async (addRole: boolean) => {
    if (selectedUsers.size === 0 || !users) return;
    
    try {
      setIsBatchProcessing(true);
      const selectedUserIds = Array.from(selectedUsers);
      
      // For real implementation, use supabase batch update or transaction
      let successCount = 0;
      for (const userId of selectedUserIds) {
        const user = users.find(u => u.id === userId);
        if (!user) continue;
        
        const isAdmin = user.roles?.includes('admin') || false;
        
        // Only update if the role status is different
        if (isAdmin !== addRole) {
          await onRoleChange(userId, 'admin', isAdmin);
          successCount++;
        }
      }
      
      toast.success(
        addRole ? `成功设置 ${successCount} 个用户为管理员` : `成功移除 ${successCount} 个用户的管理员权限`,
        { description: `${selectedUserIds.length - successCount} 个用户角色未变更` }
      );
      
    } catch (error) {
      console.error('Batch role update error:', error);
      toast.error(addRole ? "批量添加管理员角色失败" : "批量移除管理员角色失败");
    } finally {
      setIsBatchProcessing(false);
    }
  };

  if (isLoading) {
    return <UserLoadingState />;
  }

  const hasFilterApplied = !!(
    activeFilters?.status || 
    activeFilters?.role || 
    activeFilters?.dateRange?.from || 
    activeFilters?.dateRange?.to
  );

  if (!users || users.length === 0) {
    return (
      <Table>
        <UserListHeader 
          sortConfig={sortConfig} 
          onSortChange={onSortChange} 
          allSelected={false}
          onSelectAll={() => {}}
          hasUsers={false}
        />
        <TableBody>
          <UserEmptyState filterActive={hasFilterApplied} />
        </TableBody>
      </Table>
    );
  }

  const allSelected = users.length > 0 && selectedUsers.size === users.length;

  return (
    <div className="flex flex-col">
      <div className="rounded-10 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-auto">
        <div className="min-w-[1150px]">
          <Table>
            <UserListHeader 
              sortConfig={sortConfig} 
              onSortChange={onSortChange} 
              allSelected={allSelected}
              onSelectAll={handleSelectAll}
              hasUsers={users.length > 0}
            />
            <TableBody>
              {users.map(user => (
                <UserRow
                  key={user.id}
                  user={user}
                  isHighlighted={updatedUserIds.has(user.id)}
                  isUpdating={isUpdating}
                  onRoleChange={onRoleChange}
                  onStatusChange={onStatusChange}
                  selected={selectedUsers.has(user.id)}
                  onSelectChange={handleSelectUser}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <BatchActionToolbar
        selectedCount={selectedUsers.size}
        onClearSelection={handleClearSelection}
        onBatchEnable={() => batchSetUserStatus(true)}
        onBatchDisable={() => batchSetUserStatus(false)}
        onBatchSetAdmin={() => batchSetAdminRole(true)}
        onBatchRemoveAdmin={() => batchSetAdminRole(false)}
        isProcessing={isBatchProcessing}
      />
    </div>
  );
};
