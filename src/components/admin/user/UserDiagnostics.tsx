
import React from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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

export const UserDiagnostics: React.FC<UserDiagnosticsProps> = ({
  currentListCount,
  totalUsersInState,
  activeFilters
}) => {
  return (
    <Card className="bg-gray-50 border border-gray-200 rounded-10 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-4 space-y-3">
        <CardTitle className="text-sm text-gray-500 flex items-center gap-2">
          <span>用户数据诊断</span>
          <Badge variant="outline" className="ml-2 font-mono bg-gray-100 rounded-10">DEV MODE</Badge>
        </CardTitle>
        <Separator className="bg-gray-200" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">当前显示记录数</p>
            <p className="text-lg font-mono">{currentListCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">总记录数</p>
            <p className="text-lg font-mono">{totalUsersInState}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">数据过滤率</p>
            <p className="text-lg font-mono">
              {totalUsersInState 
                ? (((totalUsersInState - currentListCount) / totalUsersInState) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>

        {activeFilters && (
          <>
            <Separator className="bg-gray-200" />
            <div>
              <p className="text-xs text-gray-500 mb-2">活动筛选器</p>
              <div className="flex flex-wrap gap-2">
                {activeFilters.status && (
                  <Badge variant="outline" className="bg-gray-100 text-xs rounded-10">
                    状态: {activeFilters.status === 'active' ? '活跃' : '禁用'}
                  </Badge>
                )}
                {activeFilters.role && (
                  <Badge variant="outline" className="bg-gray-100 text-xs rounded-10">
                    角色: {activeFilters.role === 'admin' ? '管理员' : '普通用户'}
                  </Badge>
                )}
                {activeFilters.dateRange?.from && (
                  <Badge variant="outline" className="bg-gray-100 text-xs rounded-10">
                    起始日期: {activeFilters.dateRange.from.toLocaleDateString()}
                  </Badge>
                )}
                {activeFilters.dateRange?.to && (
                  <Badge variant="outline" className="bg-gray-100 text-xs rounded-10">
                    结束日期: {activeFilters.dateRange.to.toLocaleDateString()}
                  </Badge>
                )}
                {!activeFilters.status && !activeFilters.role && !activeFilters.dateRange?.from && !activeFilters.dateRange?.to && (
                  <span className="text-xs text-gray-400">无活动筛选器</span>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
