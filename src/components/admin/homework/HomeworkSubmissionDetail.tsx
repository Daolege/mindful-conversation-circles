import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getHomeworkSubmissionById, updateHomeworkFeedback } from '@/lib/services/homeworkSubmissionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Download, 
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RichTextDisplay } from './RichTextDisplay';

interface HomeworkSubmissionDetailProps {
  submissionId: string;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  onViewStudent?: (userId: string) => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export const HomeworkSubmissionDetail: React.FC<HomeworkSubmissionDetailProps> = ({ 
  submissionId,
  onNavigatePrev,
  onNavigateNext,
  onViewStudent,
  hasNext = false,
  hasPrev = false
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState<number | null>(null);

  const { data: submission, isLoading, error } = useQuery({
    queryKey: ['homework-submission', submissionId],
    queryFn: () => getHomeworkSubmissionById(submissionId || ''),
    enabled: !!submissionId
  });

  // Use effect to set initial values when data loads
  useEffect(() => {
    if (submission) {
      setFeedback(submission.feedback || '');
      setScore(submission.score || null);
    }
  }, [submission]);

  const updateFeedbackMutation = useMutation({
    mutationFn: ({ id, feedback, status, score }: 
      { id: string; feedback: string; status: 'pending' | 'reviewed' | 'rejected'; score?: number }) => 
      updateHomeworkFeedback(id, feedback, status, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework-submission', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['homework-submissions-course'] });
      queryClient.invalidateQueries({ queryKey: ['homework-submissions-lecture'] });
      toast.success('作业反馈已更新');
    },
    onError: () => {
      toast.error('更新作业反馈失败');
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-1/4 mb-2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="flex justify-end gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !submission) return <div className="p-8">加载作业提交信息出错</div>;

  const handleApprove = () => {
    if (!submissionId) return;
    updateFeedbackMutation.mutate({ 
      id: submissionId, 
      feedback: feedback || submission.feedback || '作业已通过审核',
      status: 'reviewed',
      score: score !== null ? score : undefined
    });
  };

  const handleReject = () => {
    if (!submissionId) return;
    updateFeedbackMutation.mutate({ 
      id: submissionId, 
      feedback: feedback || submission.feedback || '作业未通过审核，请修改',
      status: 'rejected',
      score: score !== null ? score : undefined
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

  // Improved logic to detect rich text content
  const isRichText = submission && (
    submission.answer?.includes('<') || 
    submission.answer?.includes('&lt;') ||
    submission.content?.includes('<') ||
    submission.content?.includes('&lt;') ||
    submission.answer?.includes('src=') ||
    submission.content?.includes('src=') ||
    submission.answer?.includes('<img') ||
    submission.content?.includes('<img')
  );

  console.log('Submission content type:', isRichText ? 'Rich text' : 'Plain text');
  if (isRichText) {
    console.log('Rich text content sample:', 
      (submission?.content || submission?.answer || '').substring(0, 100) + '...');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> 返回作业列表
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            onClick={onNavigatePrev}
          >
            <ChevronLeft className="h-4 w-4" />
            上一份
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={onNavigateNext}
          >
            下一份
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                作业提交详情
                {getStatusBadge(submission.status)}
              </CardTitle>
              <CardDescription className="mt-1">
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto font-normal hover:bg-transparent"
                    onClick={() => onViewStudent?.(submission.user_id)}
                  >
                    <User className="h-4 w-4 mr-1" />
                    {submission.user_name}
                  </Button>
                  <span className="mx-2">•</span>
                  <span>{submission.user_email}</span>
                </div>
                <div className="mt-1">提交于 {submissionDate}</div>
              </CardDescription>
            </div>

            {submission.file_url && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(submission.file_url, '_blank')}
              >
                <Download className="mr-2 h-4 w-4" />
                下载附件
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {submission.homework && (
            <div>
              <h3 className="text-lg font-medium mb-2">作业题目</h3>
              <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                <p className="font-medium">{submission.homework.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {submission.homework?.description || '无详细描述'}
                </p>
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-2">作业内容</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {isRichText ? (
                <RichTextDisplay 
                  content={submission.content || submission.answer}
                  className="prose max-w-none"
                />
              ) : (
                <div className="whitespace-pre-wrap">
                  {submission.content || submission.answer || '无作业内容'}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">评分</h3>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="0-100分"
                value={score !== null ? score : ''}
                onChange={(e) => setScore(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="w-32"
              />
              <span className="text-sm text-muted-foreground">分 (0-100)</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">教师反馈</h3>
            <Textarea
              placeholder="输入对学生作业的反馈..."
              className="min-h-[120px]"
              value={feedback}
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
              className="flex gap-1 items-center bg-green-600 hover:bg-green-700"
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
