
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ExternalLink, Link as LinkIcon, Image } from 'lucide-react';
import { getEnrollmentGuides } from '@/lib/services/courseEnrollmentGuidesService';
import { Separator } from "@/components/ui/separator";

// Define the props for the component
interface EnrollmentGuidesDisplayProps {
  courseId: string | number;
}

// Define sample data structure to use when needed
const sampleGuides = [
  {
    id: "1",
    course_id: 80,
    title: "微信群",
    content: "1. 购买课程成功加群\n2. 所有好友均可加入与教师讨论",
    guide_type: "wechat",
    image_url: "/lovable-uploads/c2529a3e-ae24-4a84-8d08-21731ee81c2e.png",
    position: 1,
  },
  {
    id: "2",
    course_id: 80,
    title: "Telegram群",
    content: "加入我们的Telegram群组获取最新课程更新和讨论",
    link: "https://t.me/examplegroup",
    guide_type: "telegram",
    image_url: "/lovable-uploads/8793137a-dcfb-409f-a3de-f330a902b9d2.png",
    position: 2,
  },
  {
    id: "3",
    course_id: 80,
    title: "课程资料下载",
    content: "点击链接下载课程补充资料",
    link: "https://example.com/resources",
    guide_type: "other",
    position: 3,
  }
];

const EnrollmentGuidesDisplay = ({ courseId }: EnrollmentGuidesDisplayProps) => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuides = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }
      
      try {
        // For real implementation, we would use:
        // const { data, error } = await getEnrollmentGuides(Number(courseId));
        
        // For now, we'll use sample data
        setTimeout(() => {
          setGuides(sampleGuides);
          setLoading(false);
        }, 300);
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error('Error fetching enrollment guides:', err);
      }
    };

    fetchGuides();
  }, [courseId]);

  // Helper function to get the appropriate icon for each guide type
  const getGuideIcon = (guideType) => {
    switch (guideType) {
      case 'wechat':
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case 'telegram':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'whatsapp':
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'qq':
        return <MessageSquare className="h-5 w-5 text-blue-400" />;
      default:
        return <LinkIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // If there are no guides or we're still loading, don't render anything
  if (loading) {
    return <div className="text-center py-4">加载学习指南中...</div>;
  }

  if (!guides || guides.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">课程学习指南</h2>
      <div className="space-y-4">
        {guides.map((guide) => (
          <Card key={guide.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getGuideIcon(guide.guide_type)}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-base mb-2">{guide.title}</h3>
                  <p className="text-gray-600 whitespace-pre-line mb-3">{guide.content}</p>
                  
                  {guide.image_url && (
                    <div className="mt-3">
                      <div className="border rounded-md inline-block p-2 bg-gray-50">
                        <img 
                          src={guide.image_url} 
                          alt={`${guide.title} QR Code`} 
                          className="max-w-[150px] max-h-[150px] object-contain"
                        />
                      </div>
                    </div>
                  )}
                  
                  {guide.link && (
                    <div className="mt-3">
                      <a 
                        href={guide.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        打开链接
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EnrollmentGuidesDisplay;
