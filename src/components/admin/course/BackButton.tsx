
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="default"
      className="group hover:bg-transparent transition-all duration-200 text-base"
      onClick={() => navigate("/admin?tab=courses-new")}
    >
      <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
      返回课程管理
    </Button>
  );
};
