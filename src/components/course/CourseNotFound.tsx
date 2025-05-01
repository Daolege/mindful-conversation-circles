
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";

export const CourseNotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">{t('courses:notFound')}</h2>
        <Button onClick={() => navigate('/my-courses')}>{t('courses:backToMyCourses')}</Button>
      </div>
    </div>
  );
};
