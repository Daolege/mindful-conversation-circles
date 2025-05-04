
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download } from "lucide-react";
import { toast } from 'sonner';
import { useTranslations } from "@/hooks/useTranslations";
import { getEnrollmentGuides } from '@/lib/services/enrollmentGuidesService';
import IconDisplay from "@/components/course-detail/IconDisplay";

// Define the guide type
interface EnrollmentGuide {
  id: string;
  course_id: number;
  title: string;
  content?: string;
  guide_type: string;
  image_url?: string;
  link?: string;
  position: number;
}

const PaymentSuccess = () => {
  const location = useLocation();
  const { state } = location;
  const { t } = useTranslations();
  const [guides, setGuides] = useState<EnrollmentGuide[]>([]);
  const [loading, setLoading] = useState(false);
  
  const orderDetails = state?.orderDetails || {
    orderId: 'ORD-1703157',
    orderType: t('checkout:subscriptionPlan'),
    userEmail: 'guest@example.com',
    paymentDate: '2025-04-18',
    amount: '¥399.00',
    paymentMethod: t('checkout:alipay'),
    paymentStatus: t('checkout:paymentCompleted'),
    courseId: '80',
    isNewCourse: true
  };

  const courseId = orderDetails.courseId || '80';  // Default to course 80 if none provided
  const isNewCourse = orderDetails.isNewCourse !== false;  // Default to true unless explicitly set to false
  
  // Determine the correct learning route
  const learningUrl = `/learn/${courseId}${isNewCourse ? '?source=new' : ''}`;

  // Load enrollment guides when component mounts
  useEffect(() => {
    if (courseId) {
      loadEnrollmentGuides(Number(courseId));
    }
  }, [courseId]);

  // Log the course ID and learning URL for debugging
  useEffect(() => {
    console.log('[PaymentSuccess] Course ID:', courseId);
    console.log('[PaymentSuccess] Is new course:', isNewCourse);
    console.log('[PaymentSuccess] Learning URL:', learningUrl);
    
    // Check if courseId is valid
    if (!courseId) {
      toast.error(t('errors:invalidCourseId'), {
        description: t('errors:usingDefaultCourse')
      });
    }
  }, [courseId, isNewCourse, learningUrl, t]);

  // Load enrollment guides from database
  const loadEnrollmentGuides = async (id: number) => {
    setLoading(true);
    try {
      const { data, error } = await getEnrollmentGuides(id);
      if (error) {
        console.error('[PaymentSuccess] Error loading guides:', error);
      } else if (data) {
        console.log('[PaymentSuccess] Loaded guides:', data);
        setGuides(data);
      }
    } catch (err) {
      console.error('[PaymentSuccess] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to render guides by type
  const renderGuidesByType = (type: string) => {
    const filteredGuides = guides.filter(guide => guide.guide_type === type);
    if (filteredGuides.length === 0) return null;
    
    return (
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-medium">
          {type === 'wechat' && '微信群'}
          {type === 'whatsapp' && 'WhatsApp群'}
          {type === 'qq' && 'QQ群'}
          {type === 'telegram' && 'Telegram群'}
          {type === 'discord' && 'Discord服务器'}
          {type === 'custom' && '其他社群'}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredGuides.map(guide => (
            <div key={guide.id} className="border rounded-md p-4 bg-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-slate-100 rounded-md">
                  <IconDisplay 
                    iconName={
                      type === 'wechat' ? 'wechat' :
                      type === 'whatsapp' ? 'whatsapp' :
                      type === 'qq' ? 'qq' :
                      type === 'telegram' ? 'telegram' :
                      type === 'discord' ? 'discord' :
                      'message-circle'
                    } 
                    size={16} 
                  />
                </div>
                <h4 className="font-medium">{guide.title}</h4>
              </div>
              
              {guide.content && (
                <p className="text-sm text-slate-600 mb-3">{guide.content}</p>
              )}
              
              {guide.image_url && (
                <div className="mb-3">
                  <img
                    src={guide.image_url}
                    alt={`${guide.title} 二维码`}
                    className="h-32 object-contain mx-auto"
                  />
                </div>
              )}
              
              {guide.link && (
                <Button
                  variant="secondary"
                  className="w-full text-sm"
                  size="sm"
                  asChild
                >
                  <a href={guide.link} target="_blank" rel="noopener noreferrer">
                    点击加入
                  </a>
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t('checkout:paymentSuccess')}</h1>
              <p className="text-gray-500">{t('checkout:paymentCompleted')}</p>
              <Button className="mt-6 w-full sm:w-auto bg-[#0f172a] hover:bg-[#1e293b] text-white h-12 text-base font-medium" asChild>
                <Link to={learningUrl}>{t('courses:startLearning')} ›</Link>
              </Button>
              <p className="mt-2 text-sm text-gray-500">{t('courses:enrolledCoursesInDashboard')}</p>
            </div>

            {/* Enrollment guides section */}
            {guides.length > 0 && (
              <div className="mb-8">
                <div className="bg-blue-50 border border-blue-100 rounded-md p-5">
                  <h2 className="text-xl font-semibold mb-4">课程社群信息</h2>
                  <p className="text-sm text-slate-600 mb-5">
                    加入以下社群，获得更好的学习体验和互动交流机会
                  </p>
                  
                  {renderGuidesByType('wechat')}
                  {renderGuidesByType('whatsapp')}
                  {renderGuidesByType('qq')}
                  {renderGuidesByType('telegram')}
                  {renderGuidesByType('discord')}
                  {renderGuidesByType('custom')}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{t('checkout:paymentCompleted')}</h2>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t('checkout:downloadReceipt')}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t('checkout:orderNumber')}</span>
                    <span>{orderDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t('checkout:orderType')}</span>
                    <span>{orderDetails.orderType}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t('checkout:userEmail')}</span>
                    <span>{orderDetails.userEmail}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t('checkout:paymentDate')}</span>
                    <span>{orderDetails.paymentDate}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t('checkout:paymentAmount')}</span>
                    <span>{orderDetails.amount}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t('checkout:paymentMethod')}</span>
                    <span>{orderDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t('checkout:paymentStatus')}</span>
                    <span className="text-green-500">{orderDetails.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t('checkout:courseId')}</span>
                    <span>{courseId}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-center space-y-4">
                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <Link to="/courses">{t('checkout:viewMoreCourses')}</Link>
                </Button>
                <div className="text-sm text-gray-500">
                  <p>{t('checkout:contactCustomerService')}</p>
                  <p>{t('checkout:contactEmail')}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
