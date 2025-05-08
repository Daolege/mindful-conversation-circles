import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExcelExportService } from './ExcelExportService';
import { Badge } from '@/components/ui/badge';

const HomeworkSummaryTable = ({ courseId, onSelectLecture }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [homeworkData, setHomeworkData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  // 获取课程结构数据（章节和讲座）
  const { data: courseStructure, isLoading: isLoadingStructure } = useQuery({
    queryKey: ['homework-summary-structure', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_sections')
        .select(`
          id,
          title,
          position,
          course_lectures (
            id,
            title,
            position,
            requires_homework_completion
          )
        `)
        .eq('course_id', courseId)
        .order('position', { ascending: true });
        
      if (error) {
        console.error('Error fetching course structure:', error);
        return [];
      }
      
      // 对每个章节内部的讲座也按position排序
      return data.map(section => ({
        ...section,
        course_lectures: (section.course_lectures || []).sort((a, b) => a.position - b.position)
      }));
    },
    enabled: !!courseId,
  });
  
  // 获取课程作业数据
  const { data: homeworkItems, isLoading: isLoadingHomework } = useQuery({
    queryKey: ['homework-items', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework')
        .select('id, lecture_id, title, position')
        .eq('course_id', courseId)
        .order('position', { ascending: true });
        
      if (error) {
        console.error('Error fetching homework items:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!courseId,
  });
  
  // 获取所有作业提交数据
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['homework-all-submissions', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('id, lecture_id, user_id')
        .eq('course_id', courseId);
        
      if (error) {
        console.error('Error fetching submissions:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!courseId,
  });
  
  // 获取课程报名数据
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['course-enrollments', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('user_id')
        .eq('course_id', courseId)
        .eq('status', 'active');
        
      if (error) {
        console.error('Error fetching enrollments:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!courseId,
  });
  
  // 处理数据并计算统计信息
  useEffect(() => {
    if (courseStructure && homeworkItems && submissions && enrollments) {
      // 获取报名总人数
      const totalEnrolled = enrollments.length;
      
      // ��数据进行处理
      const processedData = courseStructure.flatMap(section => {
        // 过滤掉没有作业的讲座
        const lecturesWithHomework = section.course_lectures.filter(lecture => {
          return homeworkItems.some(hw => hw.lecture_id === lecture.id);
        });
        
        if (lecturesWithHomework.length === 0) return [];
        
        return lecturesWithHomework.map(lecture => {
          // 获取此讲座的作业
          const lectureHomeworks = homeworkItems.filter(hw => hw.lecture_id === lecture.id);
          
          // 获取此讲座作业的提交情况
          const lectureSubmissions = submissions.filter(sub => sub.lecture_id === lecture.id);
          
          // 计算已提交的不同用户数量（用户可能提交多个作业，需要去重）
          const uniqueUsers = new Set();
          lectureSubmissions.forEach(sub => uniqueUsers.add(sub.user_id));
          const submittedCount = uniqueUsers.size;
          
          // 计算完成率
          const completionRate = totalEnrolled > 0 ? Math.round((submittedCount / totalEnrolled) * 100) : 0;
          
          return {
            sectionId: section.id,
            sectionTitle: section.title,
            lectureId: lecture.id,
            lectureTitle: lecture.title,
            homeworkCount: lectureHomeworks.length,
            homeworkTitles: lectureHomeworks.map(hw => hw.title).join('、'),
            submittedCount,
            totalEnrolled,
            completionRate,
            position: section.position * 1000 + lecture.position // 用于排序
          };
        });
      }).sort((a, b) => a.position - b.position); // 按章节和讲座的位置排序
      
      setHomeworkData(processedData);
      setFilteredData(processedData);
    }
  }, [courseStructure, homeworkItems, submissions, enrollments]);
  
  // 处理搜索
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(homeworkData);
      return;
    }
    
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = homeworkData.filter(item => 
      item.sectionTitle.toLowerCase().includes(lowercasedSearch) || 
      item.lectureTitle.toLowerCase().includes(lowercasedSearch) ||
      item.homeworkTitles.toLowerCase().includes(lowercasedSearch)
    );
    
    setFilteredData(filtered);
  }, [searchTerm, homeworkData]);
  
  // 导出Excel功能
  const handleExport = async () => {
    try {
      // 格式化导出数据
      const exportData = filteredData.map(item => ({
        '章节': item.sectionTitle,
        '节次': item.lectureTitle,
        '作业标题': item.homeworkTitles,
        '完成情况': `${item.submittedCount}/${item.totalEnrolled}`,
        '完成率': `${item.completionRate}%`,
      }));
      
      // 调用导出服务
      await ExcelExportService.exportToExcel(
        exportData, 
        `课程${courseId}作业汇总-${new Date().toLocaleDateString()}`
      );
    } catch (error) {
      console.error('Export failed:', error);
    }
  };
  
  // 处理讲座选择
  const handleLectureSelect = (lectureId, sectionTitle, lectureTitle) => {
    if (onSelectLecture) {
      onSelectLecture(lectureId, sectionTitle, lectureTitle);
    }
  };
  
  // 修改: 处理查看详情功能 - 直接调用onSelectLecture切换到该讲座的详情视图
  const handleViewSubmissionDetail = (lectureId, sectionTitle, lectureTitle) => {
    handleLectureSelect(lectureId, sectionTitle, lectureTitle);
  };
  
  // 获取完成率颜色
  const getCompletionRateColor = (rate) => {
    if (rate >= 80) return "bg-green-100 text-green-800 hover:bg-green-200";
    if (rate >= 50) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    return "bg-red-100 text-red-800 hover:bg-red-200";
  };
  
  // 对数据按章节分组并计算每个章节的rowspan
  const processGroupedData = (data) => {
    if (!data || data.length === 0) return { data: [], sectionRowspans: {}, firstRowIndices: {} };
    
    // 按章节ID分组
    const sectionGroups = {};
    const sectionRowspans = {};
    const firstRowIndices = {};
    let currentIndex = 0;
    
    // 第一次遍历：按章节分组
    data.forEach(item => {
      const sectionId = item.sectionId;
      
      if (!sectionGroups[sectionId]) {
        sectionGroups[sectionId] = [];
        firstRowIndices[sectionId] = currentIndex; // 记录每个章节第一行的索引
      }
      
      sectionGroups[sectionId].push(item);
      currentIndex++;
    });
    
    // 计算每个章节的rowspan（对应章节包含的行数）
    Object.keys(sectionGroups).forEach(sectionId => {
      sectionRowspans[sectionId] = sectionGroups[sectionId].length;
    });
    
    return { 
      data, // 保持原始顺序的数据
      sectionRowspans, // 每个章节的rowspan值
      firstRowIndices // 每个章节第一行的索引
    };
  };
  
  // 处理分组数据
  const groupedDataInfo = processGroupedData(filteredData);
  
  if (isLoadingStructure || isLoadingHomework || isLoadingSubmissions || isLoadingEnrollments) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>作业汇总</CardTitle>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-[250px]" />
            <Skeleton className="h-9 w-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="h-[400px] relative overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="h-10 px-4 text-left align-middle font-medium">章节</th>
                    <th className="h-10 px-4 text-left align-middle font-medium">节次</th>
                    <th className="h-10 px-4 text-left align-middle font-medium">完成情况</th>
                    <th className="h-10 px-4 text-left align-middle font-medium">完成率</th>
                    <th className="h-10 px-4 text-left align-middle font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4"><Skeleton className="h-5 w-[150px]" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-[200px]" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-[80px]" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-[60px]" /></td>
                      <td className="p-4"><Skeleton className="h-8 w-[100px]" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>作业汇总</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索章节或讲座..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" title="导出Excel" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            未找到符合条件的章节和作业数据
          </div>
        ) : (
          <div className="rounded-md border">
            <div className="relative overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-10 px-4 text-left align-middle font-medium">章节</th>
                    <th className="h-10 px-4 text-left align-middle font-medium">节次</th>
                    <th className="h-10 px-4 text-left align-middle font-medium">完成情况</th>
                    <th className="h-10 px-4 text-left align-middle font-medium">完成率</th>
                    <th className="h-10 px-4 text-left align-middle font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedDataInfo.data.map((item, index) => {
                    const isSectionFirstRow = groupedDataInfo.firstRowIndices[item.sectionId] === index;
                    const sectionRowspan = groupedDataInfo.sectionRowspans[item.sectionId];
                    
                    return (
                      <tr 
                        key={`${item.sectionId}-${item.lectureId}-${index}`}
                        className="border-t hover:bg-muted/50"
                      >
                        {/* 仅在章节的第一行显示章节名称，并设置rowspan */}
                        {isSectionFirstRow && (
                          <td 
                            className="p-4 align-top border-r bg-muted/20" 
                            rowSpan={sectionRowspan}
                          >
                            <div className="font-medium">{item.sectionTitle}</div>
                          </td>
                        )}
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{item.lectureTitle}</div>
                            {item.homeworkCount > 0 && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {item.homeworkCount > 1
                                  ? `${item.homeworkCount}个作业: ${item.homeworkTitles}`
                                  : item.homeworkTitles
                                }
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">{`${item.submittedCount}/${item.totalEnrolled}`}</td>
                        <td className="p-4">
                          <Badge className={getCompletionRateColor(item.completionRate)}>
                            {item.completionRate}%
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                            onClick={() => handleViewSubmissionDetail(item.lectureId, item.sectionTitle, item.lectureTitle)}
                          >
                            查看详情
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HomeworkSummaryTable;
