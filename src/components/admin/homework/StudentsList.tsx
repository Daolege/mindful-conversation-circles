
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Calendar, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface StudentsListProps {
  studentId: string;
  lectureId: string;
}

export const StudentsList: React.FC<StudentsListProps> = ({
  studentId,
  lectureId
}) => {
  // Fetch student submission details
  const { data, isLoading } = useQuery({
    queryKey: ['student-homework', studentId, lectureId],
    queryFn: async () => {
      // Get student details
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();
        
      if (studentError) {
        console.error('Error fetching student details:', studentError);
        return null;
      }
      
      // Get homework submission
      const { data: submissionData, error: submissionError } = await supabase
        .from('homework_submissions')
        .select(`
          id,
          answer,
          created_at,
          submitted_at,
          status,
          course_lectures (
            title,
            description
          )
        `)
        .eq('user_id', studentId)
        .eq('lecture_id', lectureId)
        .single();
        
      if (submissionError) {
        console.error('Error fetching homework submission:', submissionError);
        return { student: studentData, submission: null };
      }
      
      return {
        student: studentData,
        submission: submissionData
      };
    },
    enabled: !!studentId && !!lectureId,
    staleTime: 5 * 60 * 1000
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>学生作业详情</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!data || !data.student) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>学生作业详情</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            无法加载学生信息
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Student info card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            学生信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">姓名</div>
              <div className="font-medium">{data.student.full_name || '未知'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">邮箱</div>
              <div className="font-medium">{data.student.email || '未知'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Homework submission card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            作业提交内容
          </CardTitle>
          {data.submission && (
            <div className="text-sm text-gray-500 flex items-center mt-2">
              <Calendar className="h-4 w-4 mr-1" />
              提交于: {format(new Date(data.submission.created_at), 'yyyy-MM-dd HH:mm:ss')}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {data.submission ? (
            <div className="border rounded-lg p-4 bg-gray-50">
              {data.submission.answer ? (
                <div dangerouslySetInnerHTML={{ __html: data.submission.answer }} />
              ) : (
                <div className="text-gray-500">（提交内容为空）</div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              该学生尚未提交作业
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsList;
