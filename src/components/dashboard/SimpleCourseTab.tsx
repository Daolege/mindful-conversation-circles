
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function SimpleCourseTab() {
  const navigate = useNavigate();

  return (
    <div className="bg-muted/50 border rounded-lg p-8 text-center">
      <h3 className="text-lg font-medium mb-2">我的课程</h3>
      <p className="text-muted-foreground mb-6">
        您可以在单独的页面查看所有已购买的课程
      </p>
      
      <Button 
        onClick={() => navigate('/my-courses')} 
        className="min-w-[150px]"
      >
        进入我的课程
      </Button>
    </div>
  );
}
