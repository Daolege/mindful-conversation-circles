
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { CourseWithDetails } from '@/lib/types/course-new';
import { useIsMobile } from '@/hooks/use-mobile';

interface CourseBreadcrumbProps {
  course: CourseWithDetails;
}

export const CourseBreadcrumb: React.FC<CourseBreadcrumbProps> = ({ course }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-left-3 duration-500">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">首页</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/courses">全部课程</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{course.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button
        variant="ghost"
        size="sm"
        className="group hover:bg-transparent transition-all duration-200 flex items-center gap-2 animate-in fade-in slide-in-from-right-3 duration-500"
        onClick={handleGoBack}
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        返回
      </Button>
    </div>
  );
};
