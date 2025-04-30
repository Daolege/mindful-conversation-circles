import React from 'react';
import { Order } from '@/lib/types/order';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import Logo from '@/components/Logo';
import { siteConfig } from '@/config/site';

interface OrderReceiptProps {
  order: Order;
}

export const OrderReceipt = ({ order }: OrderReceiptProps) => {
  const handlePrint = () => {
    window.print();
  };
  
  const getCourseTitle = () => {
    if (!order.courses) return '课程已删除';
    
    if (Array.isArray(order.courses)) {
      return order.courses.length > 0 ? order.courses[0].title : '课程已删除';
    }
    
    return order.courses.title || '课程已删除';
  };
  
  return (
    <div className="bg-white p-8 rounded-lg shadow print:shadow-none max-w-4xl mx-auto">
      <div className="print:hidden mb-6">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          打印凭证
        </Button>
      </div>

      <div className="flex justify-between items-start mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">支付凭证</h1>
          <p className="text-sm text-muted-foreground">Payment Receipt</p>
        </div>
        <div className="print:grayscale">
          <Logo showText={false} size="small" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div>
          <h3 className="font-semibold mb-3">商家信息</h3>
          <div className="space-y-1 text-muted-foreground">
            <p className="text-foreground">{siteConfig.name}</p>
            <p>{siteConfig.creator}</p>
            <p>contact@example.com</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3">客户信息</h3>
          <div className="space-y-1 text-muted-foreground">
            <p className="text-foreground">{order.profiles?.full_name || '未提供姓名'}</p>
            <p>{order.profiles?.email || '未提供邮箱'}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">描述</th>
              <th className="text-center py-3 px-4">数量</th>
              <th className="text-right py-3 px-4">单价</th>
              <th className="text-right py-3 px-4">金额</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-4 px-4">{getCourseTitle()}</td>
              <td className="text-center py-4 px-4">1</td>
              <td className="text-right py-4 px-4">
                {formatCurrency(order.amount || 0, order.currency)}
              </td>
              <td className="text-right py-4 px-4">
                {formatCurrency(order.amount || 0, order.currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-2 text-sm ml-auto w-72">
        {order.original_amount && order.original_amount > (order.amount || 0) && (
          <>
            <div className="flex justify-between">
              <span>原价</span>
              <span>{formatCurrency(order.original_amount, order.currency)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>优惠折扣</span>
              <span>-{formatCurrency(order.original_amount - (order.amount || 0), order.currency)}</span>
            </div>
          </>
        )}
        
        <div className="flex justify-between border-t pt-2 text-base font-medium">
          <span>实付金额</span>
          <span>{formatCurrency(order.amount || 0, order.currency)}</span>
        </div>

        {order.exchange_rate && order.currency === 'cny' && (
          <div className="text-xs text-muted-foreground mt-2">
            <p>汇率: 1 USD = {order.exchange_rate} CNY</p>
            <p>折合美元: ${(order.amount / (order.exchange_rate || 1)).toFixed(2)}</p>
          </div>
        )}
      </div>

      <div className="mt-12 pt-4 border-t text-sm text-center text-muted-foreground">
        {order.status === 'completed' ? (
          <p>此订单已完成支付 - {format(new Date(order.updated_at || order.created_at), 'yyyy-MM-dd HH:mm:ss')}</p>
        ) : (
          <p>订单状态：{
            order.status === 'pending' ? '待处理' :
            order.status === 'processing' ? '处理中' :
            order.status === 'failed' ? '支付失败' :
            order.status === 'cancelled' ? '已取消' :
            order.status
          }</p>
        )}
      </div>
    </div>
  );
};
