
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalUsers: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const UserPagination: React.FC<UserPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalUsers,
  onPageChange,
  onPageSizeChange
}) => {
  const getPaginationRange = () => {
    const delta = 1;
    
    let range = [];
    const rangeWithDots = [];
    
    if (totalPages <= 5) {
      range = Array.from({ length: totalPages }, (_, i) => i + 1);
      return range;
    }
    
    range.push(1);
    
    let start = Math.max(2, currentPage - delta);
    let end = Math.min(totalPages - 1, currentPage + delta);
    
    if (currentPage - delta > 2) {
      rangeWithDots.push('ellipsis-start');
    }
    
    for (let i = start; i <= end; i++) {
      rangeWithDots.push(i);
    }
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('ellipsis-end');
    }
    
    rangeWithDots.push(totalPages);
    
    return rangeWithDots;
  };

  return (
    <div className="py-6 px-6 border-t flex flex-wrap justify-between items-center gap-4 bg-white">
      <div className="order-2 sm:order-1">
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[140px] bg-white border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 transition-all duration-200">
            <SelectValue placeholder="每页显示条数" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 shadow-md animate-in fade-in-50 zoom-in-95 duration-200">
            <SelectItem value="10" className="text-sm">每页显示 10 条</SelectItem>
            <SelectItem value="30" className="text-sm">每页显示 30 条</SelectItem>
            <SelectItem value="50" className="text-sm">每页显示 50 条</SelectItem>
            <SelectItem value="100" className="text-sm">每页显示 100 条</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="order-1 sm:order-2 w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
        <span className="text-sm text-gray-500 whitespace-nowrap mr-2">
          共 {totalUsers} 条数据，当前第 {currentPage}/{totalPages} 页
        </span>
        
        <Pagination className="mx-auto sm:mx-0">
          <PaginationContent className="flex gap-1 items-center">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className={`${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200'}`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span>上一页</span>
              </PaginationPrevious>
            </PaginationItem>
            
            {getPaginationRange().map((page, index) => {
              if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              
              return (
                <PaginationItem key={`page-${page}`}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => onPageChange(page as number)}
                    className={`transition-all duration-200 ${
                      page === currentPage 
                        ? 'bg-primary text-white hover:bg-primary/90' 
                        : 'hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                className={`${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200'}`}
              >
                <span>下一页</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      
      <div className="order-3 sm:order-3 w-[140px] hidden sm:block">
        {/* Empty div for layout balance */}
      </div>
    </div>
  );
};
