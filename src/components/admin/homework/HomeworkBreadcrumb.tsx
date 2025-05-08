
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator,
  BreadcrumbList
} from '@/components/ui/breadcrumb';

interface HomeworkBreadcrumbProps {
  courseId: number;
  sectionTitle?: string;
  lectureTitle?: string;
  studentId?: string | null;
  studentName?: string;
  onClearLecture?: () => void;
  onClearStudent?: () => void;
}

const HomeworkBreadcrumb: React.FC<HomeworkBreadcrumbProps> = ({
  courseId,
  sectionTitle,
  lectureTitle,
  studentId,
  studentName,
  onClearLecture,
  onClearStudent
}) => {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-gray-600">
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin?tab=courses-new">
            课程管理
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        
        <BreadcrumbItem>
          <BreadcrumbLink href={`/admin/courses-new/${courseId}`}>
            课程 {courseId}
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>
        
        <BreadcrumbItem>
          {!lectureTitle ? (
            <span className="text-gray-600 font-medium">作业管理</span>
          ) : (
            <Button 
              variant="link" 
              className="p-0 h-auto text-gray-600"
              onClick={onClearLecture}
            >
              作业管理
            </Button>
          )}
        </BreadcrumbItem>
        
        {lectureTitle && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            
            <BreadcrumbItem>
              {!studentId ? (
                <span className="text-gray-600 font-medium">{sectionTitle} - {lectureTitle}</span>
              ) : (
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-gray-600"
                  onClick={onClearStudent}
                >
                  {sectionTitle} - {lectureTitle}
                </Button>
              )}
            </BreadcrumbItem>
          </>
        )}
        
        {studentId && studentName && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            
            <BreadcrumbItem>
              <span className="text-gray-600 font-medium">学生提交: {studentName}</span>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default HomeworkBreadcrumb;
