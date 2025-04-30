
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Plus, X } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { type AboutPageSettings as AboutPageSettingsType, handleAboutPageQueryError } from "@/lib/supabaseUtils";

export function AboutPageSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Get about page settings
  const { data: aboutPage, isLoading: isLoadingData } = useQuery({
    queryKey: ['admin-about-page-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_page_settings')
        .select('*')
        .single();

      const result = handleAboutPageQueryError(data, error);
      return result;
    },
  });

  // Initialize state with current settings or defaults
  const [settings, setSettings] = useState<AboutPageSettingsType>({
    id: '1',
    title: "关于智慧园",
    subtitle: null,
    mission: null,
    vision: null,
    story: null,
    is_visible: true,
    team_members: [],
    stats: [],
    updated_at: new Date().toISOString(),
    updated_by: null
  });

  // New team member form state
  const [newMember, setNewMember] = useState({
    name: "",
    title: "",
    bio: "",
    avatar_url: ""
  });

  // New stat form state
  const [newStat, setNewStat] = useState({
    label: "",
    value: "",
    description: ""
  });

  // Update state when data is loaded
  if (aboutPage && !isLoading && settings.title !== aboutPage.title) {
    setSettings({
      ...aboutPage
    });
  }

  // Add new team member
  const addTeamMember = () => {
    if (!newMember.name || !newMember.title) {
      toast.error("请填写团队成员的姓名和职位");
      return;
    }

    setSettings({
      ...settings,
      team_members: [...(settings.team_members as any[] || []), { ...newMember, id: Date.now() }]
    });

    setNewMember({
      name: "",
      title: "",
      bio: "",
      avatar_url: ""
    });

    toast.success("团队成员已添加");
  };

  // Add new stat
  const addStat = () => {
    if (!newStat.label || !newStat.value) {
      toast.error("请填写统计数据的标签和值");
      return;
    }

    setSettings({
      ...settings,
      stats: [...(settings.stats as any[] || []), { ...newStat, id: Date.now() }]
    });

    setNewStat({
      label: "",
      value: "",
      description: ""
    });

    toast.success("统计数据已添加");
  };

  // Remove team member
  const removeTeamMember = (id: number) => {
    setSettings({
      ...settings,
      team_members: (settings.team_members as any[]).filter((member: any) => member.id !== id)
    });
    toast.success("团队成员已移除");
  };

  // Remove stat
  const removeStat = (id: number) => {
    setSettings({
      ...settings,
      stats: (settings.stats as any[]).filter((stat: any) => stat.id !== id)
    });
    toast.success("统计数据已移除");
  };

  // Save settings
  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('about_page_settings')
        .update({
          title: settings.title,
          subtitle: settings.subtitle,
          mission: settings.mission,
          vision: settings.vision,
          story: settings.story,
          is_visible: settings.is_visible,
          team_members: settings.team_members,
          stats: settings.stats,
          updated_at: new Date().toISOString(),
          updated_by: null // Would be the current user's ID in a real app
        } as any)
        .eq('id', settings.id as any);

      if (error) throw error;

      toast.success("关于页面设置已保存");
      queryClient.invalidateQueries({ queryKey: ['admin-about-page-settings'] });
    } catch (error: any) {
      console.error("Error saving about page settings:", error);
      toast.error("保存设置失败: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">关于页面设置</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Switch 
              id="about-visible"
              checked={settings.is_visible}
              onCheckedChange={(checked) => setSettings({ ...settings, is_visible: checked })}
            />
            <Label htmlFor="about-visible">启用关于页面</Label>
          </div>
          <Button onClick={saveSettings} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存设置
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>设置关于页面的基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">页面标题</Label>
              <Input 
                id="title"
                value={settings.title} 
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                placeholder="请输入页面标题"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">页面副标题</Label>
              <Input 
                id="subtitle"
                value={settings.subtitle} 
                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                placeholder="请输入页面副标题（可选）"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission">我们的使命</Label>
              <Textarea 
                id="mission"
                value={settings.mission} 
                onChange={(e) => setSettings({ ...settings, mission: e.target.value })}
                placeholder="请输入机构使命"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vision">我们的愿景</Label>
              <Textarea 
                id="vision"
                value={settings.vision} 
                onChange={(e) => setSettings({ ...settings, vision: e.target.value })}
                placeholder="请输入机构愿景"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="story">我们的故事</Label>
              <Textarea 
                id="story"
                value={settings.story} 
                onChange={(e) => setSettings({ ...settings, story: e.target.value })}
                placeholder="请输入机构故事"
                rows={5}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>团队成员</CardTitle>
            <CardDescription>添加团队成员信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(settings.team_members as any[] || []).map((member: any) => (
                <Card key={member.id} className="relative">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeTeamMember(member.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{member.name}</CardTitle>
                    <CardDescription>{member.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-500">{member.bio}</p>
                    {member.avatar_url && (
                      <div className="mt-2">
                        <Label className="text-xs">头像URL:</Label>
                        <p className="text-xs text-gray-500 truncate">{member.avatar_url}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="border p-4 rounded-md">
              <h4 className="font-medium mb-3">添加新团队成员</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="member-name">姓名</Label>
                  <Input 
                    id="member-name"
                    value={newMember.name} 
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="请输入姓名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-title">职位</Label>
                  <Input 
                    id="member-title"
                    value={newMember.title} 
                    onChange={(e) => setNewMember({ ...newMember, title: e.target.value })}
                    placeholder="请输入职位"
                  />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="member-bio">简介</Label>
                <Textarea 
                  id="member-bio"
                  value={newMember.bio} 
                  onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                  placeholder="请输入简介"
                  rows={2}
                />
              </div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="member-avatar">头像URL (可选)</Label>
                <Input 
                  id="member-avatar"
                  value={newMember.avatar_url} 
                  onChange={(e) => setNewMember({ ...newMember, avatar_url: e.target.value })}
                  placeholder="请输入头像URL"
                />
              </div>
              <Button 
                onClick={addTeamMember}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                添加团队成员
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>统计数据</CardTitle>
            <CardDescription>添加要在关于页面显示的统计数据</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(settings.stats as any[] || []).map((stat: any) => (
                <Card key={stat.id} className="relative">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeStat(stat.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">{stat.value}</CardTitle>
                    <CardDescription>{stat.label}</CardDescription>
                  </CardHeader>
                  {stat.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-500">{stat.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            <div className="border p-4 rounded-md">
              <h4 className="font-medium mb-3">添加新统计数据</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="stat-label">标签</Label>
                  <Input 
                    id="stat-label"
                    value={newStat.label} 
                    onChange={(e) => setNewStat({ ...newStat, label: e.target.value })}
                    placeholder="例如: 学生人数"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stat-value">数值</Label>
                  <Input 
                    id="stat-value"
                    value={newStat.value} 
                    onChange={(e) => setNewStat({ ...newStat, value: e.target.value })}
                    placeholder="例如: 10,000+"
                  />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <Label htmlFor="stat-description">描述 (可选)</Label>
                <Input 
                  id="stat-description"
                  value={newStat.description} 
                  onChange={(e) => setNewStat({ ...newStat, description: e.target.value })}
                  placeholder="可选的附加描述"
                />
              </div>
              <Button 
                onClick={addStat}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                添加统计数据
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存所有设置
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
