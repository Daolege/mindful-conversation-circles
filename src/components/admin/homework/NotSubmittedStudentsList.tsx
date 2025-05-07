
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Student {
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
}

interface NotSubmittedStudentsListProps {
  students: Student[];
  isLoading: boolean;
  onViewStudent: (studentId: string) => void;
  lectureTitle?: string;
  homeworkTitle?: string;
}

export const NotSubmittedStudentsList: React.FC<NotSubmittedStudentsListProps> = ({
  students = [],
  isLoading,
  onViewStudent,
  lectureTitle,
  homeworkTitle
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const title = homeworkTitle 
    ? `未提交"${homeworkTitle}"的学生` 
    : lectureTitle 
      ? `未提交"${lectureTitle}"作业的学生` 
      : '未提交作业的学生';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          共有 {students.length} 名学生未提交作业
        </CardDescription>
      </CardHeader>
      <CardContent>
        {students.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>学生信息</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.user_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.user_avatar} alt={student.user_name} />
                        <AvatarFallback>
                          {student.user_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.user_name}</div>
                        <div className="text-sm text-muted-foreground">{student.user_email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewStudent(student.user_id)}
                    >
                      <User className="h-4 w-4 mr-1" />
                      查看学生
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center p-8">
            <p>所有学生都已提交作业</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotSubmittedStudentsList;
