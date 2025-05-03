import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserWithRoles, UserRole, SortConfig } from '@/lib/types/user-types';
import { handleUserRolesQueryError, userRolesService } from '@/lib/supabaseUtils';
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

  const fetchUsers = async () => {
    try {
      console.log("Fetching user data with filters:", { searchQuery, sortConfig, filters });
      
      let countQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (searchQuery) {
        countQuery = countQuery.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }
      
      if (filters.status === 'active') {
        countQuery = countQuery.eq('is_active', true);
      } else if (filters.status === 'inactive') {
        countQuery = countQuery.eq('is_active', false);
      }
      
      if (filters.dateRange?.from) {
        countQuery = countQuery.gte('registration_date', filters.dateRange.from.toISOString());
      }
      
      if (filters.dateRange?.to) {
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
      
      let profilesQuery = supabase
        .from('profiles')
        .select('*');

      if (sortConfig.field === 'registration_date') {
        profilesQuery = profilesQuery.order('registration_date', { ascending: sortConfig.direction === 'asc' });
      } else if (sortConfig.field === 'is_active') {
        profilesQuery = profilesQuery
          .order('is_active', { ascending: sortConfig.direction === 'asc' })
          .order('registration_date', { ascending: false });
      } else {
        profilesQuery = profilesQuery.order('registration_date', { ascending: false });
      }

      if (searchQuery) {
        profilesQuery = profilesQuery.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);
      }
      
      if (filters.status === 'active') {
        profilesQuery = profilesQuery.eq('is_active', true);
      } else if (filters.status === 'inactive') {
        profilesQuery = profilesQuery.eq('is_active', false);
      }
      
      if (filters.dateRange?.from) {
        profilesQuery = profilesQuery.gte('registration_date', filters.dateRange.from.toISOString());
      }
      
      if (filters.dateRange?.to) {
        const endDate = new Date(filters.dateRange.to);
        endDate.setDate(endDate.getDate() + 1);
        profilesQuery = profilesQuery.lt('registration_date', endDate.toISOString());
      }

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
      
      const adminUsersResult = await supabase.auth.admin.listUsers({
        perPage: profiles.length,
        page: 1
      });
      
      const authUsers = adminUsersResult.data as unknown as AdminUsersResponse | null;
      const authError = adminUsersResult.error;
      
      if (authError) {
        console.error("Error fetching auth users:", authError);
        // 继续执行，不阻止显示用户列表
      }
      
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
      
      const userRoles = await userRolesService.getAll();
      
      let usersWithRoles: UserWithRoles[] = profiles.map(profile => {
        const userRolesList = userRoles?.filter(r => r.user_id === profile.id) || [];
        const authData = userAuthData[profile.id] || { lastLogin: null, loginMethod: null };
        
        return {
          ...profile,
          roles: userRolesList.map(r => r.role),
          is_active: profile.is_active ?? true,
          last_login_at: authData.lastLogin || null,
          login_method: authData.loginMethod
        };
      });

      if (filters.role === 'admin') {
        usersWithRoles = usersWithRoles.filter(user => 
          user.roles?.includes('admin')
        );
      }

      if (sortConfig.field === 'roles') {
        usersWithRoles.sort((a, b) => {
          const aIsAdmin = a.roles?.includes('admin') || false;
          const bIsAdmin = b.roles?.includes('admin') || false;
          
          if (sortConfig.direction === 'asc') {
            if (aIsAdmin !== bIsAdmin) return aIsAdmin ? 1 : -1;
          } else {
            if (aIsAdmin !== bIsAdmin) return aIsAdmin ? -1 : 1;
          }
          
          const dateA = new Date(a.registration_date || a.created_at).getTime();
          const dateB = new Date(b.registration_date || b.created_at).getTime();
          return dateB - dateA;
        });
      } else if (sortConfig.field === 'last_login_at') {
        usersWithRoles.sort((a, b) => {
          if (!a.last_login_at && !b.last_login_at) return 0;
          if (!a.last_login_at) return 1;
          if (!b.last_login_at) return -1;
          
          const dateA = new Date(a.last_login_at).getTime();
          const dateB = new Date(b.last_login_at).getTime();
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        });
      } else if (sortConfig.field === 'login_method') {
        usersWithRoles.sort((a, b) => {
          if (!a.login_method && !b.login_method) return 0;
          if (!a.login_method) return 1;
          if (!b.login_method) return -1;
          
          const methodComparison = (sortConfig.direction === 'asc' ? 1 : -1) * 
            a.login_method.localeCompare(b.login_method);
          
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

  const refetch = async () => {
    await queryRefetch();
  };

  useEffect(() => {
    if (realtimeSubscribed.current) return;

    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' }, 
        (payload: RealtimePostgresChangesPayload<{[key: string]: any}>) => {
          console.log('Profile change detected:', payload);
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
        const { error } = await userRolesService.removeRole(userId, role);
          
        if (error) {
          console.error("Error removing role:", error);
          toast.error('移除角色失败');
          return;
        }
      } else {
        const { error } = await userRolesService.addRole(userId, role);
          
        if (error) {
          console.error("Error adding role:", error);
          toast.error('添加角色失败');
          return;
        }
      }
      
      toast.success(hasRole ? `已移除${role === 'admin' ? '管理员' : '用户'}角色` : `已设置为${role === 'admin' ? '管理员' : '用户'}`);
      
      setIsUpdating(false);
      setUpdatingUserId("");
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("更新角色失败");
    }
  };

  const toggleUserStatus = async (userId: string, isCurrentlyActive: boolean) => {
    try {
      setIsUpdating(true);
      setUpdatingUserId(userId);
      
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
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();
      
      const userName = userData ? (userData.full_name || userData.email) : '用户';
      
      if (isCurrentlyActive) {
        toast.success(`用户 ${userName} 已禁用`, {
          description: "该用户现在无法登录系统"
        });
      } else {
        toast.success(`用户 ${userName} 已启用`, {
          description: "该用户现在可以正常登录系统"
        });
      }
      
      await refetch();
      
      setIsUpdating(false);
      setUpdatingUserId("");
    } catch (error) {
      console.error("Failed to update user status:", error);
      toast.error("更新用户状态失败");
    }
  };

  const exportUsersToExcel = async () => {
    try {
      toast.info("正在准备导出数据...");
      
      let exportQuery = supabase
        .from('profiles')
        .select('*');
      
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
      
      const userRoles = await userRolesService.getAll();
      
      const adminUsersResult = await supabase.auth.admin.listUsers({
        perPage: 1000 // Adjust as needed for your user base
      });
      
      const authUsers = adminUsersResult.data as unknown as AdminUsersResponse | null;
      
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
      
      const exportData = profiles.map((profile: any) => {
        const userRolesList = userRoles?.filter((r) => r.user_id === profile.id) || [];
        const authData = userAuthData[profile.id] || { lastLogin: null, loginMethod: null };
        
        return {
          "用户名": profile.full_name || profile.email?.split('@')[0] || '未知用户',
          "邮箱": profile.email || '未设置',
          "角色": userRolesList.map((r) => r.role === 'admin' ? '管理员' : '普通用户').join(', ') || '普通用户',
          "状态": profile.is_active !== false ? '正常' : '已禁用',
          "注册时间": format(new Date(profile.registration_date || profile.created_at), 'yyyy-MM-dd HH:mm'),
          "最后登录时间": authData.lastLogin ? format(new Date(authData.lastLogin), 'yyyy-MM-dd HH:mm') : '从未登录',
          "登录方式": authData.loginMethod ? 
            authData.loginMethod.charAt(0).toUpperCase() + authData.loginMethod.slice(1) : 
            '未知'
        };
      });
      
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '用户列表');
      
      let filterDesc = '';
      if (filters.status) filterDesc += `_${filters.status}`;
      if (filters.role) filterDesc += `_${filters.role}`;
      if (searchQuery) filterDesc += '_搜索结果';
      
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
