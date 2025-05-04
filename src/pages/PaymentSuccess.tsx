
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
import { EnrollmentGuide, getEnrollmentGuides } from '@/lib/services/enrollmentGuideService';
import { EnrollmentGuideDisplay } from '@/components/enrollment/EnrollmentGuideDisplay';

const PaymentSuccess = () => {
  const location = useLocation();
  const { state } = location;
  const { t } = useTranslations();
  const [guides, setGuides] = useState<EnrollmentGuide[]>([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  
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

  // Load enrollment guides
  useEffect(() => {
    const fetchGuides = async () => {
      if (!courseId) return;
      
      setLoadingGuides(true);
      try {
        const courseIdNum = parseInt(courseId);
        if (!isNaN(courseIdNum)) {
          const guidesData = await getEnrollmentGuides(courseIdNum);
          setGuides(guidesData);
        }
      } catch (error) {
        console.error('Error fetching enrollment guides:', error);
      } finally {
        setLoadingGuides(false);
      }
    };
    
    fetchGuides();
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
            </div>

            {/* Enrollment Guide Display */}
            {guides.length > 0 && (
              <EnrollmentGuideDisplay guides={guides} />
            )}

            <div className="text-center mb-8">
              <Button className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white h-12 text-base font-medium" asChild>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
