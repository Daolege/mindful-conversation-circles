
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Download, Check, X, Clock } from 'lucide-react';
import { HomeworkSubmission } from '@/lib/types/homework';
import { format } from 'date-fns';

interface StudentHomeworkListProps {
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  submissions: HomeworkSubmission[];
  isLoading: boolean;
  onViewSubmission: (id: string) => void;
  onExportPdf: (id: string) => void;
}

export const StudentHomeworkList: React.FC<StudentHomeworkListProps> = ({
  studentId,
  studentName,
  studentEmail,
  submissions,
  isLoading,
  onViewSubmission,
  onExportPdf
}) => {
  const [filter, setFilter] = useState('all');
  
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

  // Filter submissions based on status
  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : submissions.filter(submission => submission.status === filter);
  
  // Count submissions by status
  const counts = {
    all: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    reviewed: submissions.filter(s => s.status === 'reviewed').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  };
  
  // Helper function to get the status icon
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'reviewed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Helper function to get the status badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="ml-2">待审核</Badge>;
      case 'reviewed':
        return <Badge variant="success" className="ml-2">已通过</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="ml-2">未通过</Badge>;
      default:
        return <Badge variant="outline" className="ml-2">未知状态</Badge>;
    }
  };
  
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
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              全部 ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="pending">
              待审核 ({counts.pending})
            </TabsTrigger>
            <TabsTrigger value="reviewed">
              已通过 ({counts.reviewed})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              未通过 ({counts.rejected})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={filter} className="pt-4">
            {filteredSubmissions.length > 0 ? (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div key={submission.id} className="border rounded-lg p-4 hover:border-gray-400 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">
                            {submission.homework?.title || "未命名作业"}
                          </h3>
                          {getStatusBadge(submission.status)}
                        </div>
                        
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <span>
                            提交时间: {submission.submitted_at 
                              ? format(new Date(submission.submitted_at), 'yyyy-MM-dd HH:mm') 
                              : format(new Date(submission.created_at!), 'yyyy-MM-dd HH:mm')}
                          </span>
                          {typeof submission.score === 'number' && (
                            <span className="font-medium">
                              得分: {submission.score}
                            </span>
                          )}
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
                    
                    {submission.feedback && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                        <strong>反馈: </strong> {submission.feedback}
                      </div>
                    )}
                    
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
                没有找到符合条件的作业提交记录
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StudentHomeworkList;
