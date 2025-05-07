
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, ExternalLink, Link as LinkIcon, Image, Facebook, Instagram, Twitter } from 'lucide-react';
import { getEnrollmentGuides } from '@/lib/services/courseEnrollmentGuidesService';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

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
    is_visible_on_payment_success: true
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
    is_visible_on_payment_success: true
  },
  {
    id: "3",
    course_id: 80,
    title: "课程资料下载",
    content: "点击链接下载课程补充资料",
    link: "https://example.com/resources",
    guide_type: "other",
    position: 3,
    is_visible_on_payment_success: true
  }
];

// Sample group instructions text
const sampleGroupInstructions = '已报名的同学入群说明\n1. 国内的加微信群\n2. 国际朋友按照自己主要的设计平台选择加入\n3. 所展示的群都是报名本课程的专属群,因此无需重复加群';

const EnrollmentGuidesDisplay = ({ courseId }: EnrollmentGuidesDisplayProps) => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showGuides, setShowGuides] = useState(true);
  const [groupInstructions, setGroupInstructions] = useState(sampleGroupInstructions);

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
        // Filter guides that should be visible on payment success page
        setTimeout(() => {
          const visibleGuides = sampleGuides.filter(guide => guide.is_visible_on_payment_success);
          setGuides(visibleGuides);
          setShowGuides(true); // In a real implementation, this would come from the course settings
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
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-500" />;
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />;
      default:
        return <LinkIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // If there are no guides or we're still loading, don't render anything
  if (loading) {
    return <div className="text-center py-4">加载学习指南中...</div>;
  }

  if (!guides || guides.length === 0 || !showGuides) {
    return null;
  }

  // Function to convert newlines to <br> elements in the instructions
  const formatInstructions = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="mt-4 w-full animate-fade-in">
      <h2 className="text-xl font-bold mb-6 text-center">课程学习指南</h2>
      
      {/* Explanatory text section with custom instructions */}
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6">
        <p className="font-medium text-gray-800 mb-2">
          {formatInstructions(groupInstructions)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map((guide) => (
          <Card 
            key={guide.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-gray-200 hover:border-gray-300"
          >
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
                      <div 
                        className="border rounded-md inline-block p-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all transform hover:scale-105"
                        onClick={() => setSelectedImage({ src: guide.image_url, title: guide.title })}
                      >
                        <img 
                          src={guide.image_url} 
                          alt={`${guide.title} QR Code`} 
                          className="max-w-[150px] max-h-[150px] object-contain"
                        />
                        <p className="text-xs text-center text-gray-500 mt-1">点击二维码放大</p>
                      </div>
                    </div>
                  )}
                  
                  {guide.link && (
                    <div className="mt-3">
                      <Button 
                        variant="outline" 
                        className={`flex items-center gap-2 transition-all duration-300 hover:scale-105 ${
                          guide.guide_type === 'telegram' ? 'hover:bg-blue-500 hover:text-white' :
                          guide.guide_type === 'wechat' ? 'hover:bg-green-500 hover:text-white' :
                          guide.guide_type === 'whatsapp' ? 'hover:bg-green-600 hover:text-white' :
                          guide.guide_type === 'facebook' ? 'hover:bg-blue-600 hover:text-white' :
                          guide.guide_type === 'instagram' ? 'hover:bg-pink-500 hover:text-white' :
                          guide.guide_type === 'twitter' ? 'hover:bg-blue-400 hover:text-white' :
                          'hover:bg-[#0f172a] hover:text-white'
                        }`}
                        asChild
                      >
                        <a href={guide.link} target="_blank" rel="noopener noreferrer">
                          {getGuideIcon(guide.guide_type)}
                          <span>打开{guide.title}</span>
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* QR Code Enlargement Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-md backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle>{selectedImage?.title} 二维码</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex flex-col items-center justify-center p-4 animate-fade-in">
              <img 
                src={selectedImage.src} 
                alt={`${selectedImage.title} QR Code`} 
                className="max-w-full max-h-[400px] object-contain hover:scale-105 transition-all"
              />
              <p className="text-sm text-gray-500 mt-4">保存图片或截图后可在相应应用中扫描</p>
            </div>
          )}
          <div className="mt-4 flex justify-center">
            <DialogClose asChild>
              <Button variant="secondary" className="min-w-[100px]">关闭</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnrollmentGuidesDisplay;

