
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHomeworkSubmissionById } from '@/lib/services/homeworkSubmissionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  ChevronLeft,
  ChevronRight,
  User,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { RichTextDisplay } from './RichTextDisplay';

interface HomeworkSubmissionDetailProps {
  submissionId: string;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  onViewStudent?: (userId: string) => void;
  onBack?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  viewOnly?: boolean;
}

export const HomeworkSubmissionDetail: React.FC<HomeworkSubmissionDetailProps> = ({ 
  submissionId,
  onNavigatePrev,
  onNavigateNext,
  onViewStudent,
  onBack,
  hasNext = false,
  hasPrev = false,
  viewOnly = false
}) => {
  const { data: submission, isLoading, error } = useQuery({
    queryKey: ['homework-submission', submissionId],
    queryFn: () => getHomeworkSubmissionById(submissionId || ''),
    enabled: !!submissionId
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
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
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !submission) return <div className="p-8">加载作业提交信息出错</div>;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge>待提交</Badge>;
      case 'reviewed':
        return <Badge variant="success">已提交</Badge>;
      case 'rejected':
        return <Badge variant="destructive">已提交</Badge>;
      default:
        return <Badge>未知状态</Badge>;
    }
  };

  // Format the date using date-fns
  const submissionDate = submission.created_at 
    ? formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })
    : '未知时间';

  // Improved logic to detect rich text content for student answers
  const isAnswerRichText = submission && (
    submission.answer?.includes('<') || 
    submission.answer?.includes('&lt;') ||
    submission.content?.includes('<') ||
    submission.content?.includes('&lt;') ||
    submission.answer?.includes('src=') ||
    submission.content?.includes('src=') ||
    submission.answer?.includes('<img') ||
    submission.content?.includes('<img')
  );

  // New logic to detect rich text content for homework question/description
  const isHomeworkDescriptionRichText = submission?.homework?.description && (
    submission.homework.description.includes('<') ||
    submission.homework.description.includes('&lt;') ||
    submission.homework.description.includes('src=') ||
    submission.homework.description.includes('<img')
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* Always display the back button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          返回作业列表
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrev}
            onClick={onNavigatePrev}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            上一份
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={onNavigateNext}
            className="flex items-center gap-1"
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
                {!viewOnly && getStatusBadge(submission.status)}
              </CardTitle>
              <CardDescription className="mt-1">
                <div className="flex items-center">
                  {onViewStudent ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-auto font-normal hover:bg-transparent"
                      onClick={() => onViewStudent(submission.user_id)}
                    >
                      <User className="h-4 w-4 mr-1" />
                      {submission.user_name}
                    </Button>
                  ) : (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {submission.user_name}
                    </div>
                  )}
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
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">{submission.homework.title}</p>
                {isHomeworkDescriptionRichText ? (
                  <RichTextDisplay 
                    content={submission.homework.description}
                    className="mt-2 text-sm text-muted-foreground prose max-w-none"
                  />
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                    {submission.homework?.description || '无详细描述'}
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-2">作业内容</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {isAnswerRichText ? (
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
          
          {!viewOnly && submission.feedback && (
            <div>
              <h3 className="text-lg font-medium mb-2">反馈</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="whitespace-pre-wrap">
                  {submission.feedback}
                </div>
              </div>
            </div>
          )}
          
          {/* Export PDF button (if needed) */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="flex items-center gap-1"
              size="sm"
              onClick={() => window.print()}
            >
              <FileText className="h-4 w-4" />
              导出PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeworkSubmissionDetail;
