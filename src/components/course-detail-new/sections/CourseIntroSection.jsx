
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { File } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';
import { Skeleton } from '@/components/ui/skeleton';

const CourseIntroSection = ({ course, isLoading = false }) => {
  const { t } = useTranslations();

  if (isLoading) {
    return (
      <Card className="shadow-sm animate-in fade-in duration-500">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl flex items-center gap-2">
            <File className="h-5 w-5" />
            {t('courses:courseIntroduction')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 py-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-500 shadow-sm animate-in fade-in duration-500">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl flex items-center gap-2">
          <File className="h-5 w-5" />
          {t('courses:courseIntroduction')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none py-4">
          {course.description ? (
            <div className="whitespace-pre-wrap">{course.description}</div>
          ) : (
            <div className="text-gray-500">{t('courses:noDescription')}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseIntroSection;
