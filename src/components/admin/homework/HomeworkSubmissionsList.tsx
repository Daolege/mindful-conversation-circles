
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, Calendar, FileText, User, Eye } from 'lucide-react';
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
          user_id,
          created_at,
          submitted_at
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
          user_name: profileData?.full_name || '用户名不详',
          user_email: profileData?.email || ''
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
  
  return (
    <div>
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
                    onClick={() => onSelectStudent(submission.user_id)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    作业详情
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
