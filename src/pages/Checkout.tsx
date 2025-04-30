
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCourseById } from '@/lib/services/courseService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/authHooks';
import Navbar from '@/components/Navbar';
import { toast } from 'sonner';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { useCallback } from 'react';

const Checkout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const courseId = searchParams.get('courseId');
  
  const [paymentMethod, setPaymentMethod] = useState('alipay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['checkout-course', courseId],
    queryFn: () => getCourseById(courseId ? parseInt(courseId) : 0),
    enabled: !!courseId,
  });
  
  const course = data?.data;
  const defaultCurrency = 'cny'; // 设置默认货币为人民币
  
  // 获取促销代码
  const handleApplyPromoCode = () => {
    if (promoCode === 'WELCOME10') {
      setDiscount(10);
      toast.success('促销代码已应用，享受10%折扣！');
    } else if (promoCode === 'LOYAL20') {
      setDiscount(20);
      toast.success('促销代码已应用，享受20%折扣！');
    } else {
      toast.error('无效的促销代码');
      setDiscount(0);
    }
  };
  
  // 计算价格
  const calculatePrice = () => {
    if (!course) return { subtotal: 0, discount: 0, total: 0 };
    
    const subtotal = course.price || 0;
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount;
    
    return { subtotal, discountAmount, total };
  };
  
  const { subtotal, discountAmount, total } = calculatePrice();
  
  // 处理订单提交
  const handleCheckout = useCallback(async () => {
    if (!user || !course) {
      toast.error('请先登录');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // 生成唯一订单号
      const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // 创建订单记录
      const { error: orderError } = await supabase.from('orders').insert({
        id: uuidv4(),
        user_id: user.id,
        course_id: course.id,
        amount: total,
        currency: course.currency || defaultCurrency,
        payment_type: paymentMethod,
        status: 'completed', // 简化示例，实际应先为pending
        order_number: orderNumber,
      });
      
      if (orderError) {
        throw new Error(`创建订单失败: ${orderError.message}`);
      }
      
      // 为用户注册课程
      const { error: enrollError } = await supabase.rpc('enroll_user_in_course', {
        p_user_id: user.id,
        p_course_id: course.id,
        p_purchased_at: new Date().toISOString()
      });
      
      if (enrollError) {
        throw new Error(`注册课程失败: ${enrollError.message}`);
      }
      
      // 成功提示
      toast.success('支付成功！正在跳转...');
      setTimeout(() => navigate('/payment-success?orderNumber=' + orderNumber), 1500);
      
    } catch (err: any) {
      toast.error(`支付处理出错: ${err.message}`);
      console.error('Checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [user, course, total, paymentMethod, navigate, defaultCurrency]);
  
  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!loading && !user) {
      toast.error('请先登录再进行购买');
      navigate('/auth?redirect=/checkout' + (courseId ? `?courseId=${courseId}` : ''));
    }
  }, [loading, user, navigate, courseId]);
  
  if (isLoading || loading) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-10">
          <div className="flex items-center justify-center min-h-[50vh]">
            <p>加载中...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !course) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto py-10">
          <div className="flex items-center justify-center min-h-[50vh]">
            <p>加载课程信息失败，请稍后重试。</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">结账</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">支付方式</h2>
                <RadioGroup 
                  defaultValue="alipay" 
                  onValueChange={setPaymentMethod}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="alipay" id="alipay" />
                    <Label htmlFor="alipay" className="flex items-center">
                      <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="#1677FF">
                        <path d="M22.5 12.5c0-1.58-.88-2.95-2.15-3.68-.42-1.78-2.03-3.12-3.97-3.12-1.93 0-3.55 1.34-3.97 3.12-1.27.73-2.15 2.1-2.15 3.68 0 1.14.46 2.18 1.21 2.94l-1.09 3.25h12l-1.09-3.25c.75-.76 1.21-1.8 1.21-2.94z" />
                      </svg>
                      支付宝
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wechat" id="wechat" />
                    <Label htmlFor="wechat" className="flex items-center">
                      <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="#07C160">
                        <path d="M9.5 9c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
                        <path d="M21.75 12c0-4.42-4.62-8-10.25-8s-10.25 3.58-10.25 8c0 2.03 1.06 3.89 2.81 5.32l-1.58 4.32c-.12.33.07.67.4.8.08.03.17.04.25.04.25 0 .5-.13.64-.35l2.08-4.17c1.72.67 3.63 1.04 5.65 1.04 5.63 0 10.25-3.58 10.25-8z" />
                      </svg>
                      微信支付
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="creditcard" id="creditcard" />
                    <Label htmlFor="creditcard" className="flex items-center">
                      <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="#FF6B6B">
                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                      </svg>
                      信用卡
                    </Label>
                  </div>
                </RadioGroup>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">促销代码</h2>
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="输入促销代码" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button onClick={handleApplyPromoCode}>应用</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">订单摘要</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">课程:</span>
                    <span className="font-medium">{course.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">小计:</span>
                    <span>{formatCurrency(subtotal, course.currency || defaultCurrency)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>折扣 ({discount}%):</span>
                      <span>-{formatCurrency(discountAmount, course.currency || defaultCurrency)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>总计:</span>
                    <span>{formatCurrency(total, course.currency || defaultCurrency)}</span>
                  </div>
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? '处理中...' : '确认支付'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    点击"确认支付"，即表示您同意我们的条款和条件。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
