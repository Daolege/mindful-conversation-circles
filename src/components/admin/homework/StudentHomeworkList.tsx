
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Download } from 'lucide-react';
import { HomeworkSubmission } from '@/lib/types/homework';
import { format } from 'date-fns';

interface StudentHomeworkListProps {
  studentId: string;
  courseId: number;
  studentName?: string;
  studentEmail?: string;
  submissions?: HomeworkSubmission[];
  isLoading?: boolean;
  onViewSubmission: (id: string) => void;
  onExportPdf?: (id: string) => void;
}

export const StudentHomeworkList: React.FC<StudentHomeworkListProps> = ({
  studentId,
  courseId,
  studentName,
  studentEmail,
  submissions = [],
  isLoading = false,
  onViewSubmission,
  onExportPdf = () => {}
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>学生作业提交</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle>学生作业提交记录</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => onExportPdf(studentId)}
          >
            <Download className="h-4 w-4" />
            导出PDF
          </Button>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>用户名: <strong>{studentName || '用户名不详'}</strong></span>
          {studentEmail && (
            <span>邮箱: <strong>{studentEmail}</strong></span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="border rounded-lg p-4 hover:border-gray-400 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">
                        {submission.homework?.title || "未命名作业"}
                      </h3>
                    </div>
                    
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      <span>
                        提交时间: {submission.submitted_at 
                          ? format(new Date(submission.submitted_at), 'yyyy-MM-dd HH:mm') 
                          : format(new Date(submission.created_at!), 'yyyy-MM-dd HH:mm')}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewSubmission(submission.id!)}
                  >
                    查看详情
                  </Button>
                </div>
                
                {submission.file_url && (
                  <div className="mt-2">
                    <a
                      href={submission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center"
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      附件
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500">
            没有找到该学生的作业提交记录
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentHomeworkList;
