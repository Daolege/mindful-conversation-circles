
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { loginWithDemoAccount } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from 'lucide-react';

const DemoAccountButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      const result = await loginWithDemoAccount();
      
      if (result.success) {
        toast.success('已使用演示账户登录', {
          description: '您已成功以演示用户身份登录',
          duration: 5000
        });
        navigate('/');
      } else {
        toast.error('演示账户登录失败', {
          description: '无法登录到演示账户，请稍后再试',
          duration: 8000
        });
      }
    } catch (error: any) {
      toast.error('系统错误', {
        description: '登录过程中发生错误，请稍后再试',
        duration: 8000
      });
      console.error('Demo login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="w-full mt-4 bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300"
      disabled={isLoading}
      onClick={handleDemoLogin}
    >
      <Database className="mr-2 h-4 w-4" />
      {isLoading ? '登录中...' : '使用演示账户登录'}
    </Button>
  );
};

export default DemoAccountButton;
