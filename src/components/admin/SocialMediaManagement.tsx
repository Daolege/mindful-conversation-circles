
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslations } from "@/hooks/useTranslations";
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const SocialMediaManagement = () => {
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);

  // Load social links on component mount
  useEffect(() => {
    loadSocialLinks();
  }, []);

  // Function to load social links from database
  const loadSocialLinks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setSocialLinks(data || []);
    } catch (error) {
      console.error("Error loading social media links:", error);
      toast.error("加载社交媒体链接失败");
    } finally {
      setIsLoading(false);
    }
  };

  // Add new social media link
  const addSocialLink = () => {
    setSocialLinks([
      ...socialLinks,
      {
        id: `temp-${Date.now()}`,
        name: '',
        icon_url: '',
        url: '',
        is_active: true,
        display_order: socialLinks.length
      }
    ]);
  };

  // Remove social media link
  const removeSocialLink = (indexToRemove) => {
    setSocialLinks(socialLinks.filter((_, index) => index !== indexToRemove));
  };

  // Move link up in order
  const moveLinkUp = (index) => {
    if (index === 0) return;
    const newLinks = [...socialLinks];
    [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];
    
    // Update display order
    newLinks.forEach((link, idx) => {
      link.display_order = idx;
    });
    
    setSocialLinks(newLinks);
  };

  // Move link down in order
  const moveLinkDown = (index) => {
    if (index === socialLinks.length - 1) return;
    const newLinks = [...socialLinks];
    [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];
    
    // Update display order
    newLinks.forEach((link, idx) => {
      link.display_order = idx;
    });
    
    setSocialLinks(newLinks);
  };

  // Handle input change
  const handleChange = (index, field, value) => {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  };

  // Save all social links
  const saveSocialLinks = async () => {
    // Validate links before saving
    for (const link of socialLinks) {
      if (!link.name || !link.icon_url || !link.url) {
        toast.error("所有字段都需要填写");
        return;
      }
    }
    
    setIsSaving(true);
    try {
      // First delete all existing links
      await supabase.from('social_media_links').delete().not('id', 'is', null);
      
      // Then insert the new ones
      const { error } = await supabase
        .from('social_media_links')
        .upsert(
          socialLinks.map((link, index) => ({
            ...link,
            display_order: index,
            id: link.id && !link.id.startsWith('temp-') ? link.id : undefined
          }))
        );
      
      if (error) {
        throw error;
      }
      
      toast.success("社交媒体链接已保存");
      loadSocialLinks(); // Reload to get the real IDs
    } catch (error) {
      console.error("Error saving social media links:", error);
      toast.error("保存社交媒体链接失败");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>社交媒体管理</CardTitle>
        <CardDescription>管理网站底部显示的社交媒体链接</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {socialLinks.map((link, index) => (
            <div key={link.id} className="p-4 border rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">社交媒体 #{index + 1}</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => moveLinkUp(index)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => moveLinkDown(index)}
                    disabled={index === socialLinks.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => removeSocialLink(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>平台名称</Label>
                  <Input
                    id={`name-${index}`}
                    value={link.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    placeholder="例如: Facebook, Twitter"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`icon-${index}`}>图标URL</Label>
                  <Input
                    id={`icon-${index}`}
                    value={link.icon_url}
                    onChange={(e) => handleChange(index, 'icon_url', e.target.value)}
                    placeholder="图标图片URL地址"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`url-${index}`}>链接地址</Label>
                <Input
                  id={`url-${index}`}
                  value={link.url}
                  onChange={(e) => handleChange(index, 'url', e.target.value)}
                  placeholder="https://"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`active-${index}`}
                  checked={link.is_active}
                  onCheckedChange={(checked) => handleChange(index, 'is_active', checked)}
                />
                <Label htmlFor={`active-${index}`}>启用此社交媒体链接</Label>
              </div>
              
              {link.icon_url && (
                <div className="mt-2">
                  <Label>预览图标:</Label>
                  <div className="mt-1 p-2 border rounded bg-gray-50 flex items-center">
                    <img src={link.icon_url} alt={link.name} className="h-8 w-8 object-contain" />
                    <span className="ml-2 text-sm text-gray-500">
                      {link.name} {link.is_active ? '(已启用)' : '(已禁用)'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <Button 
            variant="outline" 
            onClick={addSocialLink}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" /> 添加社交媒体
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          onClick={saveSocialLinks}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {isSaving ? '保存中...' : '保存所有社交媒体'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SocialMediaManagement;
