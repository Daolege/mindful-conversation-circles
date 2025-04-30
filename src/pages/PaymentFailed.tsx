
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const PaymentFailed = () => {
  const location = useLocation();
  const { state } = location;
  const errorDetails = state?.errorDetails || {
    errorCode: 'PAYMENT_FAILED',
    paymentMethod: 'PayPal',
    errorMessage: '支付处理未能完成，请重试',
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
              <h1 className="text-2xl font-bold mb-2">支付失败</h1>
              <p className="text-gray-500 mb-6">{errorDetails.errorMessage}</p>
              <Button className="mt-6 w-full bg-[#0f172a] hover:bg-[#1e293b] text-white h-12 text-base font-medium" asChild>
                <Link to={`/checkout${errorDetails.courseId ? `?courseId=${errorDetails.courseId}` : ''}`}>
                  返回支付页面 ›
                </Link>
              </Button>
              <p className="mt-2 text-sm text-gray-500">您可以重新选择支付方式进行付款</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">支付方式</span>
                  <span>{errorDetails.paymentMethod === 'paypal' ? 'PayPal' : 
                         errorDetails.paymentMethod === 'wechat' ? '微信支付' :
                         errorDetails.paymentMethod === 'stripe' ? 'Stripe' : '信用卡支付'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">错误代码</span>
                  <span className="text-red-500">{errorDetails.errorCode}</span>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="text-sm text-gray-500">
                  <p>如有任何问题，请联系客服解决</p>
                  <p>电子邮件：support@example.com | 电话：400-123-4567</p>
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
