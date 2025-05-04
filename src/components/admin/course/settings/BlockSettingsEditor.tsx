
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IconSelect } from './IconSelect';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BlockSettingsEditorProps {
  courseId: number;
  sectionType: string;
  title?: string;
}

interface SectionConfig {
  title: string;
  description: string;
  icon: string;
}

export const BlockSettingsEditor: React.FC<BlockSettingsEditorProps> = ({
  courseId,
  sectionType,
  title = '板块设置'
}) => {
  const [settings, setSettings] = useState<SectionConfig>({
    title: '',
    description: '',
    icon: 'book-open'
  });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadSettings();
  }, [courseId, sectionType]);
  
  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_course_section_config', {
          p_course_id: courseId,
          p_section_type: sectionType
        });
      
      if (error) {
        console.error('Error loading settings:', error);
        throw error;
      }
      
      if (data) {
        // Parse the data from the function result
        const configData = data as unknown as SectionConfig;
        setSettings({
          title: configData.title || '',
          description: configData.description || '',
          icon: configData.icon || 'book-open'
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('加载设置失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .rpc('upsert_course_section_config', {
          p_course_id: courseId,
          p_section_type: sectionType,
          p_title: settings.title,
          p_description: settings.description,
          p_icon: settings.icon
        });
      
      if (error) {
        console.error('Error saving settings:', error);
        throw error;
      }
      
      toast.success('设置已保存');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              placeholder="输入显示的标题"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              placeholder="输入描述信息"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>图标</Label>
            <IconSelect
              value={settings.icon}
              onChange={(value) => setSettings({ ...settings, icon: value })}
            />
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockSettingsEditor;
