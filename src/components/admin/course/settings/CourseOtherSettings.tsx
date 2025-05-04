
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CourseHighlightsList } from './CourseHighlightsList';
import { BlockSettingsEditor } from './BlockSettingsEditor';
import EnrollmentGuidesEditor from './EnrollmentGuidesEditor';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

interface CourseOtherSettingsProps {
  courseId: number;
}

export const CourseOtherSettings: React.FC<CourseOtherSettingsProps> = ({
  courseId,
}) => {
  const [activeTab, setActiveTab] = useState('highlights');
  const [highlightsRefresh, setHighlightsRefresh] = useState(0);
  
  const handleSaveSuccess = () => {
    toast.success("保存成功");
    setHighlightsRefresh(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="highlights">课程亮点</TabsTrigger>
          <TabsTrigger value="enrollment">报名后引导</TabsTrigger>
          <TabsTrigger value="modules">模块设置</TabsTrigger>
        </TabsList>
        
        <TabsContent value="highlights">
          <div className="grid md:grid-cols-2 gap-6">
            <CourseHighlightsList 
              courseId={courseId} 
              key={`highlights-${highlightsRefresh}`}
              onSaveSuccess={handleSaveSuccess}
            />

            <BlockSettingsEditor 
              courseId={courseId} 
              sectionType="highlight"
              key={`block-settings-${highlightsRefresh}`}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="enrollment">
          <div className="grid md:grid-cols-2 gap-6">
            <EnrollmentGuidesEditor courseId={courseId} />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">报名后引导页面预览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-slate-50 rounded-md p-4 h-[400px] overflow-auto border">
                  <div className="text-center py-12">
                    <p className="text-slate-500">完成设置后，学生购买课程将看到您设置的社群引导信息</p>
                    <p className="text-slate-400 text-sm mt-2">您添加的社交媒体引导信息将显示在此处</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="modules">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <BlockSettingsEditor 
                courseId={courseId} 
                sectionType="learning-objective"
                title="学习目标模块设置"
              />
            </div>
            <div>
              <BlockSettingsEditor 
                courseId={courseId} 
                sectionType="requirement"
                title="学习要求模块设置"
              />
            </div>
            <div>
              <BlockSettingsEditor 
                courseId={courseId} 
                sectionType="audience"
                title="适合人群模块设置"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseOtherSettings;
