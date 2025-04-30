
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserWithRoles, UserRole, SortConfig } from '@/lib/types/user-types';
import { handleUserRolesQueryError } from '@/lib/supabaseUtils';
import { toast } from 'sonner';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import { format } from "date-fns";

interface UseUserManagementProps {
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  sortConfig: SortConfig;
  filters?: {
    status: string | null;
    role: string | null;
    dateRange: {
      from: Date | null;
      to: Date | null;
    } | null;
  };
}

interface UseUserManagementReturn {
  users: UserWithRoles[] | undefined;
  isLoading: boolean;
  refetch: () => Promise<void>;
  totalUsers: number;
  setTotalUsers: (count: number) => void;
  updatedUserIds: Set<string>;
  isUpdating: boolean;
  handleRoleChange: (userId: string, role: UserRole, hasRole: boolean) => Promise<void>;
  toggleUserStatus: (userId: string, isCurrentlyActive: boolean) => Promise<void>;
  exportUsersToExcel: () => void;
}

// Define the auth user type to match the Supabase admin API response
interface AuthUser {
  id: string;
  email: string;
  last_sign_in_at: string | null;
  created_at: string;
  raw_app_meta_data: {
    provider?: string;
    providers?: string[];
  };
  // Add other properties as needed
}

interface AdminUsersResponse {
  users: AuthUser[];
  total: number;
}

export const useUserManagement = ({
  searchQuery,
  currentPage,
  pageSize,
  sortConfig,
  filters = {
    status: null,
    role: null,
    dateRange: null
  }
}: UseUserManagementProps): UseUserManagementReturn => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [updatedUserIds, setUpdatedUserIds] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState("");
  const realtimeSubscribed = useRef(false);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      console.log("Fetching user data with filters:", { searchQuery, sortConfig, filters });
      
      let countQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (searchQuery) {
        countQuery = countQuery.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }
      
      // Apply filters to count query
      if (filters.status === 'active') {
        countQuery = countQuery.eq('is_active', true);
      } else if (filters.status === 'inactive') {
        countQuery = countQuery.eq('is_active', false);
      }
      
      if (filters.dateRange?.from) {
        countQuery = countQuery.gte('registration_date', filters.dateRange.from.toISOString());
      }
      
      if (filters.dateRange?.to) {
        // Add one day to include the end date fully
        const endDate = new Date(filters.dateRange.to);
        endDate.setDate(endDate.getDate() + 1);
        countQuery = countQuery.lt('registration_date', endDate.toISOString());
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        console.error("Error getting count:", countError);
        throw countError;
      }
      
      setTotalUsers(count || 0);
      
      // 获取用户基本信息，根据排序配置和筛选条件排序
      let profilesQuery = supabase
        .from('profiles')
        .select('*');

      // 根据排序字段设置排序方式
      if (sortConfig.field === 'registration_date') {
        profilesQuery = profilesQuery.order('registration_date', { ascending: sortConfig.direction === 'asc' });
      } else if (sortConfig.field === 'is_active') {
        // 状态排序 - 先按状态排序，然后按注册时间排序
        profilesQuery = profilesQuery
          .order('is_active', { ascending: sortConfig.direction === 'asc' })
          .order('registration_date', { ascending: false });
      } else {
        // 对于其他排序类型，先获取所有数据，后续在内存中处理
        profilesQuery = profilesQuery.order('registration_date', { ascending: false });
      }

      if (searchQuery) {
        profilesQuery = profilesQuery.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }
      
      // Apply filters to profiles query
      if (filters.status === 'active') {
        profilesQuery = profilesQuery.eq('is_active', true);
      } else if (filters.status === 'inactive') {
        profilesQuery = profilesQuery.eq('is_active', false);
      }
      
      if (filters.dateRange?.from) {
        profilesQuery = profilesQuery.gte('registration_date', filters.dateRange.from.toISOString());
      }
      
      if (filters.dateRange?.to) {
        // Add one day to include the end date fully
        const endDate = new Date(filters.dateRange.to);
        endDate.setDate(endDate.getDate() + 1);
        profilesQuery = profilesQuery.lt('registration_date', endDate.toISOString());
      }

      // 应用分页
      profilesQuery = profilesQuery.range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      const { data: profiles, error: profilesError } = await profilesQuery;
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Profiles retrieved:", profiles?.length || 0);
      
      if (!profiles || profiles.length === 0) {
        return [];
      }
      
      // 获取用户最后登录时间和登录方式（从auth.users表）
      // Fix for TypeScript error - use type assertion to handle the mismatch
      const adminUsersResult = await supabase.auth.admin.listUsers({
        perPage: profiles.length,
        page: 1
      });
      
      // Extract data with proper type checking
      const authUsers = adminUsersResult.data as unknown as AdminUsersResponse | null;
      const authError = adminUsersResult.error;
      
      if (authError) {
        console.error("Error fetching auth users:", authError);
        // 继续执行，不阻止显示用户列表
      }
      
      // 创建用户ID到最后登录时间和登录方式的映射
      const userAuthData: Record<string, { lastLogin: string | null, loginMethod: string | null }> = {};
      if (authUsers?.users) {
        authUsers.users.forEach(user => {
          // 确定登录方式
          let loginMethod: string | null = null;
          
          if (user.raw_app_meta_data) {
            if (user.raw_app_meta_data.providers && user.raw_app_meta_data.providers.length > 0) {
              // 如果有多个登录方式，使用第一个
              loginMethod = user.raw_app_meta_data.providers[0];
            } else if (user.raw_app_meta_data.provider) {
              // 单一登录方式
              loginMethod = user.raw_app_meta_data.provider;
            } else {
              // 如果没有provider信息，默认为邮箱登录
              loginMethod = 'email';
            }
          }
          
          userAuthData[user.id] = {
            lastLogin: user.last_sign_in_at,
            loginMethod: loginMethod
          };
        });
      }
      
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      const processedRoles = handleUserRolesQueryError(userRoles, rolesError);
      
      console.log("User roles retrieved:", processedRoles?.length || 0);
      
      let usersWithRoles: UserWithRoles[] = profiles.map(profile => {
        const userRolesList = processedRoles?.filter(r => (r as any).user_id === profile.id) || [];
        const authData = userAuthData[profile.id] || { lastLogin: null, loginMethod: null };
        
        return {
          ...profile,
          roles: userRolesList.map(r => (r as any).role),
          is_active: profile.is_active ?? true,
          last_login_at: authData.lastLogin || null,
          login_method: authData.loginMethod
        };
      });

      // Handle additional filters that need to be processed after fetching data
      if (filters.role === 'admin') {
        usersWithRoles = usersWithRoles.filter(user => 
          user.roles?.includes('admin')
        );
      }

      // 对于特殊的排序字段，在内存中处理排序
      if (sortConfig.field === 'roles') {
        // 角色排序 - 先按角色（管理员在前）排序，然后按注册时间排序
        usersWithRoles.sort((a, b) => {
          const aIsAdmin = a.roles?.includes('admin') || false;
          const bIsAdmin = b.roles?.includes('admin') || false;
          
          if (sortConfig.direction === 'asc') {
            // 升序：非管理员在前
            if (aIsAdmin !== bIsAdmin) return aIsAdmin ? 1 : -1;
          } else {
            // 降序：管理员在前
            if (aIsAdmin !== bIsAdmin) return aIsAdmin ? -1 : 1;
          }
          
          // 角色相同时，按注册时间降序排序
          const dateA = new Date(a.registration_date || a.created_at).getTime();
          const dateB = new Date(b.registration_date || b.created_at).getTime();
          return dateB - dateA;
        });
      } else if (sortConfig.field === 'last_login_at') {
        // 最后登录时间排序
        usersWithRoles.sort((a, b) => {
          // 处理 null 值 - 将null放在最后
          if (!a.last_login_at && !b.last_login_at) return 0;
          if (!a.last_login_at) return 1;
          if (!b.last_login_at) return -1;
          
          const dateA = new Date(a.last_login_at).getTime();
          const dateB = new Date(b.last_login_at).getTime();
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        });
      } else if (sortConfig.field === 'login_method') {
        // 登录方式排序
        usersWithRoles.sort((a, b) => {
          // 处理 null 值 - 将null放在最后
          if (!a.login_method && !b.login_method) return 0;
          if (!a.login_method) return 1;
          if (!b.login_method) return -1;
          
          // 按登录方式字母顺序排序
          const methodComparison = (sortConfig.direction === 'asc' ? 1 : -1) * 
            a.login_method.localeCompare(b.login_method);
          
          // 如果登录方式相同，按注册时间降序排序
          if (methodComparison === 0) {
            const dateA = new Date(a.registration_date || a.created_at).getTime();
            const dateB = new Date(b.registration_date || b.created_at).getTime();
            return dateB - dateA;
          }
          
          return methodComparison;
        });
      }
      
      return usersWithRoles;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('获取用户列表失败');
      throw error;
    }
  };

  const { data: users, isLoading, refetch: queryRefetch } = useQuery({
    queryKey: [
      'admin-users', 
      searchQuery, 
      currentPage, 
      pageSize, 
      sortConfig.field, 
      sortConfig.direction,
      filters.status,
      filters.role,
      filters.dateRange?.from?.toISOString(),
      filters.dateRange?.to?.toISOString()
    ],
    queryFn: fetchUsers,
    staleTime: 30 * 1000,
  });

  // Refetch wrapper for type compatibility
  const refetch = async () => {
    await queryRefetch();
  };

  // Set up realtime subscriptions
  useEffect(() => {
    if (realtimeSubscribed.current) return;

    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        (payload: RealtimePostgresChangesPayload<{[key: string]: any}>) => {
          console.log('Profile change detected:', payload);
          // Mark the user as updated so we can highlight it
          const newData = payload.new as { id: string };
          if (newData && newData.id) {
            setUpdatedUserIds(prev => new Set(prev).add(newData.id));
            setTimeout(() => {
              setUpdatedUserIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(newData.id);
                return newSet;
              });
            }, 3000); // Remove highlight after 3 seconds
          }
          refetch();
        }
      )
      .subscribe();

    const rolesChannel = supabase
      .channel('user-roles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'user_roles' }, 
        (payload: RealtimePostgresChangesPayload<{[key: string]: any}>) => {
          console.log('User role change detected:', payload);
          // Mark the user as updated so we can highlight it
          const newData = payload.new as { user_id: string };
          if (newData && newData.user_id) {
            setUpdatedUserIds(prev => new Set(prev).add(newData.user_id));
            setTimeout(() => {
              setUpdatedUserIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(newData.user_id);
                return newSet;
              });
            }, 3000); // Remove highlight after 3 seconds
          }
          refetch();
        }
      )
      .subscribe();

    realtimeSubscribed.current = true;

    // Cleanup function to remove channels
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(rolesChannel);
      realtimeSubscribed.current = false;
    };
  }, []);

  const handleRoleChange = async (userId: string, role: UserRole, hasRole: boolean) => {
    try {
      setIsUpdating(true);
      setUpdatingUserId(userId);
      
      if (hasRole) {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
          
        if (error) {
          console.error("Error removing role:", error);
          toast.error('移除角色失败');
          return;
        }
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: role
          });
          
        if (error) {
          console.error("Error adding role:", error);
          toast.error('添加角色失败');
          return;
        }
      }
      
      toast.success(hasRole ? `已移除${role === 'admin' ? '管理员' : '用户'}角色` : `已设置为${role === 'admin' ? '管理员' : '用户'}`);
      
      // The refetch will happen automatically via realtime subscription
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("更新角色失败");
    } finally {
      setIsUpdating(false);
      setUpdatingUserId("");
    }
  };

  const toggleUserStatus = async (userId: string, isCurrentlyActive: boolean) => {
    try {
      setIsUpdating(true);
      setUpdatingUserId(userId);
      
      // 1. 更新用户状态 - 注意这里传递的是当前状态，所以我们需要取反来改变它
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_active: !isCurrentlyActive 
        })
        .eq('id', userId);
      
      if (error) {
        console.error("Error updating user status:", error);
        toast.error('更新用户状态失败');
        return;
      }
      
      // 2. 获取此用户的详细信息以便在提示中显示
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();
      
      const userName = userData ? (userData.full_name || userData.email) : '用户';
      
      // 3. 根据操作类型显示不同的成功提示
      if (isCurrentlyActive) {
        toast.success(`用户 ${userName} 已禁用`, {
          description: "该用户现在无法登录系统"
        });
      } else {
        toast.success(`用户 ${userName} 已启用`, {
          description: "该用户现在可以正常登录系统"
        });
      }
      
      // Manually trigger a refetch to ensure UI is in sync with database state
      await refetch();
      
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error("更新用户状态失败");
    } finally {
      setIsUpdating(false);
      setUpdatingUserId("");
    }
  };

  const exportUsersToExcel = async () => {
    try {
      toast.info("正在准备导出数据...");
      
      // First get all filtered users 
      let exportQuery = supabase
        .from('profiles')
        .select('*');
      
      // Apply the same filters as the current view
      if (searchQuery) {
        exportQuery = exportQuery.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }
      
      if (filters.status === 'active') {
        exportQuery = exportQuery.eq('is_active', true);
      } else if (filters.status === 'inactive') {
        exportQuery = exportQuery.eq('is_active', false);
      }
      
      if (filters.dateRange?.from) {
        exportQuery = exportQuery.gte('registration_date', filters.dateRange.from.toISOString());
      }
      
      if (filters.dateRange?.to) {
        const endDate = new Date(filters.dateRange.to);
        endDate.setDate(endDate.getDate() + 1);
        exportQuery = exportQuery.lt('registration_date', endDate.toISOString());
      }
      
      const { data: profiles, error: profilesError } = await exportQuery;
      
      if (profilesError) {
        throw profilesError;
      }
      
      if (!profiles || profiles.length === 0) {
        toast.error("没有可导出的用户数据");
        return;
      }
      
      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      const processedRoles = handleUserRolesQueryError(userRoles, rolesError);
      
      // Get auth user data
      const adminUsersResult = await supabase.auth.admin.listUsers({
        perPage: 1000 // Adjust as needed for your user base
      });
      
      const authUsers = adminUsersResult.data as unknown as AdminUsersResponse | null;
      
      // Create auth data map
      const userAuthData: Record<string, { lastLogin: string | null, loginMethod: string | null }> = {};
      if (authUsers?.users) {
        authUsers.users.forEach(user => {
          let loginMethod: string | null = null;
          
          if (user.raw_app_meta_data) {
            if (user.raw_app_meta_data.providers && user.raw_app_meta_data.providers.length > 0) {
              loginMethod = user.raw_app_meta_data.providers[0];
            } else if (user.raw_app_meta_data.provider) {
              loginMethod = user.raw_app_meta_data.provider;
            } else {
              loginMethod = 'email';
            }
          }
          
          userAuthData[user.id] = {
            lastLogin: user.last_sign_in_at,
            loginMethod: loginMethod
          };
        });
      }
      
      // Process users for export
      const exportData = profiles.map((profile: any) => {
        const userRolesList = processedRoles?.filter((r: any) => r.user_id === profile.id) || [];
        const authData = userAuthData[profile.id] || { lastLogin: null, loginMethod: null };
        
        return {
          "用户名": profile.full_name || profile.email?.split('@')[0] || '未知用户',
          "邮箱": profile.email || '未设置',
          "角色": userRolesList.map((r: any) => r.role === 'admin' ? '管理员' : '普通用户').join(', ') || '普通用户',
          "状态": profile.is_active !== false ? '正常' : '已禁用',
          "注册时间": format(new Date(profile.registration_date || profile.created_at), 'yyyy-MM-dd HH:mm'),
          "最后登录时间": authData.lastLogin ? format(new Date(authData.lastLogin), 'yyyy-MM-dd HH:mm') : '从未登录',
          "登录方式": authData.loginMethod ? 
            authData.loginMethod.charAt(0).toUpperCase() + authData.loginMethod.slice(1) : 
            '未知'
        };
      });
      
      // Create Excel file
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '用户列表');
      
      // Apply filter description to the filename
      let filterDesc = '';
      if (filters.status) filterDesc += `_${filters.status}`;
      if (filters.role) filterDesc += `_${filters.role}`;
      if (searchQuery) filterDesc += '_搜索结果';
      
      // Generate Excel file
      XLSX.writeFile(workbook, `用户列表${filterDesc}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
      
      toast.success(`成功导出 ${profiles.length} 个用户数据`);
      
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error("导出Excel文件时发生错误");
    }
  };

  return {
    users,
    isLoading,
    refetch,
    totalUsers,
    setTotalUsers,
    updatedUserIds,
    isUpdating: isUpdating || !!updatingUserId,
    handleRoleChange,
    toggleUserStatus,
    exportUsersToExcel
  };
};
