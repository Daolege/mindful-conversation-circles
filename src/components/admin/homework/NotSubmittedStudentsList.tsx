
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NotSubmittedStudentsListProps {
  courseId: number;
  lectureId: string;
}

export const NotSubmittedStudentsList: React.FC<NotSubmittedStudentsListProps> = ({
  courseId,
  lectureId
}) => {
  // Fetch students who haven't submitted homework
  const { data: notSubmittedStudents, isLoading } = useQuery({
    queryKey: ['not-submitted-students', courseId, lectureId],
    queryFn: async () => {
      // 1. Get all enrolled students
      const { data: enrolledStudents, error: enrolledError } = await supabase
        .from('course_enrollments')
        .select(`
          profile_id,
          profiles (
            id,
            full_name,
            email
          )
        `)
        .eq('course_id', courseId);
        
      if (enrolledError) {
        console.error('Error fetching enrolled students:', enrolledError);
        return [];
      }
      
      // 2. Get students who submitted homework
      const { data: submittedStudents, error: submittedError } = await supabase
        .from('homework_submissions')
        .select('profile_id')
        .eq('lecture_id', lectureId);
        
      if (submittedError) {
        console.error('Error fetching submitted students:', submittedError);
        return [];
      }
      
      // 3. Filter out students who have submitted
      const submittedIds = new Set(submittedStudents.map(s => s.profile_id));
      
      return enrolledStudents
        .filter(enrollment => !submittedIds.has(enrollment.profile_id))
        .map(enrollment => enrollment.profiles);
    },
    enabled: !!courseId && !!lectureId,
    staleTime: 5 * 60 * 1000
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>未提交作业学生</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
          <AlertCircle className="h-5 w-5" />
          未提交作业学生
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notSubmittedStudents && notSubmittedStudents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {notSubmittedStudents.map((student, index) => (
              <div 
                key={student.id || index} 
                className="flex items-center p-3 bg-amber-50 border border-amber-100 rounded-md"
              >
                <User className="h-4 w-4 mr-3 text-amber-600" />
                <div>
                  <div className="font-medium text-gray-900">{student.full_name || '未知学生'}</div>
                  <div className="text-xs text-gray-500">{student.email || ''}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            所有学生均已提交作业
          </div>
        )}
        
        {/* Student count */}
        {notSubmittedStudents && notSubmittedStudents.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            共 {notSubmittedStudents.length} 名学生未提交作业
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotSubmittedStudentsList;
