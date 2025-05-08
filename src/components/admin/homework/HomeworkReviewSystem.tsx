
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import HomeworkBreadcrumb from './HomeworkBreadcrumb';
import CourseOutlineNavigation from './CourseOutlineNavigation';
import { getCourseStructureForHomework } from '@/lib/services/homeworkSubmissionService';
import HomeworkSummaryTable from './HomeworkSummaryTable';
import HomeworkSubmissionTabs from './HomeworkSubmissionTabs';
import StudentsList from './StudentsList';

interface HomeworkReviewSystemProps {
  courseId: number;
}

export const HomeworkReviewSystem: React.FC<HomeworkReviewSystemProps> = ({ courseId }) => {
  // UI状态
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState<string>('');
  const [lectureTitle, setLectureTitle] = useState<string>('');
  const [viewMode, setViewMode] = useState<'summary' | 'details' | 'student'>('summary');
  
  // 1. 获取课程结构数据（章节和讲座）
  const { data: courseStructure, isLoading: isLoadingStructure } = useQuery({
    queryKey: ['homework-course-structure', courseId],
    queryFn: () => getCourseStructureForHomework(courseId),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });

  // 2. 获取所有作业提交以生成统计数据
  const { data: allSubmissions } = useQuery({
    queryKey: ['all-homework-submissions', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework_submissions')
        .select('id, lecture_id, status')
        .eq('course_id', courseId);
        
      if (error) {
        console.error('Error fetching all submissions:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!courseId,
  });

  // 3. 计算提交统计数据用于导航
  const submissionStats = React.useMemo(() => {
    const stats: Record<string, { total: number; pending: number; reviewed: number; rejected: number }> = {};
    
    const submissions = allSubmissions || [];
    submissions.forEach(submission => {
      if (!stats[submission.lecture_id]) {
        stats[submission.lecture_id] = { total: 0, pending: 0, reviewed: 0, rejected: 0 };
      }
      
      stats[submission.lecture_id].total++;
      
      if (submission.status === 'pending') stats[submission.lecture_id].pending++;
      else if (submission.status === 'reviewed') stats[submission.lecture_id].reviewed++;
      else if (submission.status === 'rejected') stats[submission.lecture_id].rejected++;
    });
    
    return stats;
  }, [allSubmissions]);

  // 4. 处理讲座选择
  const handleSelectLecture = (lectureId: string, sectionTitleValue?: string, lectureTitleValue?: string) => {
    setSelectedLectureId(lectureId);
    setSelectedStudentId(null);
    setViewMode('details');
    
    // 设置标题（如果提供）
    if (sectionTitleValue && lectureTitleValue) {
      setSectionTitle(sectionTitleValue);
      setLectureTitle(lectureTitleValue);
    }
    // 否则尝试从课程结构中查找标题
    else if (courseStructure) {
      for (const section of courseStructure) {
        const lecture = section.lectures.find(lec => lec.id === lectureId);
        if (lecture) {
          setSectionTitle(section.title);
          setLectureTitle(lecture.title);
          break;
        }
      }
    }
  };
  
  // 5. 返回汇总页面
  const handleBackToSummary = () => {
    setSelectedLectureId(null);
    setSelectedStudentId(null);
    setViewMode('summary');
  };
  
  // 6. 选择学生
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setViewMode('student');
  };
  
  // 7. 获取学生姓名（用于面包屑导航）
  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile-for-breadcrumb', selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', selectedStudentId)
        .single();
        
      if (error) {
        console.error('Error fetching student profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!selectedStudentId,
  });
  
  // 8. 渲染页面内容
  const renderContent = () => {
    // 加载状态
    if (isLoadingStructure) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      );
    }
    
    // 根据当前视图模式渲染不同内容
    switch (viewMode) {
      case 'summary':
        return (
          <HomeworkSummaryTable 
            courseId={courseId} 
            onSelectLecture={handleSelectLecture} 
          />
        );
      
      case 'details':
        if (selectedLectureId) {
          return (
            <HomeworkSubmissionTabs
              courseId={courseId}
              lectureId={selectedLectureId}
              onBack={handleBackToSummary}
              sectionTitle={sectionTitle}
              lectureTitle={lectureTitle}
            />
          );
        }
        return <div>请选择一个讲座查看作业提交</div>;
      
      case 'student':
        if (selectedLectureId && selectedStudentId) {
          return (
            <StudentsList
              studentId={selectedStudentId}
              lectureId={selectedLectureId}
              onBack={() => setViewMode('details')}
            />
          );
        }
        return <div>请选择一个学生查看作业详情</div>;
      
      default:
        return <div>未知视图</div>;
    }
  };
  
  return (
    <div className="space-y-6">
      {/* 面包屑导航 */}
      <HomeworkBreadcrumb 
        courseId={courseId} 
        sectionTitle={viewMode !== 'summary' ? sectionTitle : undefined}
        lectureTitle={viewMode !== 'summary' ? lectureTitle : undefined}
        studentId={viewMode === 'student' ? selectedStudentId : null}
        studentName={studentProfile?.full_name || '用户名不详'}
        onClearLecture={handleBackToSummary}
        onClearStudent={() => setViewMode('details')}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧栏：课程结构导航 */}
        <div className="lg:col-span-1">
          <CourseOutlineNavigation
            sections={courseStructure || []}
            selectedLectureId={selectedLectureId}
            onSelectLecture={handleSelectLecture}
            submissionStats={submissionStats}
            isLoading={isLoadingStructure}
          />
        </div>
        
        {/* 主内容区域 */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default HomeworkReviewSystem;
