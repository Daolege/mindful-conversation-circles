
import { UserInfoCard } from "./profile/UserInfoCard";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Key, LogOut } from "lucide-react";
import { useState } from "react";
import { PasswordChangeDialog } from "./security/PasswordChangeDialog";
import { AccountDeactivationDialog } from "./security/AccountDeactivationDialog";
import { useAuth } from "@/contexts/authHooks";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const ProfileManagement = () => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      await signOut();
      // 不要在这里直接导航，让AuthProvider处理登出后的导航
      toast.success("退出成功", {
        description: "期待您的再次登录"
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("退出失败", { 
        description: "请稍后重试" 
      });
      setIsLoggingOut(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <UserInfoCard />
        
        <Card>
          <CardHeader className="bg-gradient-to-r from-knowledge-primary/5 to-knowledge-secondary/5">
            <h3 className="text-2xl font-semibold">账号安全</h3>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* 密码管理 */}
              <div className="flex items-center justify-between gap-4 p-4 border border-dashed rounded-lg transition-colors hover:bg-gray-50">
                <div className="space-y-1">
                  <div className="font-medium">密码管理</div>
                  <div className="text-sm text-muted-foreground">
                    定期更改密码，确保您的账户安全
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setIsPasswordDialogOpen(true)}
                  className="w-28 shrink-0 hover:scale-105 hover:shadow-sm transition-all"
                >
                  <Key className="h-4 w-4 mr-2" />
                  更改密码
                </Button>
              </div>

              {/* 退出登录 */}
              <div className="flex items-center justify-between gap-4 p-4 border border-dashed rounded-lg transition-colors hover:bg-gray-50">
                <div className="space-y-1">
                  <div className="font-medium">退出登录</div>
                  <div className="text-sm text-muted-foreground">
                    安全退出您的账号
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setIsLogoutDialogOpen(true)}
                  disabled={isLoggingOut}
                  className="w-28 shrink-0 hover:scale-105 hover:shadow-sm transition-all"
                >
                  {isLoggingOut ? (
                    <>处理中...</>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      退出
                    </>
                  )}
                </Button>
              </div>

              {/* 账号注销 - moved to bottom */}
              <div className="flex items-center justify-between gap-4 p-4 border border-dashed border-destructive/30 rounded-lg transition-colors hover:bg-red-50">
                <div className="space-y-1">
                  <div className="font-medium">账号注销</div>
                  <div className="text-sm text-muted-foreground">
                    永久删除您的账号和所有关联数据
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => setIsDeactivateDialogOpen(true)}
                  className="w-28 shrink-0 text-destructive border-destructive/50 hover:border-destructive hover:bg-destructive/10 hover:scale-105 hover:shadow-sm transition-all"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  申请注销
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 密码修改对话框 */}
        <PasswordChangeDialog 
          open={isPasswordDialogOpen}
          onOpenChange={setIsPasswordDialogOpen}
        />

        {/* 账号注销对话框 */}
        <AccountDeactivationDialog 
          open={isDeactivateDialogOpen}
          onOpenChange={setIsDeactivateDialogOpen}
        />

        {/* 退出确认对话框 */}
        <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认退出</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要退出登录吗？退出后需要重新登录才能访问您的账户。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "处理中..." : "确认退出"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};
