
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

interface InstructorCardProps {
  id: number;
  name: string;
  title: string;
  imageUrl: string;
  courseCount: number;
  studentCount: number;
  featured?: boolean;
}

const InstructorCard = ({
  id,
  name,
  title,
  imageUrl,
  courseCount,
  studentCount,
  featured = false,
}: InstructorCardProps) => {
  return (
    <Link to={`/instructors/${id}`}>
      <Card className={`course-card overflow-hidden h-full flex flex-col ${featured ? 'border-gray-800 border-2' : ''}`}>
        <div className="relative">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-48 object-cover"
          />
          {featured && (
            <Badge className="absolute top-2 right-2 bg-gray-800 text-white hover:bg-gray-700">
              精选导师
            </Badge>
          )}
        </div>
        <CardContent className="pt-4 text-center">
          <h3 className="font-bold text-lg mb-1">{name}</h3>
          <p className="text-gray-500 text-sm mb-3">{title}</p>
          <div className="flex items-center justify-center space-x-3 mt-2">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 text-gray-700 mr-1" />
              <span className="text-sm">{courseCount} 课程</span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center">
              <span className="text-sm text-gray-500">{studentCount} 学员</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default InstructorCard;
