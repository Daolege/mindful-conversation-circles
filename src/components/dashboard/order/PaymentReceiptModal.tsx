
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Order } from '@/lib/types/order';
import { OrderReceipt } from './OrderReceipt';
import { Download, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { calculateSavings, getSavingsPercentage } from '@/lib/services/currencyService';

interface PaymentReceiptModalProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentReceiptModal = ({ order, open, onOpenChange }: PaymentReceiptModalProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // 修复打印功能
  const handlePrint = () => {
    // Add print class to make receipt visible during printing
    if (receiptRef.current) {
      receiptRef.current.classList.add('print-receipt');
      
      // Trigger print
      window.print();
      
      // Remove print class after printing
      setTimeout(() => {
        if (receiptRef.current) {
          receiptRef.current.classList.remove('print-receipt');
        }
      }, 500);
    }
  };

  // 修复下载功能，生成更可靠的PDF内容
  const handleDownload = () => {
    try {
      // Create a new window to generate PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('无法创建下载窗口，请检查是否启用弹出窗口');
        return;
      }
      
      // Calculate savings information
      const savingsAmount = calculateSavings(order);
      const savingsPercentage = getSavingsPercentage(order);
      const hasSavings = savingsAmount > 0;
      
      // Generate receipt content
      const content = `
        <html>
          <head>
            <title>支付凭证_${order.id.substring(0, 8)}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 0; margin: 0; }
              .container { padding: 20px; max-width: 800px; margin: 0 auto; }
              .receipt-header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px; }
              .customer-info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .totals { margin-top: 20px; text-align: right; }
              .green { color: green; }
              .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
              @media print {
                .no-print { display: none; }
                body { margin: 0; padding: 20px; }
                .container { width: 100%; max-width: none; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="receipt-header">
                <div>
                  <h1>支付凭证</h1>
                  <p>Payment Receipt</p>
                </div>
                <div>
                  <p>${siteConfig.name || '在线学习平台'}</p>
                </div>
              </div>
              
              <div class="customer-info">
                <p><strong>客户:</strong> ${order.profiles?.full_name || '未提供姓名'}</p>
                <p><strong>邮箱:</strong> ${order.profiles?.email || '未提供邮箱'}</p>
                <p><strong>支付方式:</strong> ${
                  order.payment_type === 'wechat' ? '微信支付' :
                  order.payment_type === 'alipay' ? '支付宝' :
                  order.payment_type === 'credit-card' ? '信用卡' : 
                  order.payment_type || '未知'
                }</p>
                <p><strong>订单日期:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                <p><strong>订单编号:</strong> ${order.id}</p>
                <p><strong>订单状态:</strong> ${order.status === 'completed' ? '已完成' : 
                                              order.status === 'pending' ? '待支付' : 
                                              order.status === 'processing' ? '处理中' : 
                                              order.status === 'failed' ? '失败' : 
                                              order.status === 'cancelled' ? '已取消' : 
                                              order.status}</p>
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>描述</th>
                    <th class="text-center">数量</th>
                    <th class="text-right">单价</th>
                    <th class="text-right">金额</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${Array.isArray(order.courses) ? 
                      (order.courses.length > 0 ? order.courses[0].title : '课程已删除') : 
                      (order.courses ? order.courses.title : '课程已删除')}</td>
                    <td class="text-center">1</td>
                    <td class="text-right">${formatCurrency(order.original_amount || order.amount || 0, order.currency)}</td>
                    <td class="text-right">${formatCurrency(order.amount || 0, order.currency)}</td>
                  </tr>
                </tbody>
              </table>
              
              <div class="totals">
                ${hasSavings ? `
                  <p><strong>原价:</strong> ${formatCurrency(order.original_amount || 0, order.currency)}</p>
                  <p class="green"><strong>节省金额 (${savingsPercentage}%):</strong> -${formatCurrency(savingsAmount, order.currency)}</p>
                ` : ''}
                <p><strong>实付金额:</strong> ${formatCurrency(order.amount || 0, order.currency)}</p>
                ${order.exchange_rate && order.currency === 'cny' ? `
                  <p style="font-size: 12px; color: #666;">汇率: 1 USD = ${order.exchange_rate} CNY</p>
                  <p style="font-size: 12px; color: #666;">折合美元: $${(order.amount / (order.exchange_rate || 1)).toFixed(2)}</p>
                ` : ''}
              </div>
              
              <div class="footer">
                <p>${order.status === 'completed' ? '此订单已完成支付' : '订单状态：' + order.status}</p>
                <p>本凭证作为支付证明，非正式发票</p>
              </div>
              
              <div class="no-print" style="margin-top: 30px; text-align: center;">
                <button onclick="window.print(); setTimeout(function() { window.close(); }, 500);" style="padding: 10px 20px; background: #0f172a; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  打印或保存为PDF
                </button>
              </div>
            </div>
          </body>
        </html>
      `;
      
      // Write to the new window and focus it
      printWindow.document.open();
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      
      toast.success('凭证已打开，请使用浏览器的打印功能将其保存为PDF');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('生成PDF时出错，请稍后重试');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden print:shadow-none">
        <DialogHeader className="p-6 border-b print-hide">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="h-5 w-5" />
            支付凭证
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-0">
          <div className="px-4 py-3 bg-gray-50 print-hide flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              下载凭证
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              打印凭证
            </Button>
          </div>
          
          <div className="p-6 bg-white" ref={receiptRef}>
            <OrderReceipt order={order} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
