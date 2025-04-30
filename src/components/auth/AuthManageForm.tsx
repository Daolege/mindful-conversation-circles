
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/authHooks";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";

const AuthManageForm = () => {
  const { user, signOut, setAdmin } = useAuth();
  const [isSettingAdmin, setIsSettingAdmin] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSetAdmin = async () => {
    if (isSettingAdmin) return;
    
    setIsSettingAdmin(true);
    try {
      await setAdmin();
    } catch (error) {
      console.error("Set admin error:", error);
    } finally {
      setIsSettingAdmin(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">账号管理</h2>
        <p className="text-gray-600">管理您的账号设置</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">当前账户</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="font-medium mb-2">账户操作</p>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                onClick={handleSetAdmin}
                disabled={isSettingAdmin}
                className="w-full flex items-center justify-center rounded-10"
              >
                {isSettingAdmin ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    设置为管理员
                  </>
                )}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full rounded-10"
              >
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuthManageForm;
