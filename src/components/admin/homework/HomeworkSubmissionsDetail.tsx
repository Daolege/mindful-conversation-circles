
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpDown, Download, FileText, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ExcelExportService } from './ExcelExportService';
import { toast } from 'sonner';

interface HomeworkSubmissionsDetailProps {
  courseId: number;
  lectureId: string;
  homeworkId?: string;
  lectureTitle: string;
  onViewSubmission: (submissionId: string) => void;
}

export const HomeworkSubmissionsDetail: React.FC<HomeworkSubmissionsDetailProps> = ({
  courseId,
  lectureId,
  homeworkId,
  lectureTitle,
  onViewSubmission
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showExport, setShowExport] = useState(false);

  // Fetch submissions for the selected lecture and homework
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['homework-submissions', lectureId, homeworkId],
    queryFn: async () => {
      try {
        // First, get the submissions
        let query = supabase
          .from('homework_submissions')
          .select(`
            id, 
            homework_id, 
            lecture_id, 
            status,
            created_at,
            user_id
          `)
          .eq('lecture_id', lectureId)
          .eq('course_id', courseId);

        // Add homework filter if specified
        if (homeworkId) {
          query = query.eq('homework_id', homeworkId);
        }

        const { data: submissionsData, error } = await query;
        
        if (error) {
          console.error('Error fetching homework submissions:', error);
          return [];
        }
        
        // If no submissions found, return empty array
        if (!submissionsData || submissionsData.length === 0) {
          return [];
        }

        // Get user profiles for each submission
        const submissionsWithProfiles = await Promise.all(submissionsData.map(async (submission) => {
          // Get user profile information
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', submission.user_id)
            .single();
            
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            return {
              ...submission,
              userName: 'Unknown User',
              userEmail: ''
            };
          }
          
          return {
            ...submission,
            userName: profileData?.full_name || 'Unknown User',
            userEmail: profileData?.email || ''
          };
        }));
        
        // Get homework titles for each submission
        if (submissionsWithProfiles && submissionsWithProfiles.length > 0) {
          const homeworkIds = [...new Set(submissionsWithProfiles.map(s => s.homework_id))];
          const { data: homeworks, error: homeworkError } = await supabase
            .from('homework')
            .select('id, title')
            .in('id', homeworkIds);
            
          if (homeworkError) {
            console.error('Error fetching homework details:', homeworkError);
          }
          
          const homeworkMap = (homeworks || []).reduce((acc, hw) => {
            acc[hw.id] = hw.title;
            return acc;
          }, {} as Record<string, string>);
          
          return submissionsWithProfiles.map(submission => ({
            ...submission,
            homeworkTitle: homeworkMap[submission.homework_id] || 'Unknown Homework'
          }));
        }
        
        return submissionsWithProfiles;
      } catch (error) {
        console.error('Error in submissions query:', error);
        return [];
      }
    },
    enabled: !!lectureId && !!courseId,
  });

  // Filter submissions based on search query
  const filteredSubmissions = React.useMemo(() => {
    if (!submissions) return [];
    
    return submissions.filter(submission => {
      const searchTerms = searchQuery.toLowerCase().trim().split(' ');
      const searchString = `${submission.userName} ${submission.userEmail} ${submission.homeworkTitle}`.toLowerCase();
      
      return searchTerms.every(term => searchString.includes(term));
    });
  }, [submissions, searchQuery]);

  // Sort submissions
  const sortedSubmissions = React.useMemo(() => {
    if (!filteredSubmissions) return [];
    
    return [...filteredSubmissions].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
    });
  }, [filteredSubmissions, sortBy]);

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">待审核</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">已通过</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">未通过</Badge>;
      default:
        return <Badge variant="outline">未知状态</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN');
  };

  // Handle export functionality
  const handleExport = async () => {
    if (!sortedSubmissions || sortedSubmissions.length === 0) {
      toast.error('没有数据可供导出');
      return;
    }

    try {
      // Format data for export
      const exportData = sortedSubmissions.map(submission => ({
        学生姓名: submission.userName || '',
        学生邮箱: submission.userEmail || '',
        作业标题: submission.homeworkTitle || '',
        状态: 
          submission.status === 'pending' ? '待审核' : 
          submission.status === 'reviewed' ? '已通过' : 
          submission.status === 'rejected' ? '未通过' : '未知',
        提交时间: formatDate(submission.created_at)
      }));

      const fileName = `作业提交-${lectureTitle}-${new Date().toISOString().slice(0, 10)}`;
      await ExcelExportService.exportToExcel(exportData, fileName, '作业提交');
      toast.success('导出成功');
    } catch (error) {
      console.error('导出错误:', error);
      toast.error('导出失败');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Submissions header with search and export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h2 className="text-xl font-semibold">
          已提交作业
          <span className="text-sm font-normal ml-2 text-gray-500">
            {filteredSubmissions.length} 份作业提交
          </span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="搜索学生或作业..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            导出
          </Button>
        </div>
      </div>

      {/* Submissions list */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">学生</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">作业</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer" onClick={toggleSortOrder}>
                    <div className="flex items-center">
                      <span>提交时间</span>
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody>
                {sortedSubmissions.map((submission) => (
                  <tr key={submission.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{submission.userName}</div>
                      <div className="text-gray-500 text-xs">{submission.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">{submission.homeworkTitle}</td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(submission.status)}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(submission.created_at)}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onViewSubmission(submission.id)}
                        className="flex items-center gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        查看
                      </Button>
                    </td>
                  </tr>
                ))}
                {sortedSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      暂无作业提交
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeworkSubmissionsDetail;
