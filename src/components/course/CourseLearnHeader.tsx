
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

interface CourseLearnHeaderProps {
  title: string;
  onBack: () => void;
}

export const CourseLearnHeader = ({ title, onBack }: CourseLearnHeaderProps) => {
  const { t } = useTranslations();
  
  return (
    <div className="mb-6">
      <Button 
        variant="ghost" 
        className="mb-4 hover:bg-gray-100 text-gray-700"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('courses:backToMyCourses')}
      </Button>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
    </div>
  );
};
