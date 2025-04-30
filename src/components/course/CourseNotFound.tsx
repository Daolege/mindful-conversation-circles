
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const CourseNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">未找到课程</h2>
        <Button onClick={() => navigate('/my-courses')}>返回我的课程</Button>
      </div>
    </div>
  );
};
