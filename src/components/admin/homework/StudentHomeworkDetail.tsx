
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { RichTextDisplay } from './RichTextDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface StudentHomeworkDetailProps {
  submissionId: string;
  onBack: () => void;
}

export const StudentHomeworkDetail: React.FC<StudentHomeworkDetailProps> = ({ 
  submissionId, 
  onBack 
}) => {
  // Fetch the homework submission details
  const { data: submission, isLoading } = useQuery({
    queryKey: ['homework-submission-detail', submissionId],
    queryFn: async () => {
      // Get the submission data
      const { data: submissionData, error: submissionError } = await supabase
        .from('homework_submissions')
        .select(`
          id,
          homework_id,
          user_id,
          lecture_id,
          course_id,
          answer,
          file_url,
          content,
          status,
          submitted_at,
          created_at
        `)
        .eq('id', submissionId)
        .single();
        
      if (submissionError) throw submissionError;
      
      // Get homework data
      const { data: homeworkData } = await supabase
        .from('homework')
        .select('id, title, description, type')
        .eq('id', submissionData.homework_id)
        .single();

      // Get profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', submissionData.user_id)
        .single();

      return {
        ...submissionData,
        homework: homeworkData || { title: '未知作业', description: '' },
        user_name: profileData?.full_name || '未知用户',
        user_email: profileData?.email || ''
      };
    },
    enabled: !!submissionId,
  });

  // Format date
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '未知时间';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
    } catch (err) {
      return '日期格式错误';
    }
  };

  // Detect if content is rich text
  const isRichText = submission && (
    submission.answer?.includes('<') || 
    submission.answer?.includes('&lt;') ||
    submission.content?.includes('<') ||
    submission.content?.includes('&lt;') ||
    submission.answer?.includes('src=') ||
    submission.content?.includes('src=')
  );

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
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          返回作业列表
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            无法加载作业提交信息
          </CardContent>
        </Card>
      </div>
    );
  }

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">待审核</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-green-50">已通过</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50">未通过</Badge>;
      default:
        return <Badge>未知状态</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        返回作业列表
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            作业提交详情 {getStatusBadge(submission.status)}
          </CardTitle>
          <CardDescription>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4 text-gray-400" />
                <span>{submission.user_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>提交于 {formatDateTime(submission.submitted_at || submission.created_at)}</span>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 作业题目信息 */}
          <div>
            <h3 className="text-lg font-medium mb-2">作业题目</h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium">{submission.homework.title}</p>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {submission.homework.description}
              </p>
            </div>
          </div>
          
          {/* 作业提交内容 */}
          <div>
            <h3 className="text-lg font-medium mb-2">作答内容</h3>
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
          
          {/* 附件（如果存在） */}
          {submission.file_url && (
            <div>
              <h3 className="text-lg font-medium mb-2">附件</h3>
              <Button 
                variant="outline" 
                onClick={() => window.open(submission.file_url, '_blank')}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                下载附件
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentHomeworkDetail;
