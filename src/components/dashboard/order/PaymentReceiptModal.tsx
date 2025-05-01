
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
  const [isPrinting, setIsPrinting] = useState(false);

  // 改进打印功能，使用专门的CSS类和打印媒体查询
  const handlePrint = () => {
    if (!receiptRef.current) {
      toast.error('无法找到凭证内容');
      return;
    }

    // 添加正在打印状态
    setIsPrinting(true);

    // 确保收据内容有正确的打印类
    document.body.classList.add('printing-receipt');
    
    // 将收据克隆到一个隐藏的容器，专门用于打印
    const printContainer = document.createElement('div');
    printContainer.className = 'receipt-print-container';
    printContainer.style.position = 'fixed';
    printContainer.style.top = '0';
    printContainer.style.left = '0';
    printContainer.style.width = '100%';
    printContainer.style.zIndex = '-1000';
    printContainer.style.backgroundColor = 'white';
    printContainer.appendChild(receiptRef.current.cloneNode(true));
    document.body.appendChild(printContainer);
    
    // 确保样式加载完成后打印
    setTimeout(() => {
      window.print();
      
      // 清理
      document.body.removeChild(printContainer);
      document.body.classList.remove('printing-receipt');
      setIsPrinting(false);
    }, 200);
  };

  // 改进下载功能，直接生成完整的PDF内容
  const handleDownload = () => {
    try {
      // 创建新窗口用于生成PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('无法创建下载窗口，请检查是否启用弹出窗口');
        return;
      }
      
      // 计算节省金额信息
      const savingsAmount = calculateSavings(order);
      const savingsPercentage = getSavingsPercentage(order);
      const hasSavings = savingsAmount > 0;
      
      // 生成凭证内容 - 包含完整的CSS
      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>支付凭证_${order.id.substring(0, 8)}</title>
            <meta charset="UTF-8">
            <style>
              @media print {
                body { 
                  print-color-adjust: exact;
                  -webkit-print-color-adjust: exact;
                }
              }
              body { 
                font-family: Arial, sans-serif; 
                padding: 0; 
                margin: 0; 
                color: #333;
                background-color: white;
              }
              .container { 
                padding: 40px; 
                max-width: 800px; 
                margin: 0 auto; 
                border: 1px solid #eee;
                box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                border-radius: 8px;
              }
              .receipt-header { 
                display: flex; 
                justify-content: space-between; 
                border-bottom: 1px solid #eee; 
                padding-bottom: 20px; 
                margin-bottom: 30px; 
              }
              .logo-text {
                font-size: 24px;
                font-weight: bold;
                color: #0f172a;
              }
              .customer-info { 
                margin-bottom: 30px;
                line-height: 1.6;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 30px;
              }
              th { 
                background-color: #f9fafb;
                padding: 12px; 
                text-align: left; 
                border-bottom: 2px solid #eee; 
              }
              td { 
                padding: 12px; 
                text-align: left; 
                border-bottom: 1px solid #eee; 
              }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .totals { 
                margin-top: 20px; 
                text-align: right; 
                padding: 15px;
                background-color: #f9fafb;
                border-radius: 8px;
              }
              .totals p {
                margin: 5px 0;
              }
              .green { color: #16a34a; }
              .footer { 
                margin-top: 40px; 
                text-align: center; 
                color: #666; 
                font-size: 12px;
                padding-top: 20px;
                border-top: 1px solid #eee;
              }
              .print-button {
                background-color: #0f172a;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                display: block;
                margin: 30px auto 0;
              }
              .status-completed {
                color: #16a34a;
                font-weight: 500;
              }
              .status-pending {
                color: #f59e0b;
                font-weight: 500;
              }
              .status-cancelled {
                color: #ef4444;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="receipt-header">
                <div>
                  <h1 style="margin: 0; color: #0f172a;">支付凭证</h1>
                  <p style="margin: 5px 0 0; color: #6b7280;">Payment Receipt</p>
                </div>
                <div class="logo-text">
                  ${siteConfig.name || '在线学习平台'}
                </div>
              </div>
              
              <div class="customer-info">
                <p><strong>客户:</strong> ${order.profiles?.full_name || '未提供姓名'}</p>
                <p><strong>邮箱:</strong> ${order.profiles?.email || '未提供邮箱'}</p>
                <p><strong>支付方式:</strong> ${
                  order.payment_type === 'wechat' ? '微信支付' :
                  order.payment_type === 'alipay' ? '支付宝' :
                  order.payment_type === 'credit-card' ? '信用卡' : 
                  order.payment_type === 'admin' ? '管理员手动标记' :
                  order.payment_type || '未知'
                }</p>
                <p><strong>订单日期:</strong> ${new Date(order.created_at).toLocaleString('zh-CN', {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit', second: '2-digit'
                })}</p>
                <p><strong>订单编号:</strong> ${order.id}</p>
                <p><strong>订单状态:</strong> <span class="${
                  order.status === 'completed' ? 'status-completed' : 
                  order.status === 'pending' ? 'status-pending' : 
                  order.status === 'cancelled' ? 'status-cancelled' : ''
                }">${
                  order.status === 'completed' ? '已完成' : 
                  order.status === 'pending' ? '待支付' : 
                  order.status === 'processing' ? '处理中' : 
                  order.status === 'failed' ? '失败' : 
                  order.status === 'cancelled' ? '已取消' : 
                  order.status
                }</span></p>
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
                <p style="font-size: 18px; margin-top: 10px;"><strong>实付金额:</strong> ${formatCurrency(order.amount || 0, order.currency)}</p>
                ${order.exchange_rate && order.currency === 'cny' ? `
                  <p style="font-size: 12px; color: #666; margin-top: 15px">汇率: 1 USD = ${order.exchange_rate} CNY</p>
                  <p style="font-size: 12px; color: #666;">折合美元: $${(order.amount / (order.exchange_rate || 1)).toFixed(2)}</p>
                ` : ''}
              </div>
              
              <div class="footer">
                <p>${order.status === 'completed' ? '此订单已完成支付' : '订单状态：' + order.status}</p>
                <p>本凭证作为支付证明，非正式发票</p>
                <p>${new Date().toLocaleString('zh-CN')} 生成</p>
              </div>
              
              <button onclick="window.print(); setTimeout(function() { window.close(); }, 500);" class="print-button">
                打印或保存为PDF
              </button>
            </div>
          </body>
        </html>
      `;
      
      // 写入新窗口并聚焦
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
    <Dialog open={open} onOpenChange={(value) => {
      // 只有未处于打印状态时才能关闭对话框
      if (!isPrinting) {
        onOpenChange(value);
      }
    }}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b print:hidden">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="h-5 w-5" />
            支付凭证
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-0">
          <div className="px-4 py-3 bg-gray-50 print:hidden flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={handleDownload}
              disabled={isPrinting}
            >
              <Download className="h-4 w-4" />
              下载凭证
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={handlePrint}
              disabled={isPrinting}
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

      {/* 添加专用于打印的样式 */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          
          body.printing-receipt .receipt-print-container,
          body.printing-receipt .receipt-print-container * {
            visibility: visible !important;
          }
          
          body.printing-receipt .receipt-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </Dialog>
  );
};
