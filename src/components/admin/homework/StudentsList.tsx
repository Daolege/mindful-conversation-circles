
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, FileCheck, FileX } from 'lucide-react';
import { HomeworkSubmission } from '@/lib/types/homework';
import { supabase } from '@/integrations/supabase/client';

interface StudentsListProps {
  studentId: string;
  lectureId: string;
}

export const StudentsList: React.FC<StudentsListProps> = ({ studentId, lectureId }) => {
  const [activeTab, setActiveTab] = React.useState('submitted');
  
  // Fetch student profile
  const { data: studentProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['student-profile', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', studentId)
        .single();
        
      if (error) {
        console.error('Error fetching student profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!studentId,
  });

  // Fetch homework assignments for this lecture
  const { data: homeworkAssignments, isLoading: isLoadingHomework } = useQuery({
    queryKey: ['lecture-homework', lectureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework')
        .select('id, title, description, type')
        .eq('lecture_id', lectureId)
        .order('position', { ascending: true });
        
      if (error) {
        console.error('Error fetching homework assignments:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!lectureId,
  });

  // Fetch student submissions for this lecture
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['student-lecture-submissions', studentId, lectureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select(`
          id,
          homework_id,
          answer,
          file_url,
          status,
          score,
          feedback,
          created_at,
          submitted_at
        `)
        .eq('user_id', studentId)
        .eq('lecture_id', lectureId);
        
      if (error) {
        console.error('Error fetching student submissions:', error);
        return [];
      }
      
      // Map submissions by homework_id for easy lookup
      const submissionsMap = (data || []).reduce((map, submission) => {
        map[submission.homework_id] = submission;
        return map;
      }, {} as Record<string, any>);
      
      return submissionsMap;
    },
    enabled: !!studentId && !!lectureId,
  });
  
  if (isLoadingProfile || isLoadingHomework || isLoadingSubmissions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>学生作业</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const userName = studentProfile?.full_name || '用户名不详';
  const userEmail = studentProfile?.email || '';
  
  // Group homework into submitted and not submitted
  const submittedHomework: any[] = [];
  const notSubmittedHomework: any[] = [];
  
  if (homeworkAssignments) {
    homeworkAssignments.forEach(homework => {
      if (submissions && submissions[homework.id]) {
        submittedHomework.push({
          ...homework,
          submission: submissions[homework.id]
        });
      } else {
        notSubmittedHomework.push(homework);
      }
    });
  }
  
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="text-lg">学生作业：{userName}</span>
          {userEmail && <span className="ml-2 text-sm text-gray-500">({userEmail})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="submitted" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" /> 
              已提交 ({submittedHomework.length})
            </TabsTrigger>
            <TabsTrigger value="not-submitted" className="flex items-center gap-2">
              <FileX className="h-4 w-4" /> 
              未提交 ({notSubmittedHomework.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="submitted">
            {submittedHomework.length > 0 ? (
              <div className="space-y-6">
                {submittedHomework.map(item => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{item.title}</h3>
                        {getStatusBadge(item.submission.status)}
                        {typeof item.submission.score === 'number' && (
                          <Badge variant="outline" className="ml-2">
                            {item.submission.score}分
                          </Badge>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/admin/courses-new/${lectureId}/homework/submission/${item.submission.id}`, '_blank')}
                      >
                        查看详情
                      </Button>
                    </div>
                    
                    {item.description && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>题目描述：</strong>
                        <p>{item.description}</p>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <strong>学生答案：</strong>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                        {item.submission.answer || '无文本内容'}
                      </div>
                      
                      {item.submission.file_url && (
                        <div className="mt-2">
                          <a 
                            href={item.submission.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            查看附件
                          </a>
                        </div>
                      )}
                    </div>
                    
                    {item.submission.feedback && (
                      <div className="mt-4">
                        <strong>老师反馈：</strong>
                        <div className="mt-2 p-3 bg-blue-50 rounded-md">
                          {item.submission.feedback}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                该学生未提交任何作业
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="not-submitted">
            {notSubmittedHomework.length > 0 ? (
              <div className="space-y-4">
                {notSubmittedHomework.map(homework => (
                  <div key={homework.id} className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium">{homework.title}</h3>
                    {homework.description && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>{homework.description}</p>
                      </div>
                    )}
                    <Badge variant="outline" className="mt-2 text-amber-600 border-amber-300">
                      未提交
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                该学生已提交所有作业
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StudentsList;
