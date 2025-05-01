
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Order } from '@/lib/types/order';
import { OrderReceipt } from './OrderReceipt';
import { Download, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface PaymentReceiptModalProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PaymentReceiptModal = ({ order, open, onOpenChange }: PaymentReceiptModalProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = () => {
    // Create a temporary iframe to render the receipt for download
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Generate receipt content
    const content = `
      <html>
        <head>
          <title>支付凭证_${order.id.substring(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; }
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
                <p>${siteConfig.name}</p>
              </div>
            </div>
            
            <div class="customer-info">
              <p><strong>客户:</strong> ${order.profiles?.full_name || '未提供姓名'}</p>
              <p><strong>邮箱:</strong> ${order.profiles?.email || '未提供邮箱'}</p>
              <p><strong>支付方式:</strong> ${order.payment_type || '未知'}</p>
              <p><strong>订单日期:</strong> ${new Date(order.created_at).toLocaleString()}</p>
              <p><strong>订单编号:</strong> ${order.id}</p>
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
              ${order.original_amount && order.original_amount > order.amount ? `
                <p><strong>原价:</strong> ${formatCurrency(order.original_amount, order.currency)}</p>
                <p class="green"><strong>节省金额 (${Math.round((order.original_amount - order.amount) / order.original_amount * 100)}%):</strong> -${formatCurrency(order.original_amount - order.amount, order.currency)}</p>
              ` : ''}
              <p><strong>实付金额:</strong> ${formatCurrency(order.amount || 0, order.currency)}</p>
            </div>
            
            <div class="footer">
              <p>${order.status === 'completed' ? '此订单已完成支付' : '订单状态：' + order.status}</p>
              <p>本凭证作为支付证明，非正式发票</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Write the content to the iframe
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDocument) {
      iframeDocument.open();
      iframeDocument.write(content);
      iframeDocument.close();
      
      // Trigger download after a short delay to allow content to render
      setTimeout(() => {
        try {
          iframe.contentWindow?.print();
          // Or trigger download as PDF if supported by browser
          // This is a simplified approach, PDF generation would ideally use a library
          toast({
            title: "凭证已下载",
            description: "支付凭证已准备好打印或保存为PDF",
          });
        } catch (e) {
          console.error('Error downloading receipt:', e);
          toast({
            title: "凭证下载失败",
            description: "请尝试使用打印功能并选择'保存为PDF'",
            variant: "destructive",
          });
        }
        
        // Clean up
        document.body.removeChild(iframe);
      }, 500);
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

// Import required for the PDF generation
import { siteConfig } from '@/config/site';
import { formatCurrency } from '@/lib/utils';
