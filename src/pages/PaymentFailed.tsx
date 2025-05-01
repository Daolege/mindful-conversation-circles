
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";

const PaymentFailed = () => {
  const location = useLocation();
  const { state } = location;
  const { t } = useTranslations();
  
  const errorDetails = state?.errorDetails || {
    errorCode: 'PAYMENT_FAILED',
    paymentMethod: 'PayPal',
    errorMessage: t('checkout:paymentProcessingFailed'),
    courseId: null,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-16 w-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t('checkout:paymentFailed')}</h1>
              <p className="text-gray-500 mb-6">{errorDetails.errorMessage}</p>
              <Button className="mt-6 w-full bg-[#0f172a] hover:bg-[#1e293b] text-white h-12 text-base font-medium" asChild>
                <Link to={`/checkout${errorDetails.courseId ? `?courseId=${errorDetails.courseId}` : ''}`}>
                  {t('checkout:returnToPaymentPage')} ›
                </Link>
              </Button>
              <p className="mt-2 text-sm text-gray-500">{t('checkout:selectAnotherPaymentMethod')}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">{t('checkout:paymentMethod')}</span>
                  <span>{errorDetails.paymentMethod === 'paypal' ? 'PayPal' : 
                         errorDetails.paymentMethod === 'wechat' ? t('checkout:wechatPay') :
                         errorDetails.paymentMethod === 'stripe' ? 'Stripe' : t('checkout:creditCard')}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">{t('errors:errorCode')}</span>
                  <span className="text-red-500">{errorDetails.errorCode}</span>
                </div>
              </div>

              <div className="text-center space-y-4">
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

export default PaymentFailed;
