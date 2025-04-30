
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
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { HomeworkSubmission } from "@/lib/services/homeworkSubmissionService";

interface HomeworkSubmissionListProps {
  submissions: HomeworkSubmission[];
  onViewSubmission?: (id: string) => void;
  currentPage?: number;
  totalSubmissions?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  filter?: string;
}

export function HomeworkSubmissionList({
  submissions = [],
  onViewSubmission = () => {},
  currentPage = 1,
  totalSubmissions = 0,
  onPageChange = () => {},
  isLoading = false,
  filter = 'all',
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
  
  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'reviewed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            已批阅
          </Badge>
        );
      case 'excellent':
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            优秀
          </Badge>
        );
      case 'needs_improvement':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            需改进
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            待批阅
          </Badge>
        );
    }
  };
  
  // Filter submissions based on the selected tab
  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : submissions.filter(submission => submission.status === filter);
  
  if (isLoading) {
    return <div className="py-8 text-center">加载中...</div>;
  }
  
  return (
    <div className="space-y-4">
      {filteredSubmissions.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">学员</TableHead>
                <TableHead>作业</TableHead>
                <TableHead className="w-[150px]">提交时间</TableHead>
                <TableHead className="w-[100px]">状态</TableHead>
                <TableHead className="w-[80px]">得分</TableHead>
                <TableHead className="w-[80px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="align-top">
                    <div>
                      <div>{submission.user_name || '未命名用户'}</div>
                      <div className="text-sm text-gray-500">{submission.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{submission.homework?.title || '未命名作业'}</div>
                    <div className="text-sm text-gray-500">
                      {submission.homework?.type === 'single_choice' && '单选题'}
                      {submission.homework?.type === 'multiple_choice' && '多选题'}
                      {submission.homework?.type === 'fill_blank' && '填空题'}
                      {!submission.homework?.type && '其他类型'}
                    </div>
                    {submission.file_url && (
                      <div className="mt-1">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          附件
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatSubmissionDate(submission.submitted_at || submission.created_at)}
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(submission.status)}
                  </TableCell>
                  <TableCell>
                    {submission.score !== undefined && submission.score !== null ? `${submission.score}分` : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewSubmission(submission.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* 分页控件 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              共 {totalSubmissions} 条提交，当前显示第 {currentPage} 页
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Select
                value={currentPage.toString()}
                onValueChange={(value) => onPageChange(parseInt(value))}
              >
                <SelectTrigger className="w-16">
                  <SelectValue placeholder={currentPage.toString()} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <SelectItem key={page} value={page.toString()}>
                      {page}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">暂无作业提交</h3>
          <p className="text-gray-500">
            此课程暂时没有学员提交作业
          </p>
        </div>
      )}
    </div>
  );
}
