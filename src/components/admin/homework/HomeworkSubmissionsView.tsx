
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { HomeworkSubmissionList } from './HomeworkSubmissionList';
import { CourseStructureNav } from './CourseStructureNav';
import { HomeworkSubmissionDetail } from './HomeworkSubmissionDetail';
import { StudentHomeworkList } from './StudentHomeworkList';
import { NotSubmittedStudentsList } from './NotSubmittedStudentsList';
import { HomeworkStatsDashboard } from './HomeworkStatsDashboard';
import { PdfExportService } from './PdfExportService';
import { AdminBreadcrumb } from './AdminBreadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  getCourseStructureForHomework,
  getHomeworkSubmissionsByCourseId,
  getHomeworkSubmissionsByLectureId,
  getHomeworkSubmissionsByStudentId,
  getStudentsWithoutSubmission,
  getHomeworkCompletionStats,
  batchUpdateHomeworkFeedback,
  HomeworkSubmission,
  CourseSection,
  HomeworkStats
} from '@/lib/services/homeworkSubmissionService';

export const HomeworkSubmissionsView = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedLectureId, setSelectedLectureId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [openExportDialog, setOpenExportDialog] = useState<boolean>(false);
  const [openBulkActionDialog, setOpenBulkActionDialog] = useState<boolean>(false);
  const [bulkActionType, setBulkActionType] = useState<string>('');
  
  // Convert courseId to number
  const courseIdNumber = courseId ? parseInt(courseId, 10) : 0;

  // Reset pagination when changing filters
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLectureId, filterStatus, searchQuery]);

  // Reset selected submissions when changing lecture or filter
  useEffect(() => {
    setSelectedSubmissions([]);
  }, [selectedLectureId, filterStatus]);

  // Fetch course structure for navigation
  const { 
    data: sections, 
    isLoading: isLoadingStructure 
  } = useQuery({
    queryKey: ['course-structure-homework', courseIdNumber],
    queryFn: () => getCourseStructureForHomework(courseIdNumber),
    enabled: !!courseIdNumber && courseIdNumber > 0,
  });

  // Fetch all submissions for the course
  const { 
    data: allSubmissions, 
    isLoading: isLoadingAll 
  } = useQuery({
    queryKey: ['homework-submissions-course', courseIdNumber],
    queryFn: () => getHomeworkSubmissionsByCourseId(courseIdNumber),
    enabled: !!courseIdNumber && courseIdNumber > 0,
  });

  // Fetch submissions for a specific lecture when selected
  const { 
    data: lectureSubmissions,
    isLoading: isLoadingLecture 
  } = useQuery({
    queryKey: ['homework-submissions-lecture', selectedLectureId],
    queryFn: () => getHomeworkSubmissionsByLectureId(selectedLectureId || ''),
    enabled: !!selectedLectureId,
  });

  // Fetch submissions for a specific student when selected
  const {
    data: studentSubmissions,
    isLoading: isLoadingStudent
  } = useQuery({
    queryKey: ['homework-submissions-student', selectedStudentId, courseIdNumber],
    queryFn: () => getHomeworkSubmissionsByStudentId(selectedStudentId || '', courseIdNumber),
    enabled: !!selectedStudentId && !!courseIdNumber && courseIdNumber > 0,
  });

  // Fetch students without submissions when "not-submitted" tab is active
  const {
    data: studentsWithoutSubmission,
    isLoading: isLoadingNotSubmitted
  } = useQuery({
    queryKey: ['students-without-submission', selectedLectureId, courseIdNumber],
    queryFn: () => getStudentsWithoutSubmission(selectedLectureId || '', courseIdNumber),
    enabled: activeTab === 'not-submitted' && !!courseIdNumber && courseIdNumber > 0,
  });

  // Fetch homework completion statistics
  const {
    data: homeworkStats,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['homework-completion-stats', courseIdNumber],
    queryFn: () => getHomeworkCompletionStats(courseIdNumber),
    enabled: activeTab === 'stats' && !!courseIdNumber && courseIdNumber > 0,
  });

  // Handle lecture selection
  const handleLectureSelect = (lectureId: string) => {
    setSelectedLectureId(lectureId);
    setSelectedStudentId(null);
    setSelectedSubmissionId(null);
    setCurrentPage(1);
    setActiveTab('all');
  };

  // Handle view all submissions
  const handleViewAll = () => {
    setSelectedLectureId(null);
    setSelectedStudentId(null);
    setSelectedSubmissionId(null);
    setCurrentPage(1);
    setActiveTab('all');
  };

  // Handle view submission
  const handleViewSubmission = (id: string) => {
    setSelectedSubmissionId(id);
    setActiveTab('detail');
  };

  // Handle view student
  const handleViewStudent = (id: string) => {
    setSelectedStudentId(id);
    setSelectedSubmissionId(null);
    setActiveTab('student');
  };

  // Handle export PDF
  const handleExportPdf = (studentId: string) => {
    setSelectedStudentId(studentId);
    setOpenExportDialog(true);
  };

  // Handle bulk action
  const handleBulkAction = (action: string) => {
    setBulkActionType(action);
    setOpenBulkActionDialog(true);
  };

  // Process bulk action
  const processBulkAction = async () => {
    if (selectedSubmissions.length === 0) {
      toast.error('没有选择任何作业');
      return;
    }

    if (bulkActionType === 'approve' || bulkActionType === 'reject') {
      try {
        await batchUpdateHomeworkFeedback(selectedSubmissions, {
          status: bulkActionType === 'approve' ? 'reviewed' : 'rejected',
          feedback: bulkActionType === 'approve' ? '批量通过' : '批量不通过'
        });

        toast.success(`已${bulkActionType === 'approve' ? '批准' : '拒绝'} ${selectedSubmissions.length} 份作业`);
        queryClient.invalidateQueries({ queryKey: ['homework-submissions-course'] });
        queryClient.invalidateQueries({ queryKey: ['homework-submissions-lecture'] });
        setSelectedSubmissions([]);
      } catch (error) {
        toast.error('批量操作失败');
        console.error('Bulk action error:', error);
      }
    } else if (bulkActionType === 'export') {
      // For export, we'll just close the dialog and open the export dialog
      setOpenExportDialog(true);
    }

    setOpenBulkActionDialog(false);
  };

  // Calculate submission statistics for navigation
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

  // Create a map of lecture IDs to titles for the stats component
  const lectureMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    sections?.forEach(section => {
      section.lectures?.forEach(lecture => {
        map[lecture.id] = lecture.title;
      });
    });
    return map;
  }, [sections]);

  // Calculate total submissions for pagination
  const currentSubmissions = selectedLectureId ? lectureSubmissions : allSubmissions;
  
  // Get student info for the student view
  const selectedStudent = studentSubmissions?.[0];
  const studentName = selectedStudent?.user_name || 'Unknown Student';
  const studentEmail = selectedStudent?.user_email || '';

  // Get current and neighboring submission IDs for navigation
  const submissionList = (selectedLectureId ? lectureSubmissions : allSubmissions) || [];
  const currentSubmissionIndex = submissionList.findIndex(s => s.id === selectedSubmissionId);
  const hasPrevSubmission = currentSubmissionIndex > 0;
  const hasNextSubmission = currentSubmissionIndex < submissionList.length - 1 && currentSubmissionIndex !== -1;
  
  const handleNavigatePrevSubmission = () => {
    if (hasPrevSubmission) {
      setSelectedSubmissionId(submissionList[currentSubmissionIndex - 1].id);
    }
  };
  
  const handleNavigateNextSubmission = () => {
    if (hasNextSubmission) {
      setSelectedSubmissionId(submissionList[currentSubmissionIndex + 1].id);
    }
  };

  return (
    <div className="space-y-6">
      <AdminBreadcrumb 
        items={[
          { label: '课程管理', href: '/admin/courses-new' },
          { label: `课程 ${courseId}`, href: `/admin/courses-new/${courseId}` },
          { label: '作业管理' }
        ]} 
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Course Structure Navigation */}
        <div className="col-span-12 lg:col-span-3">
          <CourseStructureNav 
            sections={sections || []}
            isLoading={isLoadingStructure}
            selectedLectureId={selectedLectureId}
            onLectureSelect={handleLectureSelect}
            onViewAll={handleViewAll}
            submissionStats={submissionStats}
          />
        </div>
        
        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">全部作业</TabsTrigger>
              <TabsTrigger value="not-submitted">未提交</TabsTrigger>
              <TabsTrigger value="stats">统计报表</TabsTrigger>
              {selectedStudentId && (
                <TabsTrigger value="student">学生视图</TabsTrigger>
              )}
              {selectedSubmissionId && (
                <TabsTrigger value="detail">作业详情</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="all">
              <HomeworkSubmissionList 
                submissions={currentSubmissions || []}
                isLoading={selectedLectureId ? isLoadingLecture : isLoadingAll}
                filter={filterStatus}
                onFilterChange={setFilterStatus}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                currentPage={currentPage}
                totalSubmissions={(currentSubmissions || []).length}
                onPageChange={setCurrentPage}
                onViewSubmission={handleViewSubmission}
                onViewStudent={handleViewStudent}
                onExportSubmission={(id) => {
                  setSelectedSubmissionId(id);
                  setOpenExportDialog(true);
                }}
                selectedSubmissions={selectedSubmissions}
                onSelectionChange={setSelectedSubmissions}
                showBulkActions={true}
                onBulkAction={handleBulkAction}
              />
            </TabsContent>
            
            <TabsContent value="not-submitted">
              <NotSubmittedStudentsList 
                students={studentsWithoutSubmission || []}
                isLoading={isLoadingNotSubmitted}
                onViewStudent={handleViewStudent}
                lectureTitle={selectedLectureId ? lectureMap[selectedLectureId] : undefined}
              />
            </TabsContent>
            
            <TabsContent value="stats">
              <HomeworkStatsDashboard 
                stats={homeworkStats as HomeworkStats}
                isLoading={isLoadingStats}
                courseTitle={`课程 ${courseId}`}
                lectureMap={lectureMap}
              />
            </TabsContent>
            
            {selectedStudentId && (
              <TabsContent value="student">
                <StudentHomeworkList 
                  studentId={selectedStudentId}
                  studentName={studentName}
                  studentEmail={studentEmail}
                  submissions={studentSubmissions || []}
                  isLoading={isLoadingStudent}
                  onViewSubmission={handleViewSubmission}
                  onExportPdf={handleExportPdf}
                />
              </TabsContent>
            )}
            
            {selectedSubmissionId && (
              <TabsContent value="detail">
                <HomeworkSubmissionDetail 
                  submissionId={selectedSubmissionId}
                  onNavigatePrev={handleNavigatePrevSubmission}
                  onNavigateNext={handleNavigateNextSubmission}
                  onViewStudent={handleViewStudent}
                  hasPrev={hasPrevSubmission}
                  hasNext={hasNextSubmission}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={openExportDialog} onOpenChange={setOpenExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导出作业PDF</DialogTitle>
            <DialogDescription>
              自定义导出PDF文档的内容和格式
            </DialogDescription>
          </DialogHeader>
          <PdfExportService
            submissions={
              selectedSubmissionId
                ? currentSubmissions?.filter(s => s.id === selectedSubmissionId) || []
                : selectedStudentId
                  ? studentSubmissions || []
                  : selectedSubmissions.length > 0
                    ? currentSubmissions?.filter(s => selectedSubmissions.includes(s.id)) || []
                    : []
            }
            studentName={studentName}
            courseTitle={`课程 ${courseId}`}
            onExportComplete={() => setOpenExportDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={openBulkActionDialog} onOpenChange={setOpenBulkActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkActionType === 'approve' 
                ? '批量通过作业' 
                : bulkActionType === 'reject' 
                  ? '批量不通过作业' 
                  : '批量导出作业'}
            </DialogTitle>
            <DialogDescription>
              {bulkActionType === 'approve' 
                ? '确定要批量通过选中的作业吗？' 
                : bulkActionType === 'reject' 
                  ? '确定要批量不通过选中的作业吗？' 
                  : '确定要批量导出选中的作业吗？'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 my-4">
            <Checkbox id="confirm" />
            <Label htmlFor="confirm">
              我确认执行此操作 ({selectedSubmissions.length} 份作业)
            </Label>
          </div>
          <div className="flex justify-end gap-4">
            <button
              className="px-4 py-2 border rounded-md"
              onClick={() => setOpenBulkActionDialog(false)}
            >
              取消
            </button>
            <button
              className={`px-4 py-2 rounded-md text-white ${
                bulkActionType === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : bulkActionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
              }`}
              onClick={processBulkAction}
            >
              确认
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeworkSubmissionsView;
