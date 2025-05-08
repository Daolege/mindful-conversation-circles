
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Calendar, FileUp, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface HomeworkSubmissionsListProps {
  lectureId: string;
  onSelectStudent: (studentId: string) => void;
}

export const HomeworkSubmissionsList: React.FC<HomeworkSubmissionsListProps> = ({ 
  lectureId,
  onSelectStudent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch submissions for this lecture
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['homework-submissions', lectureId],
    queryFn: async () => {
      // First fetch the homework submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('homework_submissions')
        .select(`
          id,
          answer,
          created_at,
          submitted_at,
          status,
          user_id
        `)
        .eq('lecture_id', lectureId)
        .order('created_at', { ascending: false });
        
      if (submissionsError) {
        console.error('Error fetching homework submissions:', submissionsError);
        return [];
      }
      
      // For each submission, fetch the user profile data separately
      const submissionsWithUserData = await Promise.all((submissionsData || []).map(async (submission) => {
        // Get user profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', submission.user_id)
          .single();
          
        return {
          ...submission,
          user: profileData || { full_name: '用户名不详', email: '' }
        };
      }));
      
      return submissionsWithUserData || [];
    },
    enabled: !!lectureId,
    staleTime: 5 * 60 * 1000
  });
  
  // Filter submissions based on search term
  const filteredSubmissions = submissions?.filter(submission => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const fullName = submission.user?.full_name?.toLowerCase() || '';
    const email = submission.user?.email?.toLowerCase() || '';
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>作业提交列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          作业提交列表
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search input */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="搜索用户名或邮箱..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Submissions table */}
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">学生</th>
                <th scope="col" className="px-6 py-3">提交时间</th>
                <th scope="col" className="px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions && filteredSubmissions.length > 0 ? (
                filteredSubmissions.map(submission => (
                  <tr key={submission.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <div>
                          <div>{submission.user?.full_name || '用户名不详'}</div>
                          <div className="text-xs text-gray-500">{submission.user?.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {format(new Date(submission.created_at), 'yyyy-MM-dd HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onSelectStudent(submission.user_id)}
                      >
                        查看作业
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white border-b">
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? '没有找到匹配的提交' : '暂无作业提交'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Submission count */}
        <div className="mt-4 text-sm text-gray-500">
          共 {filteredSubmissions?.length || 0} 份作业提交
        </div>
      </CardContent>
    </Card>
  );
};

export default HomeworkSubmissionsList;
