
import { Order } from "@/lib/types/order";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface OrderCourseListProps {
  order: Order;
}

export const OrderCourseList = ({ order }: OrderCourseListProps) => {
  // 确保总是得到一个数组，即使 courses 是单个对象或可能为 null
  const orderCourses = Array.isArray(order.courses) 
    ? order.courses 
    : order.courses 
      ? [order.courses] 
      : [];

  return (
    <div className="space-y-6">
      <Separator className="my-4" />
      <div className="space-y-6">
        {orderCourses && orderCourses.length > 0 ? (
          orderCourses.map((course, index) => (
            <div key={String(course?.id || index)} className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 border rounded-lg bg-gray-50/50 hover:bg-gray-50/80 transition-colors">
              <div className="w-full sm:w-24 h-24 overflow-hidden rounded-md shadow-sm">
                <img
                  src={course?.imageUrl || '/placeholder.svg'}
                  alt={course?.title || '未知课程'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-medium">{course?.title || '未知课程'}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{course?.description || '暂无课程描述'}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <span className="font-semibold">{formatCurrency(course?.price || 0, order.currency || 'USD')}</span>
                  {course?.id && (
                    <Link to={`/courses/${course.id}`} className="text-knowledge-primary hover:underline flex items-center gap-1">
                      <span>查看课程</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">没有购买任何课程</p>
          </div>
        )}
      </div>
    </div>
  );
};
