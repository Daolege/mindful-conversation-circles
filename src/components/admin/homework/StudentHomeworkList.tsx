
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileText, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { HomeworkSubmission } from '@/lib/services/homeworkSubmissionService';

interface StudentHomeworkListProps {
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  submissions: HomeworkSubmission[];
  isLoading: boolean;
  onViewSubmission: (submissionId: string) => void;
  onExportPdf?: (studentId: string) => void;
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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">待审核</Badge>;
      case 'reviewed':
        return <Badge variant="success">已通过</Badge>;
      case 'rejected':
        return <Badge variant="destructive">未通过</Badge>;
      default:
        return <Badge variant="outline">未知状态</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{studentName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                学生作业：{studentName}
              </CardTitle>
              <CardDescription>{studentEmail}</CardDescription>
            </div>
            {onExportPdf && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onExportPdf(studentId)}
              >
                <FileText className="h-4 w-4 mr-2" />
                导出PDF
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>作业标题</TableHead>
                  <TableHead>提交日期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>评分</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      该学生还未提交任何作业
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        {submission.homework?.title || '未知作业'}
                      </TableCell>
                      <TableCell>
                        {submission.submitted_at ? 
                          format(new Date(submission.submitted_at), 'yyyy-MM-dd HH:mm') : 
                          '未知时间'
                        }
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(submission.status)}
                      </TableCell>
                      <TableCell>
                        {typeof submission.score === 'number' ? `${submission.score}分` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => onViewSubmission(submission.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default StudentHomeworkList;
