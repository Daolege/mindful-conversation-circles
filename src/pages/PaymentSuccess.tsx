
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Download } from "lucide-react";

const PaymentSuccess = () => {
  const location = useLocation();
  const { state } = location;
  const orderDetails = state?.orderDetails || {
    orderId: 'ORD-1703157',
    orderType: '年度订阅计划',
    userEmail: 'guest@example.com',
    paymentDate: '2025-04-18',
    amount: '¥399.00',
    paymentMethod: '支付宝',
    paymentStatus: '已完成',
    courseId: '1'
  };

  const courseId = state?.orderDetails?.courseId || '1';

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
              <h1 className="text-2xl font-bold mb-2">支付成功</h1>
              <p className="text-gray-500">您的订单已成功支付，感谢您的购买！</p>
              <Button className="mt-6 w-full bg-[#0f172a] hover:bg-[#1e293b] text-white h-12 text-base font-medium" asChild>
                <Link to={`/courses/${courseId}/learn`}>前往学习 ›</Link>
              </Button>
              <p className="mt-2 text-sm text-gray-500">已报名的课程在个人中心查看</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">付款完成</h2>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  下载收据
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">订单编号</span>
                  <span>{orderDetails.orderId}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">订单类型</span>
                  <span>{orderDetails.orderType}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">用户邮箱</span>
                  <span>{orderDetails.userEmail}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">支付日期</span>
                  <span>{orderDetails.paymentDate}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">支付金额</span>
                  <span>{orderDetails.amount}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">支付方式</span>
                  <span>{orderDetails.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">支付状态</span>
                  <span className="text-green-500">{orderDetails.paymentStatus}</span>
                </div>
              </div>

              <Separator />

              <div className="text-center space-y-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/courses">查看更多好课</Link>
                </Button>
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

export default PaymentSuccess;
