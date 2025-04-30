
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { CourseWithDetails } from '@/lib/types/course-new';
import { useAuth } from '@/contexts/authHooks';

interface CourseEnrollCardNewProps {
  course: CourseWithDetails;
}

export const CourseEnrollCardNew: React.FC<CourseEnrollCardNewProps> = ({ course }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEnroll = () => {
    // 如果用户未登录，先跳转到登录页面
    if (!user) {
      navigate(`/auth?redirect=/courses-new/${course.id}`);
      return;
    }

    // 否则跳转到结账页面，并传递课程ID
    navigate(`/checkout?courseId=${course.id}&type=new`);
  };

  return (
    <Card className="sticky top-8 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden">
      <div className="p-1 bg-gradient-to-r from-gray-100 to-gray-200"></div>
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">
              {course.price === 0 ? '免费' : `${course.price} ${course.currency || 'HKD'}`}
            </span>
            {course.original_price && course.original_price > course.price && (
              <span className="text-gray-500 line-through text-lg">
                {course.original_price} {course.currency || 'HKD'}
              </span>
            )}
          </div>
          {course.original_price && course.original_price > course.price && (
            <div className="text-green-600 font-semibold text-sm mt-1">
              节省 {course.original_price - course.price} {course.currency || 'HKD'}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span>课程章节</span>
            <span className="font-medium">{course.sections?.length || 0} 章</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>课时数量</span>
            <span className="font-medium">{course.lecture_count || 0} 节</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>学员数量</span>
            <span className="font-medium">{course.enrollment_count || 0} 人</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleEnroll} 
          className="w-full py-6" 
          disabled={course.status !== 'published'}
        >
          {course.price === 0 ? '免费报名' : '立即购买'}
        </Button>
      </CardFooter>
    </Card>
  );
};
