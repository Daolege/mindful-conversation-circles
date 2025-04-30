
import React from "react";
import { Search } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";

export const UserEmptyState: React.FC<{ filterActive: boolean }> = ({ filterActive }) => {
  return (
    <TableRow>
      <TableCell colSpan={9} className="text-center py-16 text-gray-500">
        <div className="flex flex-col items-center">
          <Search className="h-12 w-12 text-gray-300 mb-3" />
          <p className="text-lg font-medium">
            {filterActive ? '没有找到匹配的用户' : '暂无用户数据'}
          </p>
          <p className="text-sm text-gray-400">
            {filterActive ? '尝试使用不同的搜索条件或清除筛选器' : '系统中还没有注册用户'}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
};
