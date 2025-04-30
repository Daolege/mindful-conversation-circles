
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CourseWithDetails } from '@/lib/types/course-new';
import { Clock, Calendar, Globe, CheckCheck, Download } from 'lucide-react';

interface CourseEnrollCardNewProps {
  course: CourseWithDetails;
}

export const CourseEnrollCardNew: React.FC<CourseEnrollCardNewProps> = ({ course }) => {
  // Format price with currency symbol
  const formattedPrice = `¥${course.price.toFixed(2)}`;
  const formattedOriginalPrice = course.original_price
    ? `¥${course.original_price.toFixed(2)}`
    : null;

  // Calculate discount percentage if original price exists
  const discountPercentage = course.original_price
    ? Math.round(((course.original_price - course.price) / course.original_price) * 100)
    : null;

  return (
    <div className="sticky top-4">
      <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
        <div className="p-6 space-y-6">
          {/* Price section */}
          <div className="flex items-baseline">
            <div className="text-2xl font-bold">{formattedPrice}</div>
            {formattedOriginalPrice && (
              <div className="ml-2 text-gray-500 line-through text-sm">
                {formattedOriginalPrice}
              </div>
            )}
            {discountPercentage && (
              <div className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 text-xs rounded-full">
                省{discountPercentage}%
              </div>
            )}
          </div>

          {/* Enrollment button */}
          <Button className="w-full py-6 text-base" variant="knowledge">
            立即报名学习
          </Button>

          {/* Course features */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center">
              <CheckCheck className="h-4 w-4 text-gray-500 mr-2" />
              <span>高清视频课程</span>
            </div>
            <div className="flex items-center">
              <CheckCheck className="h-4 w-4 text-gray-500 mr-2" />
              <span>随时随地学习</span>
            </div>
            <div className="flex items-center">
              <CheckCheck className="h-4 w-4 text-gray-500 mr-2" />
              <span>0门前置课程</span>
            </div>
            <div className="flex items-center">
              <Globe className="h-4 w-4 text-gray-500 mr-2" />
              <span>课程语言：{course.language || '中文'}</span>
            </div>
            <div className="flex items-center">
              <Download className="h-4 w-4 text-gray-500 mr-2" />
              <span>可下载课件</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span>永久观看权限</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
