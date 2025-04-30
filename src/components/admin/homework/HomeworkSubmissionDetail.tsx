
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getHomeworkSubmissionById, updateHomeworkFeedback } from '@/lib/services/homeworkSubmissionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export const HomeworkSubmissionDetail = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState('');

  const { data: submission, isLoading, error } = useQuery({
    queryKey: ['homework-submission', submissionId],
    queryFn: () => getHomeworkSubmissionById(submissionId || ''),
    enabled: !!submissionId,
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: ({ id, feedback, status }: { id: string; feedback: string; status: 'pending' | 'reviewed' | 'rejected' }) => 
      updateHomeworkFeedback(id, feedback, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework-submission', submissionId] });
      toast.success('作业反馈已更新');
    },
    onError: () => {
      toast.error('更新作业反馈失败');
    }
  });

  if (isLoading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error || !submission) return <div className="p-8">加载作业提交信息出错</div>;

  const handleApprove = () => {
    if (!submissionId) return;
    updateFeedbackMutation.mutate({ 
      id: submissionId, 
      feedback: feedback || submission.feedback || '作业已通过审核',
      status: 'reviewed' 
    });
  };

  const handleReject = () => {
    if (!submissionId) return;
    updateFeedbackMutation.mutate({ 
      id: submissionId, 
      feedback: feedback || submission.feedback || '作业未通过审核，请修改',
      status: 'rejected' 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge>待审核</Badge>;
      case 'reviewed':
        return <Badge variant="success">已通过</Badge>;
      case 'rejected':
        return <Badge variant="destructive">未通过</Badge>;
      default:
        return <Badge>未知状态</Badge>;
    }
  };

  // Format the date using date-fns
  const submissionDate = submission.created_at 
    ? formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })
    : '未知时间';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 返回作业列表
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>作业提交详情</CardTitle>
              <CardDescription>
                由 {submission.user_name} 提交于 {submissionDate}
              </CardDescription>
            </div>
            {getStatusBadge(submission.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">作业内容</h3>
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {submission.content || '无作业内容'}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">文件附件</h3>
            {submission.file_url ? (
              <div className="flex">
                <a 
                  href={submission.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  下载附件
                </a>
              </div>
            ) : (
              <p className="text-gray-500">无文件附件</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">教师反馈</h3>
            <Textarea
              placeholder="输入对学生作业的反馈..."
              className="min-h-[120px]"
              value={feedback || submission.feedback || ''}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              className="flex gap-1 items-center"
              onClick={handleReject}
              disabled={updateFeedbackMutation.isPending}
            >
              <XCircle className="h-4 w-4" /> 不通过
            </Button>
            <Button 
              variant="success" 
              className="flex gap-1 items-center"
              onClick={handleApprove}
              disabled={updateFeedbackMutation.isPending}
            >
              <CheckCircle className="h-4 w-4" /> 通过审核
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeworkSubmissionDetail;
