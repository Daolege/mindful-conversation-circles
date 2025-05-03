
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download, ExternalLink } from "lucide-react";
import { toast } from 'sonner';
import { useTranslations } from "@/hooks/useTranslations";
import { getEnrollmentGuides } from '@/lib/services/courseEnrollmentGuideService';
import { CourseEnrollmentGuide } from '@/components/admin/course/settings/EditableCourseEnrollmentGuideComponent';

const PaymentSuccess = () => {
  const location = useLocation();
  const { state } = location;
  const { t } = useTranslations();
  const [enrollmentGuides, setEnrollmentGuides] = useState<CourseEnrollmentGuide[]>([]);
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

  const courseId = orderDetails.courseId ? parseInt(orderDetails.courseId, 10) : 80;
  const isNewCourse = orderDetails.isNewCourse !== false;
  
  // Determine the correct learning route
  const learningUrl = `/learn/${courseId}${isNewCourse ? '?source=new' : ''}`;

  // Load enrollment guides for this course
  useEffect(() => {
    const loadEnrollmentGuides = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        const { data, error } = await getEnrollmentGuides(courseId);
        
        if (error) throw error;
        
        if (data) {
          setEnrollmentGuides(data);
        }
      } catch (error) {
        console.error("Error loading enrollment guides:", error);
        // Don't show error toast here as this is not critical for users
      } finally {
        setLoading(false);
      }
    };
    
    loadEnrollmentGuides();
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

  // Helper to render enrollment guide items by type
  const renderEnrollmentGuides = () => {
    if (enrollmentGuides.length === 0) {
      return null;
    }
    
    return (
      <Card className="mt-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">课程交流群</h2>
          <p className="text-gray-600 mb-6">恭喜您成功报名课程！请加入以下交流群，获取学习资料和与其他学员交流。</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollmentGuides.map(guide => (
              <div key={guide.id} className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">{guide.title}</h3>
                {guide.content && <p className="text-sm text-gray-600 mb-3">{guide.content}</p>}
                
                {guide.guide_type === 'wechat' && guide.image_url && (
                  <div className="flex justify-center">
                    <img 
                      src={guide.image_url} 
                      alt={`${guide.title} QR Code`} 
                      className="max-w-[150px] max-h-[150px] object-contain"
                    />
                  </div>
                )}
                
                {guide.guide_type === 'whatsapp' && guide.link && (
                  <div className="mt-2">
                    <Button asChild variant="outline" className="w-full">
                      <a href={guide.link} target="_blank" rel="noopener noreferrer">
                        打开 WhatsApp <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </Button>
                  </div>
                )}
                
                {guide.guide_type !== 'wechat' && guide.guide_type !== 'whatsapp' && guide.link && (
                  <div className="mt-2">
                    <Button asChild variant="outline" className="w-full">
                      <a href={guide.link} target="_blank" rel="noopener noreferrer">
                        打开链接 <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t('checkout:paymentSuccess')}</h1>
              <p className="text-gray-500">{t('checkout:paymentCompleted')}</p>
              <Button className="mt-6 w-full bg-[#0f172a] hover:bg-[#1e293b] text-white h-12 text-base font-medium" asChild>
                <Link to={learningUrl}>{t('courses:startLearning')} ›</Link>
              </Button>
              <p className="mt-2 text-sm text-gray-500">{t('courses:enrolledCoursesInDashboard')}</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{t('checkout:paymentCompleted')}</h2>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t('checkout:downloadReceipt')}
                </Button>
              </div>

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
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">{t('checkout:courseType')}</span>
                  <span>{isNewCourse ? t('checkout:newCourseSystem') : t('checkout:standardCourse')}</span>
                </div>
              </div>

              <Separator />

              <div className="text-center space-y-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/courses">{t('checkout:viewMoreCourses')}</Link>
                </Button>
                <div className="text-sm text-gray-500">
                  <p>{t('checkout:contactCustomerService')}</p>
                  <p>{t('checkout:contactEmail')}</p>
                </div>
              </div>
            </div>
          </Card>
          
          {renderEnrollmentGuides()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
