
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HomeworkSubmission } from '@/lib/services/homeworkSubmissionService';
import { format } from 'date-fns';
import { 
  Eye, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  FilePdf
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentHomeworkListProps {
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  submissions: HomeworkSubmission[];
  isLoading: boolean;
  onViewSubmission: (id: string) => void;
  onExportPdf: (studentId: string) => void;
}

export const StudentHomeworkList: React.FC<StudentHomeworkListProps> = ({
  studentId,
  studentName = '未知学生',
  studentEmail = '',
  submissions = [],
  isLoading,
  onViewSubmission,
  onExportPdf
}) => {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const passedCount = submissions.filter(s => s.status === 'reviewed').length;
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{studentName}的作业提交</CardTitle>
          <CardDescription>
            {studentEmail}
            <div className="mt-2 flex gap-2">
              <Badge variant="outline" className="bg-slate-50">
                总作业: {submissions.length}
              </Badge>
              {pendingCount > 0 && (
                <Badge variant="outline" className="bg-amber-50">
                  待审核: {pendingCount}
                </Badge>
              )}
              {passedCount > 0 && (
                <Badge variant="outline" className="bg-green-50">
                  已通过: {passedCount}
                </Badge>
              )}
              {rejectedCount > 0 && (
                <Badge variant="outline" className="bg-red-50">
                  未通过: {rejectedCount}
                </Badge>
              )}
            </div>
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onExportPdf(studentId)}
        >
          <FilePdf className="mr-2 h-4 w-4" />
          导出PDF
        </Button>
      </CardHeader>
      <CardContent>
        {submissions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>作业标题</TableHead>
                <TableHead className="hidden md:table-cell">提交时间</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>评分</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="font-medium">
                      {submission.homework?.title || "未知作业"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatSubmissionDate(submission.submitted_at)}
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(submission.status)}
                  </TableCell>
                  <TableCell>
                    {submission.score !== undefined && submission.score !== null
                      ? `${submission.score}分`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewSubmission(submission.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <span>查看</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-8">
            <p>该学生尚未提交作业</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentHomeworkList;
