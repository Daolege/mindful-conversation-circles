
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CourseLearnHeaderProps {
  title: string;
  onBack: () => void;
}

export const CourseLearnHeader = ({ title, onBack }: CourseLearnHeaderProps) => {
  return (
    <div className="mb-6">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回我的课程
      </Button>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
};
