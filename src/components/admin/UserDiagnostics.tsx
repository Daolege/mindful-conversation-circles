
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, SearchIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UserDiagnosticsProps {
  currentListCount: number;
  totalUsersInState: number;
  activeFilters?: {
    status: string | null;
    role: string | null;
    dateRange: {
      from: Date | null;
      to: Date | null;
    } | null;
  };
}

export const UserDiagnostics = ({ currentListCount, totalUsersInState, activeFilters }: UserDiagnosticsProps) => {
  const [actualCount, setActualCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const isMobile = useIsMobile();

  const checkUserCount = async () => {
    try {
      setIsLoading(true);
      
      // 直接查询profiles表中的总用户数
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        throw error;
      }
      
      setActualCount(count || 0);
      
      if (count !== totalUsersInState) {
        toast.warning(`检测到用户数量不一致！数据库中有 ${count} 位用户，但状态中显示 ${totalUsersInState} 位用户`);
      } else {
        toast.success(`用户数量一致：数据库中有 ${count} 位用户`);
      }
    } catch (error) {
      console.error('检查用户数量时出错:', error);
      toast.error('无法获取实际用户数量');
    } finally {
      setIsLoading(false);
    }
  };

  const searchForUser = async () => {
    if (!searchEmail.trim()) {
      toast.error('请输入要搜索的邮箱');
      return;
    }
    
    try {
      setSearchLoading(true);
      setFoundUser(null);
      
      // 1. 检查 profiles 表
      const { data: profileUser, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', searchEmail.trim())
        .maybeSingle();
      
      // 2. 检查 user_roles 表
      const { data: userRoles, error: rolesError } = profileUser ? 
        await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', profileUser.id) : 
        { data: null, error: null };
      
      if (profileError) {
        console.error('搜索 profiles 表时出错:', profileError);
      }
      
      if (rolesError) {
        console.error('搜索 user_roles 表时出错:', rolesError);
      }
      
      // 组合结果
      if (profileUser) {
        setFoundUser({
          ...profileUser,
          roles: userRoles || [],
          exists_in_profiles: true
        });
        toast.success(`找到用户: ${searchEmail}`);
      } else {
        toast.error(`未找到用户: ${searchEmail}`);
        setFoundUser({
          email: searchEmail,
          exists_in_profiles: false
        });
      }
    } catch (error) {
      console.error('搜索用户时出错:', error);
      toast.error('搜索用户时发生错误');
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <Card className={`p-4 mb-6 bg-gray-50 shadow-sm border-gray-200 rounded-10 ${isMobile ? 'text-sm' : ''}`}>
      <h3 className="text-lg font-semibold mb-3 text-gray-800">用户数据诊断</h3>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">当前显示用户数</div>
          <div className="font-medium">{currentListCount || 0} / {totalUsersInState || 0}</div>
        </div>
        
        <div className="flex-1">
          <div className="text-sm text-gray-500 mb-1">数据库实际用户数</div>
          <div className="font-medium">{actualCount !== null ? actualCount : '未检查'}</div>
        </div>
        
        <Button 
          onClick={checkUserCount} 
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="min-w-[120px] bg-white hover:bg-gray-50 border-gray-300 rounded-10"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              检查中
            </>
          ) : (
            '检查用户数量'
          )}
        </Button>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-md font-medium mb-3 text-gray-700">查找特定用户</h4>
        <div className="flex gap-2">
          <Input
            placeholder="输入要查找的邮箱地址"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className="flex-1 border-gray-300 focus:border-gray-500 rounded-10"
          />
          <Button
            onClick={searchForUser}
            disabled={searchLoading}
            variant="outline"
            className="bg-white hover:bg-gray-50 border-gray-300 rounded-10"
          >
            {searchLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                搜索中
              </>
            ) : (
              <>
                <SearchIcon className="mr-2 h-4 w-4" />
                查找
              </>
            )}
          </Button>
        </div>
        
        {foundUser && (
          <div className="mt-4 bg-gray-100 p-4 rounded-10 border border-gray-200">
            <h5 className="font-medium mb-2 text-gray-800">搜索结果</h5>
            {foundUser.exists_in_profiles ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-sm text-gray-500">用户ID:</span> 
                    <div className="text-xs bg-gray-200 p-1.5 rounded-10 overflow-auto border border-gray-300">{foundUser.id}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">邮箱:</span> 
                    <div className="font-medium">{foundUser.email || '未设置'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">姓名:</span> 
                    <div>{foundUser.full_name || '未设置'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">状态:</span> 
                    <div className="flex items-center">
                      <span className={`inline-flex h-2 w-2 rounded-full mr-1.5 ${foundUser.is_active !== false ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {foundUser.is_active !== false ? '正常' : '已禁用'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">注册时间:</span> 
                    <div>{foundUser.registration_date ? new Date(foundUser.registration_date).toLocaleString() : '未知'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">角色:</span> 
                    <div className="flex flex-wrap gap-1 mt-1">
                      {foundUser.roles && foundUser.roles.length > 0 ? 
                        foundUser.roles.map((r: any) => (
                          <span 
                            key={r.role} 
                            className={`px-1.5 py-0.5 text-xs rounded-10 ${r.role === 'admin' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}
                          >
                            {r.role === 'admin' ? '管理员' : r.role}
                          </span>
                        )) : 
                        <span className="px-1.5 py-0.5 text-xs rounded-10 bg-gray-200 text-gray-700">普通用户</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-red-500">
                <span className="inline-flex h-2 w-2 rounded-full mr-2 bg-red-500"></span>
                用户"{foundUser.email}"在profiles表中不存在
              </div>
            )}
          </div>
        )}
        
        {activeFilters && (Object.values(activeFilters).some(v => v !== null)) && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h4 className="text-md font-medium mb-2 text-gray-700">当前活动筛选器</h4>
            <div className="space-y-1.5 p-3 bg-gray-100 rounded-10 border border-gray-200">
              {activeFilters.status && (
                <div className="flex gap-2">
                  <span className="text-sm text-gray-500 min-w-[80px]">状态:</span>
                  <span className={`px-1.5 py-0.5 text-xs rounded-10 inline-flex items-center ${activeFilters.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${activeFilters.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {activeFilters.status === 'active' ? '活跃用户' : '已禁用用户'}
                  </span>
                </div>
              )}
              {activeFilters.role && (
                <div className="flex gap-2">
                  <span className="text-sm text-gray-500 min-w-[80px]">角色:</span>
                  <span className={`px-1.5 py-0.5 text-xs rounded-10 ${activeFilters.role === 'admin' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {activeFilters.role === 'admin' ? '管理员' : '普通用户'}
                  </span>
                </div>
              )}
              {activeFilters.dateRange?.from && (
                <div className="flex gap-2">
                  <span className="text-sm text-gray-500 min-w-[80px]">起始日期:</span>
                  <span className="text-sm">{activeFilters.dateRange.from.toLocaleDateString()}</span>
                </div>
              )}
              {activeFilters.dateRange?.to && (
                <div className="flex gap-2">
                  <span className="text-sm text-gray-500 min-w-[80px]">结束日期:</span>
                  <span className="text-sm">{activeFilters.dateRange.to.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
