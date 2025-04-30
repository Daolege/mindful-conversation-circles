
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface CheckoutHeaderProps {
  courseId: string | null;
}

export const CheckoutHeader = ({ courseId }: CheckoutHeaderProps) => {
  return (
    <>
      <Link 
        to={`/courses/${courseId}`} 
        className="inline-flex items-center text-sm mb-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回课程
      </Link>
      <h1 className="text-2xl font-bold mb-8">结账</h1>
    </>
  );
};
