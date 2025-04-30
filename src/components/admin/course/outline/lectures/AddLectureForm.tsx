
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface AddLectureFormProps {
  onCancel: () => void;
  onLectureAdded: (title: string, isFree: boolean) => Promise<boolean>;
}

export const AddLectureForm: React.FC<AddLectureFormProps> = ({
  onCancel,
  onLectureAdded
}) => {
  const [title, setTitle] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    try {
      setIsSubmitting(true);
      const success = await onLectureAdded(title.trim(), isFree);
      
      // 如果添加成功，清空表单以便继续添加
      if (success) {
        setTitle('');
        // 保持isFree状态不变，方便用户连续添加同类型的课时
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50 mb-4">
      <div className="text-sm font-medium mb-3">添加新课时</div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="lecture-title">课时标题</Label>
          <Input
            id="lecture-title"
            placeholder="输入课时标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            autoFocus
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="lecture-free"
            checked={isFree}
            onCheckedChange={setIsFree}
            disabled={isSubmitting}
          />
          <Label htmlFor="lecture-free">免费课时</Label>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <Button 
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
          
          <Button 
            type="submit"
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                添加中...
              </>
            ) : (
              '添加课时'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
