
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface OrderDetailErrorProps {
  error: string;
  onBack: () => void;
}

export const OrderDetailError = ({ error, onBack }: OrderDetailErrorProps) => {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertTitle className="text-lg">错误</AlertTitle>
        <AlertDescription className="mt-2">{error}</AlertDescription>
      </Alert>
      <div className="mt-6">
        <Button 
          variant="outline"
          onClick={onBack}
          className="inline-flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回我的订单
        </Button>
      </div>
      
      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-medium mb-2">可能的原因：</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
          <li>订单ID可能输入错误或不存在</li>
          <li>您可能没有权限查看该订单</li>
          <li>订单可能已被删除</li>
          <li>您的登录会话可能已过期，请尝试重新登录</li>
          <li>系统暂时出现数据库连接问题，请稍后重试</li>
          <li>订单数据可能不完整，请联系客服</li>
        </ul>
      </div>
    </div>
  );
};
