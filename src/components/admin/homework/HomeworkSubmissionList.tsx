
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Download,
  Filter,
  User
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { HomeworkSubmission } from "@/lib/services/homeworkSubmissionService";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";

interface HomeworkSubmissionListProps {
  submissions: HomeworkSubmission[];
  onViewSubmission?: (id: string) => void;
  onViewStudent?: (id: string) => void;
  onExportSubmission?: (id: string) => void;
  currentPage?: number;
  totalSubmissions?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  filter?: string;
  onFilterChange?: (filter: string) => void;
  onSearchChange?: (search: string) => void;
  searchQuery?: string;
  selectedSubmissions?: string[];
  onSelectionChange?: (ids: string[]) => void;
  showBulkActions?: boolean;
  onBulkAction?: (action: string) => void;
}

export function HomeworkSubmissionList({
  submissions = [],
  onViewSubmission = () => {},
  onViewStudent = () => {},
  onExportSubmission = () => {},
  currentPage = 1,
  totalSubmissions = 0,
  onPageChange = () => {},
  isLoading = false,
  filter = 'all',
  onFilterChange = () => {},
  onSearchChange = () => {},
  searchQuery = '',
  selectedSubmissions = [],
  onSelectionChange = () => {},
  showBulkActions = false,
  onBulkAction = () => {},
}: HomeworkSubmissionListProps) {
  const pageSize = 10;
  const totalPages = Math.ceil(totalSubmissions / pageSize) || 1;
  
  const formatSubmissionDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch (err) {
      return '未知日期';
    }
  };
  
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-50">
            <Clock className="h-3 w-3" /> 待审核
          </Badge>
        );
      case 'reviewed':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
            <CheckCircle className="h-3 w-3" /> 已通过
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50">
            <AlertCircle className="h-3 w-3" /> 未通过
          </Badge>
        );
      default:
        return <Badge>未知状态</Badge>;
    }
  };
  
  const filteredSubmissions = submissions.filter(submission => {
    if (filter !== 'all') {
      return submission.status === filter;
    }
    return true;
  }).filter(submission => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (submission.user_name?.toLowerCase().includes(query)) ||
      (submission.user_email?.toLowerCase().includes(query)) ||
      (submission.content?.toLowerCase().includes(query))
    );
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(filteredSubmissions.map(s => s.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectSubmission = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedSubmissions, id]);
    } else {
      onSelectionChange(selectedSubmissions.filter(sid => sid !== id));
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[200px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="筛选状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有作业</SelectItem>
              <SelectItem value="pending">待审核</SelectItem>
              <SelectItem value="reviewed">已通过</SelectItem>
              <SelectItem value="rejected">未通过</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Input
              placeholder="搜索学生名或邮箱..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 w-full md:w-[250px]"
            />
            <Filter className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {showBulkActions && selectedSubmissions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              已选择 {selectedSubmissions.length} 项
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  批量操作
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onBulkAction('approve')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span>批量通过</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkAction('reject')}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <span>批量不通过</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkAction('export')}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>批量导出</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {filteredSubmissions.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                {showBulkActions && (
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={
                        selectedSubmissions.length > 0 && 
                        selectedSubmissions.length === filteredSubmissions.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>学生信息</TableHead>
                <TableHead>作业内容</TableHead>
                <TableHead className="hidden md:table-cell">提交时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  {showBulkActions && (
                    <TableCell>
                      <Checkbox 
                        checked={selectedSubmissions.includes(submission.id)}
                        onCheckedChange={(checked) => 
                          handleSelectSubmission(submission.id, checked as boolean)
                        }
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium">{submission.user_name}</div>
                      <div className="text-sm text-muted-foreground">{submission.user_email}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-8 w-8 p-0"
                        onClick={() => onViewStudent(submission.user_id)}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium truncate max-w-[200px]">
                        {submission.homework?.title || "未知作业"}
                      </div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {submission.content || (submission.file_url ? "包含文件附件" : "无内容")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatSubmissionDate(submission.submitted_at)}
                  </TableCell>
                  <TableCell>{renderStatusBadge(submission.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewSubmission(submission.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="sr-only md:not-sr-only md:inline-block">
                          查看
                        </span>
                      </Button>
                      {submission.file_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onExportSubmission(submission.id)}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">导出</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="border rounded-md p-8 text-center">
          <FileText className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            没有找到作业提交
          </h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "没有找到匹配的提交，请尝试不同的搜索关键词"
              : filter !== 'all'
              ? `没有${filter === 'pending' ? '待审核' : filter === 'reviewed' ? '已通过' : '未通过'}的作业提交`
              : "此课程暂无作业提交"}
          </p>
        </div>
      )}

      {filteredSubmissions.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default HomeworkSubmissionList;
