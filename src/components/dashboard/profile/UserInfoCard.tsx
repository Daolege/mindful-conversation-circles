import { useAuth } from "@/contexts/authHooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Image, Mail, Calendar, Clock } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const UserInfoCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fetchCurrentUserData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        console.log("[UserInfoCard] 获取最新用户信息:", currentUser);
        setDisplayName(currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || "");
      }
    } catch (error) {
      console.error("[UserInfoCard] 获取用户信息失败:", error);
    }
  };

  useEffect(() => {
    fetchCurrentUserData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      console.log("[UserInfoCard] 用户认证信息已更新:", user);
      fetchCurrentUserData();
    }
  }, [user]);

  const handleNameUpdate = async () => {
    if (!displayName.trim()) {
      toast({
        title: "请输入用户名",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: displayName }
      });

      if (error) throw error;
      
      toast({
        title: "用户名已更新",
        description: "您的个人资料已成功更新",
      });
      setIsEditingName(false);
      
      const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error("[UserInfoCard] 刷新会话失败:", refreshError);
      } else if (sessionData.user) {
        console.log("[UserInfoCard] 会话已刷新，用户信息已更新:", sessionData.user.user_metadata?.name);
        setDisplayName(sessionData.user.user_metadata?.name || "");
      }
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "文件类型错误",
        description: "请上传图片文件",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "头像图片不能超过2MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: urlData.publicUrl }
      });

      if (updateError) throw updateError;

      toast({
        title: "头像已更新",
        description: "您的头像已成功更新",
      });
      
      const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error("[UserInfoCard] 刷新会话失败:", refreshError);
      } else if (sessionData.user) {
        console.log("[UserInfoCard] 会话已刷新，头像已更新");
        fetchCurrentUserData();
      }
    } catch (error: any) {
      toast({
        title: "头像更新失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const mockLastSignIn = useMemo(() => {
    const now = new Date();
    const mockDate = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
    return mockDate.toISOString();
  }, []);

  const userInitials = displayName 
    ? displayName.charAt(0).toUpperCase() 
    : user?.email?.charAt(0).toUpperCase() || "U";
  
  const avatarUrl = user?.user_metadata?.avatar_url;
  const accountStatus = user?.account_status || 'active';
  const registrationDate = user?.user_metadata?.registration_date 
    ? format(new Date(user.user_metadata.registration_date), 'yyyy年MM月dd日')
    : format(new Date(), 'yyyy年MM月dd日');
  const lastSignIn = user?.last_sign_in_at || mockLastSignIn;
  const formattedLastSignIn = lastSignIn
    ? format(new Date(lastSignIn), 'yyyy年MM月dd日 HH:mm')
    : '暂无记录';

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧：头像和状态 */}
          <div className="lg:w-1/3 flex flex-col items-center">
            <div className="relative group mb-6">
              <Avatar className="h-32 w-32 border-4 border-white bg-white shadow-lg">
                <AvatarImage 
                  src={avatarUrl} 
                  alt={displayName || "用户头像"}
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-knowledge-primary to-knowledge-secondary text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="secondary"
                size="sm"
                disabled={isUploading}
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
                  "flex items-center gap-2 shadow-lg",
                  "opacity-0 group-hover:opacity-100 transition-all duration-300",
                  "bg-white hover:bg-gray-50"
                )}
              >
                <Image className="h-4 w-4" />
                {isUploading ? "上传中..." : "更换头像"}
              </Button>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </div>
          </div>

          {/* 右侧：用户信息 */}
          <div className="lg:w-2/3 space-y-6">
            {/* 用户名和状态 */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <Label className="text-base font-medium text-gray-500">用户名</Label>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <Input 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="max-w-[200px]"
                      placeholder="请输入用户名"
                    />
                    <Button 
                      variant="default"
                      size="sm"
                      onClick={handleNameUpdate}
                      className="bg-knowledge-primary hover:bg-knowledge-secondary text-white transition-colors"
                    >
                      保存
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setIsEditingName(false);
                        fetchCurrentUserData();
                      }}
                      className="border-knowledge-primary text-knowledge-primary hover:bg-knowledge-primary/5"
                    >
                      取消
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-medium">{displayName || user?.email?.split('@')[0] || "用户"}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditingName(true)}
                      className="text-knowledge-primary hover:text-knowledge-primary/90 -ml-2"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      编辑
                    </Button>
                  </div>
                )}
              </div>
              
              <Badge 
                variant={accountStatus === 'active' ? 'outline' : 'destructive'} 
                className={cn(
                  "font-medium px-3 py-1", 
                  accountStatus === 'active' ? "bg-green-50 text-green-700 border-green-200" : ""
                )}
              >
                {accountStatus === 'active' ? '账号状态正常' : '账号状态异常'}
              </Badge>
            </div>

            {/* 邮箱 */}
            <div className="space-y-1">
              <Label className="text-base font-medium text-gray-500">电子邮箱</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <p className="text-base">{user?.email}</p>
              </div>
              <p className="text-xs text-muted-foreground">邮箱为账户唯一标识，不可修改</p>
            </div>

            {/* 时间信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>注册时间：</span>
                <span className="text-gray-800 font-medium">{registrationDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>上次登录：</span>
                <span className="text-gray-800 font-medium">{formattedLastSignIn}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
