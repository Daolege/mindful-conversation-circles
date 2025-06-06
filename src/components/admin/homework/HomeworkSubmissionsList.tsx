
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Calendar, FileText, User, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface HomeworkSubmissionsListProps {
  homeworkId?: string;
  lectureId?: string;
  onViewSubmission: (submissionId: string) => void;
}

export const HomeworkSubmissionsList: React.FC<HomeworkSubmissionsListProps> = ({ 
  homeworkId,
  lectureId,
  onViewSubmission
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch submissions for this homework
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['homework-submissions-by-homework', homeworkId],
    queryFn: async () => {
      if (!homeworkId) return [];
      
      // First fetch the homework submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('homework_submissions')
        .select(`
          id,
          user_id,
          created_at,
          submitted_at
        `)
        .eq('homework_id', homeworkId)
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
          user_name: profileData?.full_name || '用户名不详',
          user_email: profileData?.email || ''
        };
      }));
      
      return submissionsWithUserData || [];
    },
    enabled: !!homeworkId,
    staleTime: 5 * 60 * 1000
  });
  
  // Filter submissions based on search term
  const filteredSubmissions = submissions?.filter(submission => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const fullName = submission.user_name?.toLowerCase() || '';
    const email = submission.user_email?.toLowerCase() || '';
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '未知时间';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
    } catch (err) {
      return '日期格式错误';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // If no homework is selected, show instruction message
  if (!homeworkId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <FileText className="h-12 w-12 mb-4" />
        <h3 className="text-lg font-medium mb-2">请选择作业</h3>
        <p>从左侧课程大纲中选择一个作业，查看学生提交列表</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">学生提交列表</h3>
        <div className="relative w-64">
          <Input
            placeholder="搜索学生名或邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      {filteredSubmissions && filteredSubmissions.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>提交时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.map(submission => (
              <TableRow key={submission.id}>
                <TableCell className="font-medium">{submission.user_name}</TableCell>
                <TableCell>{submission.user_email}</TableCell>
                <TableCell>{formatDate(submission.submitted_at || submission.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewSubmission(submission.id)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    查看作业
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? '没有找到匹配的提交' : '暂无作业提交'}
        </div>
      )}
      
      {/* Submission count */}
      {filteredSubmissions && filteredSubmissions.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          共 {filteredSubmissions.length} 份作业提交
        </div>
      )}
    </div>
  );
};

export default HomeworkSubmissionsList;
