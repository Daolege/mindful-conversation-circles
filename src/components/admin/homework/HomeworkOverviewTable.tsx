
import React, { useState, useMemo } from 'react';
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
import { Download, Search, FileSpreadsheet, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HomeworkOverviewTableProps {
  courseId: number;
  sections: Array<{
    id: string;
    title: string;
    position: number;
    lectures: Array<{
      id: string;
      title: string;
      position: number;
      requires_homework_completion: boolean;
    }>;
  }>;
  onViewHomeworkDetails: (lectureId: string) => void;
}

interface HomeworkItem {
  id: string;
  title: string;
  lecture_id: string;
  position: number;
}

interface EnrollmentCount {
  lecture_id: string;
  enrolled_count: number;
}

interface SubmissionCount {
  lecture_id: string;
  homework_id: string;
  submission_count: number;
}

export const HomeworkOverviewTable: React.FC<HomeworkOverviewTableProps> = ({
  courseId,
  sections,
  onViewHomeworkDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch homework items for the course
  const { data: homeworkItems = [], isLoading: isLoadingHomework } = useQuery({
    queryKey: ['homework-items', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework')
        .select('id, title, lecture_id, position')
        .eq('course_id', courseId)
        .order('position');
      
      if (error) {
        console.error('Error fetching homework:', error);
        return [];
      }
      
      return (data || []) as HomeworkItem[];
    },
    enabled: !!courseId,
  });

  // 获取每个讲座的报名人数 - 直接查询替代RPC函数
  const { data: enrollmentCounts = [], isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['lecture-enrollments', courseId],
    queryFn: async () => {
      // 通过course_enrollments表计算每个课程的报名人数
      const { data: enrollments, error } = await supabase
        .from('course_enrollments')
        .select('user_id')
        .eq('course_id', courseId);
        
      if (error) {
        console.error('Error fetching enrollments:', error);
        return [];
      }
      
      // 计算报名总人数
      const totalEnrollments = (enrollments || []).length;
      
      // 为每个讲座分配相同的报名人数
      const result: EnrollmentCount[] = [];
      
      if (sections && sections.length > 0) {
        sections.forEach(section => {
          section.lectures.forEach(lecture => {
            result.push({
              lecture_id: lecture.id,
              enrolled_count: totalEnrollments
            });
          });
        });
      }
      
      return result;
    },
    enabled: !!courseId && !!sections,
  });

  // 获取作业提交统计 - 直接查询替代RPC函数
  const { data: submissionCounts = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['homework-submissions', courseId],
    queryFn: async () => {
      // 直接查询homework_submissions表获取提交数据
      const { data: submissions, error } = await supabase
        .from('homework_submissions')
        .select('homework_id, lecture_id')
        .eq('course_id', courseId);
        
      if (error) {
        console.error('Error fetching submissions:', error);
        return [];
      }
      
      // 计算每个作业的提交次数
      const submissionMap: Record<string, Record<string, number>> = {};
      
      (submissions || []).forEach(submission => {
        // 初始化讲座的记录
        if (!submissionMap[submission.lecture_id]) {
          submissionMap[submission.lecture_id] = {};
        }
        
        // 更新作业的提交次数
        if (!submissionMap[submission.lecture_id][submission.homework_id]) {
          submissionMap[submission.lecture_id][submission.homework_id] = 0;
        }
        submissionMap[submission.lecture_id][submission.homework_id]++;
      });
      
      // 转换为所需的格式
      const result: SubmissionCount[] = [];
      
      Object.entries(submissionMap).forEach(([lectureId, homeworkCounts]) => {
        Object.entries(homeworkCounts).forEach(([homeworkId, count]) => {
          result.push({
            lecture_id: lectureId,
            homework_id: homeworkId,
            submission_count: count
          });
        });
      });
      
      return result;
    },
    enabled: !!courseId,
  });

  // Organize data by section, lecture, and homework
  const tableData = useMemo(() => {
    const result: Array<{
      sectionId: string;
      sectionTitle: string;
      sectionPosition: number;
      lectureId: string;
      lectureTitle: string;
      lecturePosition: number;
      homeworkId: string;
      homeworkTitle: string;
      homeworkPosition: number;
      submissionCount: number;
      enrollmentCount: number;
    }> = [];

    // Sort sections by position
    const sortedSections = [...sections].sort((a, b) => a.position - b.position);

    sortedSections.forEach(section => {
      // Sort lectures by position
      const sortedLectures = [...section.lectures].sort((a, b) => a.position - b.position);
      
      sortedLectures.forEach(lecture => {
        // Get homework for this lecture
        const lectureHomework = homeworkItems.filter(hw => hw.lecture_id === lecture.id);
        
        // Get enrollment count for this lecture
        const enrollmentCount = enrollmentCounts.find(e => e.lecture_id === lecture.id)?.enrolled_count || 0;
        
        if (lectureHomework.length === 0) {
          // If no homework exists, still add the lecture with 0 submissions
          result.push({
            sectionId: section.id,
            sectionTitle: section.title,
            sectionPosition: section.position,
            lectureId: lecture.id,
            lectureTitle: lecture.title,
            lecturePosition: lecture.position,
            homeworkId: '',
            homeworkTitle: '暂无作业',
            homeworkPosition: 0,
            submissionCount: 0,
            enrollmentCount
          });
        } else {
          // Sort homework by position
          const sortedHomework = [...lectureHomework].sort((a, b) => a.position - b.position);
          
          sortedHomework.forEach(homework => {
            // Get submission count for this homework
            const submissionCount = submissionCounts.find(
              s => s.lecture_id === lecture.id && s.homework_id === homework.id
            )?.submission_count || 0;
            
            result.push({
              sectionId: section.id,
              sectionTitle: section.title,
              sectionPosition: section.position,
              lectureId: lecture.id,
              lectureTitle: lecture.title,
              lecturePosition: lecture.position,
              homeworkId: homework.id,
              homeworkTitle: homework.title,
              homeworkPosition: homework.position,
              submissionCount,
              enrollmentCount
            });
          });
        }
      });
    });

    return result;
  }, [sections, homeworkItems, enrollmentCounts, submissionCounts]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return tableData.filter(item => 
      item.sectionTitle.toLowerCase().includes(lowercaseSearch) ||
      item.lectureTitle.toLowerCase().includes(lowercaseSearch) ||
      item.homeworkTitle.toLowerCase().includes(lowercaseSearch)
    );
  }, [tableData, searchTerm]);

  // Group data for row spanning
  const groupedData = useMemo(() => {
    const grouped: {
      [sectionId: string]: {
        section: {
          id: string;
          title: string;
          rowSpan: number;
        };
        lectures: {
          [lectureId: string]: {
            id: string;
            title: string;
            rowSpan: number;
            homework: {
              id: string;
              title: string;
              submissionCount: number;
              enrollmentCount: number;
            }[];
          };
        };
      };
    } = {};

    filteredData.forEach(item => {
      // Initialize section if not exists
      if (!grouped[item.sectionId]) {
        grouped[item.sectionId] = {
          section: { id: item.sectionId, title: item.sectionTitle, rowSpan: 0 },
          lectures: {}
        };
      }

      // Initialize lecture if not exists
      if (!grouped[item.sectionId].lectures[item.lectureId]) {
        grouped[item.sectionId].lectures[item.lectureId] = {
          id: item.lectureId,
          title: item.lectureTitle,
          rowSpan: 0,
          homework: []
        };
      }

      // Add homework to lecture
      grouped[item.sectionId].lectures[item.lectureId].homework.push({
        id: item.homeworkId,
        title: item.homeworkTitle,
        submissionCount: item.submissionCount,
        enrollmentCount: item.enrollmentCount
      });

      // Increment lecture rowSpan
      grouped[item.sectionId].lectures[item.lectureId].rowSpan += 1;
      
      // Increment section rowSpan
      grouped[item.sectionId].section.rowSpan += 1;
    });

    return grouped;
  }, [filteredData]);

  // Export data to Excel
  const handleExportToExcel = () => {
    // Prepare data for export
    const exportData = tableData.map(item => ({
      '章节': item.sectionTitle,
      '节次': item.lectureTitle,
      '作业': item.homeworkTitle,
      '完成情况': `${item.submissionCount}/${item.enrollmentCount}`,
      '完成率': item.enrollmentCount > 0 ? `${Math.round(item.submissionCount / item.enrollmentCount * 100)}%` : '0%'
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '作业完成情况');
    
    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `课程${courseId}作业完成情况.xlsx`);
    
    toast.success('导出成功', { description: '作业完成情况已成功导出为Excel文件' });
  };

  // Render table
  const renderTableContent = () => {
    const flattenedRows: JSX.Element[] = [];
    
    // Loop through grouped data to create rows with proper rowSpan
    Object.values(groupedData).forEach(sectionData => {
      const sectionId = sectionData.section.id;
      const sectionTitle = sectionData.section.title;
      const sectionRowSpan = sectionData.section.rowSpan;
      
      let isFirstLectureInSection = true;
      
      Object.values(sectionData.lectures).forEach(lectureData => {
        const lectureId = lectureData.id;
        const lectureTitle = lectureData.title;
        const lectureRowSpan = lectureData.rowSpan;
        
        let isFirstHomeworkInLecture = true;
        
        lectureData.homework.forEach(homework => {
          const row = (
            <TableRow key={`${sectionId}-${lectureId}-${homework.id || Math.random()}`}>
              {isFirstLectureInSection && (
                <TableCell className="font-medium" rowSpan={sectionRowSpan}>
                  {sectionTitle}
                </TableCell>
              )}
              {isFirstHomeworkInLecture && (
                <TableCell rowSpan={lectureRowSpan}>
                  {lectureTitle}
                </TableCell>
              )}
              <TableCell>
                {homework.title}
              </TableCell>
              <TableCell className="text-center">
                {`${homework.submissionCount}/${homework.enrollmentCount}`}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewHomeworkDetails(lectureId)}
                  disabled={!homework.id}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  查看详情
                </Button>
              </TableCell>
            </TableRow>
          );
          
          flattenedRows.push(row);
          
          isFirstLectureInSection = false;
          isFirstHomeworkInLecture = false;
        });
      });
    });
    
    return flattenedRows;
  };

  const isLoading = isLoadingHomework || isLoadingEnrollments || isLoadingSubmissions;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>课程作业完成情况</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索章节、节次或作业..."
                className="pl-8 w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleExportToExcel} 
              className="flex items-center gap-1"
            >
              <FileSpreadsheet className="h-4 w-4" />
              导出Excel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : tableData.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">章节</TableHead>
                  <TableHead className="w-[20%]">节次</TableHead>
                  <TableHead className="w-[30%]">作业</TableHead>
                  <TableHead className="w-[15%] text-center">完成情况</TableHead>
                  <TableHead className="w-[15%] text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTableContent()}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            暂无数据
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomeworkOverviewTable;
