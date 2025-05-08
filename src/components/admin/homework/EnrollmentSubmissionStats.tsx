
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileDown, Search, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExcelExportService } from './ExcelExportService';

interface EnrollmentSubmissionStatsProps {
  courseId: number;
  lectureId?: string;
}

interface StudentStat {
  id: string;
  full_name: string;
  email: string;
  total_submissions: number;
  pending_submissions: number;
  approved_submissions: number;
  rejected_submissions: number;
  completion_rate: number;
  average_score: number | null;
}

export const EnrollmentSubmissionStats: React.FC<EnrollmentSubmissionStatsProps> = ({ 
  courseId,
  lectureId 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('full_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isExporting, setIsExporting] = useState(false);
  
  // Fetch enrolled students and their submissions
  const { data: stats, isLoading } = useQuery({
    queryKey: ['enrollment-stats', courseId, lectureId],
    queryFn: async () => {
      try {
        // First get all enrolled students
        const { data: enrolledStudents, error: enrolledError } = await supabase
          .from('course_enrollments')
          .select('user_id')
          .eq('course_id', courseId);
          
        if (enrolledError) throw enrolledError;
        
        if (!enrolledStudents || enrolledStudents.length === 0) {
          return [];
        }
        
        // Get profiles for these students
        const userIds = enrolledStudents.map(e => e.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
          
        if (profilesError) throw profilesError;
        
        // For each student, get their submission statistics
        const studentStats: StudentStat[] = await Promise.all((profiles || []).map(async (profile) => {
          // Base query for submissions
          let submissionsQuery = supabase
            .from('homework_submissions')
            .select('id, status, score')
            .eq('user_id', profile.id)
            .eq('course_id', courseId);
            
          // Add lecture filter if provided
          if (lectureId) {
            submissionsQuery = submissionsQuery.eq('lecture_id', lectureId);
          }
          
          const { data: submissions, error: submissionsError } = await submissionsQuery;
          
          if (submissionsError) {
            console.error('Error fetching submissions for user:', profile.id, submissionsError);
            return null;
          }
          
          // Calculate statistics
          const total = submissions?.length || 0;
          const pending = submissions?.filter(s => s.status === 'pending').length || 0;
          const approved = submissions?.filter(s => s.status === 'reviewed').length || 0;
          const rejected = submissions?.filter(s => s.status === 'rejected').length || 0;
          
          // Calculate average score (only from reviewed submissions with scores)
          let avgScore = null;
          const scoredSubmissions = submissions?.filter(s => s.status === 'reviewed' && s.score !== null);
          if (scoredSubmissions?.length) {
            const totalScore = scoredSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
            avgScore = totalScore / scoredSubmissions.length;
          }
          
          // Calculate completion rate
          const completionRate = total > 0 ? ((approved + rejected) / total) * 100 : 0;
          
          return {
            id: profile.id,
            full_name: profile.full_name || '未知用户',
            email: profile.email || '',
            total_submissions: total,
            pending_submissions: pending,
            approved_submissions: approved,
            rejected_submissions: rejected,
            completion_rate: completionRate,
            average_score: avgScore
          };
        }));
        
        // Filter out any null entries from failed queries
        return studentStats.filter(Boolean);
      } catch (error) {
        console.error('Error fetching enrollment stats:', error);
        throw error;
      }
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000
  });
  
  // Filter and sort the stats
  const filteredStats = useMemo(() => {
    if (!stats) return [];
    
    // Apply search filter
    const filtered = stats.filter(student => {
      if (!searchQuery) return true;
      
      const lowercaseQuery = searchQuery.toLowerCase();
      return (
        student.full_name.toLowerCase().includes(lowercaseQuery) ||
        student.email.toLowerCase().includes(lowercaseQuery)
      );
    });
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      let valA = a[sortField as keyof StudentStat] as any;
      let valB = b[sortField as keyof StudentStat] as any;
      
      // Handle null values for sorting
      if (valA === null) valA = sortField === 'average_score' ? 0 : '';
      if (valB === null) valB = sortField === 'average_score' ? 0 : '';
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [stats, searchQuery, sortField, sortDirection]);
  
  // Handle column header click for sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle Excel export
  const handleExportExcel = async () => {
    try {
      if (!filteredStats || filteredStats.length === 0) {
        toast.error('没有可导出的数据');
        return;
      }
      
      setIsExporting(true);
      
      // Transform data for export
      const exportData = filteredStats.map(student => ({
        '学生姓名': student.full_name,
        '电子邮箱': student.email,
        '总提交数': student.total_submissions,
        '待批改': student.pending_submissions,
        '已通过': student.approved_submissions,
        '未通过': student.rejected_submissions,
        '完成率 (%)': student.completion_rate.toFixed(2),
        '平均分': student.average_score !== null ? student.average_score.toFixed(1) : 'N/A'
      }));
      
      // Use the Excel export service
      await ExcelExportService.exportToExcel(
        exportData, 
        `课程${courseId}_作业统计_${new Date().toLocaleDateString()}`
      );
      
      toast.success('导出成功');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('导出失败：' + (error as Error).message);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Sort indicator component
  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">学生作业统计</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="搜索学生..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button 
            variant="outline"
            onClick={handleExportExcel}
            disabled={isExporting || filteredStats.length === 0}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                导出Excel
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="w-[200px] cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('full_name')}
                  >
                    学生姓名 <SortIndicator field="full_name" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('email')}
                  >
                    电子邮箱 <SortIndicator field="email" />
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('total_submissions')}
                  >
                    提交总数 <SortIndicator field="total_submissions" />
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('pending_submissions')}
                  >
                    待批改 <SortIndicator field="pending_submissions" />
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('approved_submissions')}
                  >
                    已通过 <SortIndicator field="approved_submissions" />
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('rejected_submissions')}
                  >
                    未通过 <SortIndicator field="rejected_submissions" />
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('completion_rate')}
                  >
                    完成率 <SortIndicator field="completion_rate" />
                  </TableHead>
                  <TableHead 
                    className="text-right cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('average_score')}
                  >
                    平均分 <SortIndicator field="average_score" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      没有找到学生记录
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStats.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell className="text-center">{student.total_submissions}</TableCell>
                      <TableCell className="text-center">
                        {student.pending_submissions > 0 ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-100">
                            {student.pending_submissions}
                          </Badge>
                        ) : (
                          student.pending_submissions
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.approved_submissions > 0 ? (
                          <Badge variant="outline" className="bg-green-50 text-green-800 hover:bg-green-100">
                            {student.approved_submissions}
                          </Badge>
                        ) : (
                          student.approved_submissions
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.rejected_submissions > 0 ? (
                          <Badge variant="outline" className="bg-red-50 text-red-800 hover:bg-red-100">
                            {student.rejected_submissions}
                          </Badge>
                        ) : (
                          student.rejected_submissions
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{width: `${Math.min(100, student.completion_rate)}%`}}
                          ></div>
                        </div>
                        <span className="text-xs mt-1 inline-block">
                          {student.completion_rate.toFixed(0)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {student.average_score !== null 
                          ? student.average_score.toFixed(1) 
                          : '---'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnrollmentSubmissionStats;
