import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/authHooks";

interface CourseHeaderProps {
  courseId: string;
  title: string;
  instructorName: string;
  instructorId: string;
}

export const CourseHeader = ({
  courseId,
  title,
  instructorName,
  instructorId,
}: CourseHeaderProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuth();

  const toggleFavorite = () => {
    if (!user) {
      toast.error("请先登录");
      return;
    }
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "已取消收藏" : "已添加到收藏");
  };

  const shareCourse = () => {
    const courseUrl = window.location.href;
    navigator.clipboard.writeText(courseUrl);
    toast.success("课程链接已复制到剪贴板");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <Link to="/courses" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回课程列表
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 mb-4">
        导师: <Link to={`/instructors/${instructorId}`} className="text-knowledge-primary hover:underline">{instructorName}</Link>
      </p>
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={toggleFavorite}>
            {isFavorite ? "取消收藏" : "收藏"}
            <Heart className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={shareCourse}>
            分享
            <Share2 className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
