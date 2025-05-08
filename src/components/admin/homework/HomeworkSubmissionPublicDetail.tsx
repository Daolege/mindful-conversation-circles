
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getHomeworkSubmissionById } from '@/lib/services/homeworkSubmissionService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Calendar, File } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RichTextDisplay } from './RichTextDisplay';

interface HomeworkSubmissionPublicDetailProps {
  submissionId: string;
  onBack: () => void;
}

const HomeworkSubmissionPublicDetail: React.FC<HomeworkSubmissionPublicDetailProps> = ({
  submissionId, 
  onBack
}) => {
  const { data: submission, isLoading, error } = useQuery({
    queryKey: ['homework-submission', submissionId],
    queryFn: () => getHomeworkSubmissionById(submissionId || ''),
    enabled: !!submissionId
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
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !submission) return <div className="p-8">加载作业提交信息出错</div>;

  // Format the submission date using date-fns with Chinese locale
  const submissionDate = submission.created_at 
    ? formatDistanceToNow(new Date(submission.created_at), { addSuffix: true, locale: zhCN })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> 返回列表
        </Button>
      </div>

      <Card className="overflow-hidden">
        {/* 上半部分：用户信息区域 */}
        <div className="bg-muted/20 p-6 border-b">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={submission.user_avatar || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {submission.user_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{submission.user_name || '未知用户'}</h2>
              <div className="text-muted-foreground">{submission.user_email}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>提交于 {submissionDate}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 下半部分：作业详情区域 */}
        <div className="p-6">
          <div className="space-y-6">
            {submission.homework && (
              <div>
                <h3 className="text-lg font-medium mb-2">作业题目</h3>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                  <p className="font-medium">{submission.homework.title}</p>
                  {submission.homework?.description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {submission.homework.description}
                    </p>
                  )}
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

            {submission.file_url && (
              <div>
                <h3 className="text-lg font-medium mb-2">附件</h3>
                <a 
                  href={submission.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 p-3 border rounded-md hover:bg-gray-50"
                >
                  <File className="h-5 w-5 text-blue-500" />
                  <span className="underline text-blue-600">查看附件</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HomeworkSubmissionPublicDetail;
