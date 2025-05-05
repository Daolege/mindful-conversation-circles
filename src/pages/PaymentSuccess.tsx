
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download } from "lucide-react";
import { toast } from 'sonner';
import { useTranslations } from "@/hooks/useTranslations";
import EnrollmentGuidesDisplay from '@/components/checkout/EnrollmentGuidesDisplay';

const PaymentSuccess = () => {
  const location = useLocation();
  const { state } = location;
  const { t } = useTranslations();
  
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
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-20 w-20 text-green-500 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold mb-3">{t('checkout:paymentSuccess')}</h1>
            <p className="text-gray-500 text-lg">{t('checkout:paymentCompleted')}</p>
          </div>

          {/* Two-column Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Primary Content */}
            <div className="w-full lg:w-2/3">
              <Card className="p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">{t('checkout:startYourLearning')}</h2>
                  <Button 
                    className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white h-14 text-lg font-medium 
                    animate-pulse transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                    asChild
                  >
                    <Link to={learningUrl}>
                      {t('courses:startLearning')} ›
                    </Link>
                  </Button>
                  <p className="mt-3 text-sm text-gray-500 text-center">{t('courses:enrolledCoursesInDashboard')}</p>
                </div>
                <Separator className="my-6" />
                
                {/* Enrollment Guides Display */}
                <EnrollmentGuidesDisplay courseId={courseId} />
              </Card>
                
              {/* Navigation buttons removed as requested */}
            </div>
            
            {/* Right Column - Order Details */}
            <div className="w-full lg:w-1/3">
              <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-semibold">{t('checkout:orderDetails')}</h2>
                  <Button variant="outline" size="sm" className="hover:bg-gray-100 transition-all duration-300">
                    <Download className="h-4 w-4 mr-2" />
                    {t('checkout:downloadReceipt')}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{t('checkout:orderNumber')}</span>
                    <span className="font-medium">{orderDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{t('checkout:orderType')}</span>
                    <span>{orderDetails.orderType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{t('checkout:userEmail')}</span>
                    <span>{orderDetails.userEmail}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{t('checkout:paymentDate')}</span>
                    <span>{orderDetails.paymentDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{t('checkout:paymentAmount')}</span>
                    <span className="font-bold text-green-600">{orderDetails.amount}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{t('checkout:paymentMethod')}</span>
                    <span>{orderDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{t('checkout:paymentStatus')}</span>
                    <span className="text-green-500 font-medium">{orderDetails.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">{t('checkout:courseId')}</span>
                    <span>{courseId}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">{t('checkout:courseType')}</span>
                    <span>{isNewCourse ? t('checkout:newCourseSystem') : t('checkout:standardCourse')}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="text-sm text-gray-500 text-center space-y-2 bg-gray-50 p-3 rounded-lg">
                  <p>{t('checkout:contactCustomerService')}</p>
                  <p>{t('checkout:contactEmail')}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
