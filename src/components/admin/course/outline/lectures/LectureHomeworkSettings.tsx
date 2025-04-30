
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface LectureHomeworkSettingsProps {
  lectureId: string;
  requiresHomeworkCompletion: boolean;
  onSettingChange: (requiresCompletion: boolean) => void;
  disabled?: boolean;
}

export const LectureHomeworkSettings: React.FC<LectureHomeworkSettingsProps> = ({
  lectureId,
  requiresHomeworkCompletion,
  onSettingChange,
  disabled = false
}: LectureHomeworkSettingsProps) => {
  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardContent className="p-3">
        <div className="flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">作业要求</Label>
            <p className="text-xs text-gray-500">
              开启后学员必须完成本课时作业才能继续学习
            </p>
          </div>
          <Switch
            checked={requiresHomeworkCompletion}
            onCheckedChange={onSettingChange}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
};
