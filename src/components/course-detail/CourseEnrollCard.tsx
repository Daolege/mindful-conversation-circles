
import { BookOpen, Video, Globe, Smartphone, Users, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Course } from "@/lib/types/course";

interface CourseEnrollCardProps {
  course: Course;
}

export function CourseEnrollCard({ course }: CourseEnrollCardProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEnroll = () => {
    navigate(`/checkout?courseId=${course.id}`);
  };

  const discount = course.originalprice 
    ? Math.round((1 - course.price / course.originalprice) * 100) 
    : 0;

  return (
    <Card className="sticky top-4">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-3xl font-bold text-gray-900">
            ¥{course.price}
          </div>
          {course.originalprice && discount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 line-through">
                ¥{course.originalprice}
              </span>
              <Badge 
                className="bg-gray-900 text-white 
                  transition-all duration-300 ease-in-out 
                  hover:scale-110 hover:shadow-sm 
                  transform origin-left
                  hover:bg-gray-900 hover:text-white"
              >
                {discount}% 限时优惠
              </Badge>
            </div>
          )}
        </div>

        <Button 
          className="w-full mb-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-lg py-6 transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleEnroll}
        >
          立即报名学习
        </Button>

        <div className="space-y-6">
          <Card className="border hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-3">课程亮点</h4>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center">
                  <Video className="h-4 w-4 mr-2 text-gray-600" />
                  <span>高清视频课程</span>
                </div>
                <div className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-2 text-gray-600" />
                  <span>随时随地学习</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-gray-600" />
                  <span>{course.lectures} 个精选章节</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-gray-600" />
                  <span>课程语言：中文</span>
                </div>
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 text-gray-600" />
                  <span>内容持续更新</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-600" />
                  <span>学员专属社群</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-600" />
                  <span>附赠学习资料</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
