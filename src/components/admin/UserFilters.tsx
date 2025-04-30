
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, SettingsIcon, Filter, X, Calendar, User, UserX, Users } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface UserFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onToggleDiagnostics: () => void;
  showDiagnostics: boolean;
  onExportExcel: () => void;
  activeFilters: {
    status: string | null;
    role: string | null;
    dateRange: {
      from: Date | null;
      to: Date | null;
    } | null;
  };
  setActiveFilters: (filters: {
    status: string | null;
    role: string | null;
    dateRange: {
      from: Date | null;
      to: Date | null;
    } | null;
  }) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  onToggleDiagnostics,
  showDiagnostics,
  onExportExcel,
  activeFilters,
  setActiveFilters
}) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [date, setDate] = useState<{
    from: Date | null;
    to: Date | null;
  } | null>(activeFilters.dateRange);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery && !searchHistory.includes(searchQuery)) {
      setSearchHistory((prev) => [searchQuery, ...prev.slice(0, 4)]);
    }
  };

  const handleQuickFilter = (type: string, value: string | null) => {
    switch (type) {
      case 'status':
        setActiveFilters({
          ...activeFilters,
          status: value === activeFilters.status ? null : value
        });
        break;
      case 'role':
        setActiveFilters({
          ...activeFilters,
          role: value === activeFilters.role ? null : value
        });
        break;
      case 'dateRange':
        setActiveFilters({
          ...activeFilters,
          dateRange: value === null ? null : activeFilters.dateRange
        });
        break;
    }
  };

  const handleDateChange = (newDate: { from: Date | null; to: Date | null } | null) => {
    setDate(newDate);
    setActiveFilters({
      ...activeFilters,
      dateRange: newDate
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      status: null,
      role: null,
      dateRange: null
    });
    setDate(null);
    setSearchQuery('');
  };

  // Count active filters
  const activeFilterCount = [
    activeFilters.status,
    activeFilters.role,
    activeFilters.dateRange
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white border border-gray-200 rounded-10 shadow-sm mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">用户管理</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="搜索用户名或邮箱..."
              className="pl-10 pr-4 w-full rounded-10 border-gray-200 focus-visible:ring-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}

            {searchHistory.length > 0 && searchQuery === '' && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Calendar size={14} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0 rounded-10 border-gray-200" align="end">
                  <div className="p-2">
                    <p className="text-xs text-gray-500 mb-2">最近搜索</p>
                    {searchHistory.map((term, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left mb-1 rounded-10"
                        onClick={() => setSearchQuery(term)}
                      >
                        <Search className="h-3.5 w-3.5 mr-2 text-gray-500" />
                        {term}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </form>
          <Button 
            variant="outline"
            onClick={onToggleDiagnostics}
            className={`flex items-center gap-2 transition-colors duration-200 w-full sm:w-auto rounded-10 ${
              showDiagnostics ? 'bg-gray-100 border-gray-300' : 'hover:bg-gray-50'
            }`}
          >
            <SettingsIcon className="h-4 w-4" />
            {showDiagnostics ? '隐藏诊断' : '诊断工具'}
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={onExportExcel}
                  className="flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200 w-full sm:w-auto rounded-10"
                >
                  <Download className="h-4 w-4" />
                  导出Excel
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white rounded-10 border-gray-700">
                导出当前过滤后的用户列表为Excel文件
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Filter className="h-3.5 w-3.5" /> 快速筛选:
        </div>

        <div className="flex flex-wrap gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 px-3 gap-1.5 rounded-10 ${
                    activeFilters.status === 'active' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : ''
                  }`}
                  onClick={() => handleQuickFilter('status', 'active')}
                >
                  <User className="h-3.5 w-3.5" />
                  <span>活跃用户</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white rounded-10 border-gray-700">查看所有活跃用户</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 px-3 gap-1.5 rounded-10 ${
                    activeFilters.status === 'inactive' 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : ''
                  }`}
                  onClick={() => handleQuickFilter('status', 'inactive')}
                >
                  <UserX className="h-3.5 w-3.5" />
                  <span>禁用用户</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white rounded-10 border-gray-700">查看所有被禁用的用户</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 px-3 gap-1.5 rounded-10 ${
                    activeFilters.role === 'admin' 
                      ? 'bg-gray-700 text-white border-gray-800' 
                      : ''
                  }`}
                  onClick={() => handleQuickFilter('role', 'admin')}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>管理员</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 text-white rounded-10 border-gray-700">查看所有管理员用户</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`h-8 px-3 gap-1.5 rounded-10 ${
                  activeFilters.dateRange 
                    ? 'bg-gray-700 text-white border-gray-800' 
                    : ''
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>日期筛选</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-10 border-gray-200" align="start">
              <div className="p-3">
                <div className="space-y-2 mb-2">
                  <h4 className="font-medium text-sm">选择日期范围</h4>
                  <p className="text-xs text-gray-500">按注册时间过滤用户</p>
                </div>
                <CalendarComponent
                  mode="range"
                  selected={date}
                  onSelect={handleDateChange}
                  className="rounded border p-3 pointer-events-auto"
                />
                <div className="flex justify-between mt-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDateChange(null)}
                    className="rounded-10"
                  >
                    清除
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => document.body.click()}
                    className="rounded-10 bg-gray-800 hover:bg-gray-700"
                  >
                    应用
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-gray-600 rounded-10"
              onClick={clearAllFilters}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              清除筛选
              <Badge variant="outline" className="ml-1.5 bg-gray-100 text-gray-700 rounded-10">
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
