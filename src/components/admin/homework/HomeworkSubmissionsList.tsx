
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import { HomeworkSubmission } from '@/lib/types/homework';

interface HomeworkSubmissionsListProps {
  lectureId?: string | null;
  homeworkId?: string | null;
  onSelectStudent?: (studentId: string) => void;
  onViewSubmission?: (submissionId: string) => void;
}

export const HomeworkSubmissionsList: React.FC<HomeworkSubmissionsListProps> = ({
  lectureId,
  homeworkId,
  onSelectStudent,
  onViewSubmission
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch submissions based on lecture ID and/or homework ID
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['homework-submissions', lectureId, homeworkId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('homework_submissions')
          .select(`
            id,
            homework_id,
            user_id,
            lecture_id,
            course_id,
            created_at,
            submitted_at,
            homework:homework_id (
              title
            ),
            profiles:user_id (
              full_name,
              email
            )
          `)
          .order('created_at', { ascending: false });
        
        if (lectureId) {
          query = query.eq('lecture_id', lectureId);
        }
        
        if (homeworkId) {
          query = query.eq('homework_id', homeworkId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return data.map(item => ({
          id: item.id,
          homework_id: item.homework_id,
          lecture_id: item.lecture_id,
          course_id: item.course_id,
          user_id: item.user_id,
          created_at: item.created_at,
          submitted_at: item.submitted_at,
          homework_title: item.homework?.title || '未命名作业',
          user_name: item.profiles?.full_name || '未知用户',
          user_email: item.profiles?.email || ''
        }));
      } catch (error) {
        console.error('Error fetching submissions:', error);
        return [];
      }
    },
    enabled: !!lectureId || !!homeworkId
  });

  // Fetch homework details if homeworkId is provided
  const { data: homeworkDetails } = useQuery({
    queryKey: ['homework-details', homeworkId],
    queryFn: async () => {
      if (!homeworkId) return null;
      
      const { data, error } = await supabase
        .from('homework')
        .select('title, description')
        .eq('id', homeworkId)
        .single();
      
      if (error) {
        console.error('Error fetching homework details:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!homeworkId
  });

  // Filter submissions by search term
  const filteredSubmissions = submissions?.filter(submission => {
    const searchLower = searchTerm.toLowerCase();
    return (
      submission.user_name.toLowerCase().includes(searchLower) ||
      submission.user_email.toLowerCase().includes(searchLower) ||
      submission.homework_title.toLowerCase().includes(searchLower)
    );
  });

  if (!lectureId && !homeworkId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center p-8 text-gray-500">
            请从左侧大纲中选择一个课时或作业
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {homeworkDetails ? `作业: ${homeworkDetails.title}` : '作业提交列表'}
            </CardTitle>
            {homeworkDetails?.description && (
              <CardDescription className="mt-2 line-clamp-2">
                {homeworkDetails.description}
              </CardDescription>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Input
            placeholder="搜索学生姓名或邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredSubmissions && filteredSubmissions.length > 0 ? (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <div key={submission.id} className="border rounded-lg p-4 hover:border-gray-400 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto font-medium hover:bg-transparent justify-start"
                        onClick={() => onSelectStudent && onSelectStudent(submission.user_id)}
                      >
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        {submission.user_name}
                      </Button>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{submission.user_email}</span>
                    </div>
                    
                    <div className="mt-1">
                      <div className="text-sm">
                        作业: <span className="font-medium">{submission.homework_title}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        提交时间: {submission.submitted_at ? 
                          format(new Date(submission.submitted_at), 'yyyy-MM-dd HH:mm:ss') : 
                          format(new Date(submission.created_at), 'yyyy-MM-dd HH:mm:ss')
                        }
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4"
                    onClick={() => onViewSubmission && onViewSubmission(submission.id)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    查看作业
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-gray-500">
            没有找到符合条件的作业提交
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomeworkSubmissionsList;
