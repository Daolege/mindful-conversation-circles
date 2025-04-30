import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Languages, Users, Clock } from "lucide-react";

type CourseCardProps = {
  id: number;
  title: string;
  price: number;
  category?: string;
  studentCount?: number;
  featured?: boolean;
  language?: string;
  [key: string]: any;
};

const CourseCard = ({
  id,
  title,
  category,
  price,
  studentCount = 0,
  featured = false,
  language = "中文",
}: CourseCardProps) => {
  const positionVariant = id % 4;
  const colorVariant = id % 6;
  
  const getLargeCirclePosition = () => {
    switch (positionVariant) {
      case 0: return 'right-[-25%] top-[-25%]';
      case 1: return 'right-[-20%] top-[-30%]';
      case 2: return 'right-[-30%] top-[-20%]';
      default: return 'right-[-25%] top-[-25%]';
    }
  };
  
  const getMediumCirclePosition = () => {
    switch (positionVariant) {
      case 0: return 'left-[-15%] bottom-[-15%]';
      case 1: return 'left-[-20%] bottom-[-10%]';
      case 2: return 'left-[-10%] bottom-[-20%]';
      default: return 'left-[-15%] bottom-[-15%]';
    }
  };
  
  const getSmallCirclePosition = () => {
    switch (positionVariant) {
      case 0: return 'left-[10%] top-[10%]';
      case 1: return 'left-[15%] top-[5%]';
      case 2: return 'left-[5%] top-[15%]';
      default: return 'left-[10%] top-[10%]';
    }
  };
  
  const getGradientColors = () => {
    switch (colorVariant) {
      case 0:
        return {
          large: 'group-hover:from-purple-600/90 group-hover:to-blue-600/90',
          medium: 'group-hover:from-pink-600/90 group-hover:to-purple-600/90',
          small: 'group-hover:from-blue-600/90 group-hover:to-cyan-600/90'
        };
      case 1:
        return {
          large: 'group-hover:from-blue-600/90 group-hover:to-cyan-600/90',
          medium: 'group-hover:from-teal-600/90 group-hover:to-emerald-600/90',
          small: 'group-hover:from-violet-600/90 group-hover:to-purple-600/90'
        };
      case 2:
        return {
          large: 'group-hover:from-rose-600/90 group-hover:to-pink-600/90',
          medium: 'group-hover:from-amber-600/90 group-hover:to-orange-600/90',
          small: 'group-hover:from-emerald-600/90 group-hover:to-teal-600/90'
        };
      case 3:
        return {
          large: 'group-hover:from-amber-600/90 group-hover:to-orange-600/90',
          medium: 'group-hover:from-violet-600/90 group-hover:to-fuchsia-600/90',
          small: 'group-hover:from-cyan-600/90 group-hover:to-sky-600/90'
        };
      case 4:
        return {
          large: 'group-hover:from-emerald-600/90 group-hover:to-teal-600/90',
          medium: 'group-hover:from-blue-600/90 group-hover:to-indigo-600/90',
          small: 'group-hover:from-rose-600/90 group-hover:to-pink-600/90'
        };
      default:
        return {
          large: 'group-hover:from-violet-600/90 group-hover:to-purple-600/90',
          medium: 'group-hover:from-rose-600/90 group-hover:to-pink-600/90',
          small: 'group-hover:from-teal-600/90 group-hover:to-emerald-600/90'
        };
    }
  };

  const gradientColors = getGradientColors();
  
  // Use consistent URL format for course navigation - courses-new for all cards
  const courseUrl = `/courses-new/${id}`;

  return (
    <Link to={courseUrl} className="block transform transition-all duration-700 hover:translate-y-[-8px]">
      <Card className="relative h-[250px] overflow-hidden bg-gradient-to-br from-gray-200/90 to-gray-300/90 backdrop-blur-sm border-0 shadow-lg group cursor-pointer hover:shadow-2xl transition-all duration-1000">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className={`absolute ${getLargeCirclePosition()} w-[70%] h-[70%] rounded-full
                bg-gradient-to-br from-gray-300/30 to-gray-400/30
                ${gradientColors.large}
                transform transition-all duration-[1500ms] group-hover:scale-150 group-hover:rotate-[120deg]
                mix-blend-screen blur-sm`}
            />
            
            <div 
              className={`absolute ${getMediumCirclePosition()} w-[50%] h-[50%] rounded-full
                bg-gradient-to-tr from-gray-300/30 to-gray-400/30
                ${gradientColors.medium}
                transform transition-all duration-[2000ms] group-hover:scale-[1.8] group-hover:rotate-[-120deg]
                mix-blend-screen blur-sm`}
            />
            
            <div 
              className={`absolute ${getSmallCirclePosition()} w-[30%] h-[30%] rounded-full
                bg-gradient-to-bl from-gray-300/30 to-gray-400/30
                ${gradientColors.small}
                transform transition-all duration-[2500ms] group-hover:scale-[2] group-hover:rotate-[240deg]
                mix-blend-screen blur-sm`}
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-gray-200/40 via-gray-300/40 to-gray-400/60 backdrop-blur-[1px]" />
        </div>

        <div className="absolute top-3 left-3 z-20 flex items-center space-x-2">
          <Badge 
            variant="secondary" 
            className="bg-white/90 text-gray-800 backdrop-blur-sm shadow-sm border border-white/20
              transform transition-all duration-300 group-hover:scale-105 flex items-center gap-1">
            <Languages className="h-4 w-4" />
            {language}
          </Badge>
          
          <Badge 
            variant="secondary" 
            className="bg-white/90 text-gray-800 backdrop-blur-sm shadow-sm border border-white/20
              transform transition-all duration-300 group-hover:scale-105 flex items-center gap-1">
            <Users className="h-4 w-4" />
            {studentCount} 学员
          </Badge>
          
          <Badge 
            variant="secondary" 
            className="bg-white/90 text-gray-800 backdrop-blur-sm shadow-sm border border-white/20
              transform transition-all duration-300 group-hover:scale-105 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            随时学习
          </Badge>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-5 bg-black/10 backdrop-blur-[2px]">
          <div className="space-y-2">
            {featured && (
              <Badge 
                className="bg-white/90 text-gray-800 backdrop-blur-sm
                  transform transition-all duration-300 group-hover:scale-105">
                热门课程
              </Badge>
            )}

            <h3 className="text-xl font-bold text-black drop-shadow-md
              transform transition-all duration-300 group-hover:scale-[1.02]">
              {title}
            </h3>

            <div className="flex justify-between items-center">
              <div className="font-bold text-lg text-black">
                ¥{price}
              </div>
              <Button 
                variant="secondary" 
                className="bg-gray-900 text-white hover:bg-black hover:text-white
                  transition-all duration-300 group-hover:scale-105">
                立即查看
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CourseCard;
