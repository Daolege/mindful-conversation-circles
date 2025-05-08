
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertCircle, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface NotSubmittedStudentsListProps {
  courseId: number;
  lectureId: string;
  searchTerm?: string;
}

export const NotSubmittedStudentsList: React.FC<NotSubmittedStudentsListProps> = ({
  courseId,
  lectureId,
  searchTerm = ''
}) => {
  // Fetch students who haven't submitted homework
  const { data: notSubmittedStudents, isLoading } = useQuery({
    queryKey: ['not-submitted-students', courseId, lectureId, searchTerm],
    queryFn: async () => {
      // 1. Get all enrolled students
      const { data: enrolledStudents, error: enrolledError } = await supabase
        .from('course_enrollments')
        .select('user_id')
        .eq('course_id', courseId);
        
      if (enrolledError) {
        console.error('Error fetching enrolled students:', enrolledError);
        return [];
      }
      
      // 2. Get students who submitted homework
      const { data: submittedStudents, error: submittedError } = await supabase
        .from('homework_submissions')
        .select('user_id')
        .eq('lecture_id', lectureId);
        
      if (submittedError) {
        console.error('Error fetching submitted students:', submittedError);
        return [];
      }
      
      // 3. Filter out students who have submitted
      const submittedIds = new Set(submittedStudents?.map(s => s.user_id) || []);
      const notSubmittedUserIds = (enrolledStudents || [])
        .filter(enrollment => !submittedIds.has(enrollment.user_id))
        .map(enrollment => enrollment.user_id);
      
      // 4. Get profile information for not submitted students
      if (notSubmittedUserIds.length === 0) {
        return [];
      }
      
      const { data: studentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', notSubmittedUserIds);
        
      if (profilesError) {
        console.error('Error fetching student profiles:', profilesError);
        return [];
      }
      
      // 5. Return formatted student data
      return (studentProfiles || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || '用户名不详',
        email: profile.email || ''
      }));
    },
    enabled: !!courseId && !!lectureId,
    staleTime: 5 * 60 * 1000
  });
  
  // Filter students based on search term
  const filteredStudents = React.useMemo(() => {
    if (!notSubmittedStudents) return [];
    if (!searchTerm) return notSubmittedStudents;
    
    const searchLower = searchTerm.toLowerCase();
    return notSubmittedStudents.filter(student => 
      student.full_name.toLowerCase().includes(searchLower) || 
      student.email.toLowerCase().includes(searchLower)
    );
  }, [notSubmittedStudents, searchTerm]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }
  
  return (
    <div>
      {filteredStudents && filteredStudents.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.full_name}</TableCell>
                <TableCell>{student.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-6 text-gray-500">
          {searchTerm ? '没有找到匹配的学生' : '所有学生均已提交作业'}
        </div>
      )}
      
      {/* Student count */}
      {filteredStudents && filteredStudents.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          共 {filteredStudents.length} 名学生未提交作业
        </div>
      )}
    </div>
  );
};

export default NotSubmittedStudentsList;
