
import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useUserManagement } from "@/hooks/useUserManagement";
import { UserFilters } from "./UserFilters";
import { UserList } from "./UserList";
import { UserPagination } from "./UserPagination";
import { UserDiagnostics } from "./user/UserDiagnostics";
import { SortField, SortConfig } from "@/lib/types/user-types";
import { useMediaQuery } from "@/hooks/use-mobile";

export const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'registration_date',
    direction: 'desc'
  });
  const [activeFilters, setActiveFilters] = useState<{
    status: string | null;
    role: string | null;
    dateRange: {
      from: Date | null;
      to: Date | null;
    } | null;
  }>({
    status: null,
    role: null,
    dateRange: null
  });

  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters]);

  const {
    users,
    isLoading,
    totalUsers,
    refetch,
    updatedUserIds,
    isUpdating,
    handleRoleChange,
    toggleUserStatus,
    exportUsersToExcel
  } = useUserManagement({
    searchQuery,
    currentPage,
    pageSize,
    sortConfig,
    filters: activeFilters
  });

  const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    document.querySelector('.user-management-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSortChange = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: 
        prevConfig.field === field
          ? prevConfig.direction === 'asc'
            ? 'desc'
            : 'asc'
          : 'desc'
    }));
    setCurrentPage(1); // Reset to first page when changing sort
  };

  return (
    <div className="space-y-6 relative animate-in fade-in duration-300">
      <UserFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onToggleDiagnostics={() => setShowDiagnostics(prev => !prev)}
        showDiagnostics={showDiagnostics}
        onExportExcel={exportUsersToExcel}
        activeFilters={activeFilters}
        setActiveFilters={setActiveFilters}
      />

      {showDiagnostics && (
        <UserDiagnostics
          currentListCount={users?.length || 0}
          totalUsersInState={totalUsers}
          activeFilters={activeFilters}
        />
      )}

      <Card className="overflow-hidden shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-300 user-management-table rounded-10">
        <div className={`${isMobile ? 'p-2' : 'p-4'} overflow-hidden`}>
          <div style={{ height: 'calc(100vh - 400px)', overflow: 'auto' }}>
            <UserList
              users={users}
              isLoading={isLoading}
              updatedUserIds={updatedUserIds}
              isUpdating={isUpdating}
              onRoleChange={handleRoleChange}
              onStatusChange={toggleUserStatus}
              sortConfig={sortConfig}
              onSortChange={handleSortChange}
              activeFilters={activeFilters}
            />
          </div>
        </div>

        {totalPages > 0 && (
          <UserPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalUsers={totalUsers}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </Card>
    </div>
  );
};
