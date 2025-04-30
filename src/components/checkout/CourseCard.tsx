
import { Card } from "@/components/ui/card";

interface CourseCardProps {
  title: string;
  description: string;
}

export const CourseCard = ({ title, description }: CourseCardProps) => {
  return (
    <Card className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </Card>
  );
};
