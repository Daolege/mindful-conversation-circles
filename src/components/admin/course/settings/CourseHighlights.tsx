
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, PlusCircle, RefreshCw, GripVertical, MoveUp, MoveDown } from "lucide-react";
import { toast } from "sonner";
import IconSelect from './IconSelect';
import { CourseHighlight, getCourseHighlights, addCourseHighlight, updateCourseHighlight, deleteCourseHighlight, resetCourseHighlights, reorderCourseHighlights } from "@/lib/services/courseHighlightsService";

interface CourseHighlightsProps {
  courseId: number;
}

export function CourseHighlights({ courseId }: CourseHighlightsProps) {
  const [highlights, setHighlights] = useState<CourseHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // 加载课程亮点
  useEffect(() => {
    loadHighlights();
  }, [courseId]);

  const loadHighlights = async () => {
    if (!courseId) return;
    
    setIsLoading(true);
    try {
      const data = await getCourseHighlights(courseId);
      setHighlights(data);
    } catch (error) {
      console.error("加载课程亮点失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加亮点
  const handleAddHighlight = async () => {
    try {
      const position = highlights.length > 0 
        ? Math.max(...highlights.map(h => h.position)) + 1 
        : 0;
        
      const newHighlight = await addCourseHighlight(courseId, {
        content: "",
        icon: "check",
        position,
        is_visible: true
      });
      
      if (newHighlight) {
        setHighlights(prev => [...prev, newHighlight]);
        toast.success("亮点已添加");
      }
    } catch (error) {
      console.error("添加亮点失败:", error);
      toast.error("添加亮点失败");
    }
  };

  // 更新亮点
  const handleUpdateHighlight = async (updatedHighlight: CourseHighlight) => {
    try {
      const success = await updateCourseHighlight(updatedHighlight);
      
      if (success) {
        setHighlights(prev => 
          prev.map(h => h.id === updatedHighlight.id ? updatedHighlight : h)
        );
      }
    } catch (error) {
      console.error("更新亮点失败:", error);
      toast.error("更新亮点失败");
    }
  };

  // 删除亮点
  const handleDeleteHighlight = async (id: string) => {
    try {
      const success = await deleteCourseHighlight(id);
      
      if (success) {
        setHighlights(prev => prev.filter(h => h.id !== id));
        toast.success("亮点已删除");
      }
    } catch (error) {
      console.error("删除亮点失败:", error);
      toast.error("删除亮点失败");
    }
  };

  // 重置亮点
  const handleResetHighlights = async () => {
    if (!confirm("确定要重置所有亮点到默认值吗？此操作不可撤销。")) {
      return;
    }
    
    setIsResetting(true);
    try {
      const success = await resetCourseHighlights(courseId);
      
      if (success) {
        await loadHighlights();
        toast.success("亮点已重置为默认值");
      }
    } catch (error) {
      console.error("重置亮点失败:", error);
      toast.error("重置亮点失败");
    } finally {
      setIsResetting(false);
    }
  };

  // 移动亮点
  const handleMoveHighlight = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === highlights.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newHighlights = [...highlights];
    
    // 交换位置
    [newHighlights[index], newHighlights[newIndex]] = [newHighlights[newIndex], newHighlights[index]];
    
    // 更新position值
    const updatedHighlights = newHighlights.map((h, i) => ({
      ...h,
      position: i
    }));
    
    setHighlights(updatedHighlights);
    
    // 保存到数据库
    try {
      await reorderCourseHighlights(updatedHighlights.map(h => ({
        id: h.id,
        position: h.position
      })));
    } catch (error) {
      console.error("重排亮点失败:", error);
      toast.error("重排亮点失败");
      // 出错时重新加载
      loadHighlights();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">课程亮点</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : highlights.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500">暂无亮点，点击下方按钮添加</p>
            </div>
          ) : (
            highlights.map((highlight, index) => (
              <div key={highlight.id} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">亮点 {index + 1}</span>
                    <Switch 
                      checked={highlight.is_visible}
                      onCheckedChange={(checked) => {
                        handleUpdateHighlight({
                          ...highlight,
                          is_visible: checked
                        });
                      }}
                    />
                    <span className="text-xs text-gray-500 ml-2">
                      {highlight.is_visible ? '可见' : '隐藏'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveHighlight(index, 'up')}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMoveHighlight(index, 'down')}
                      disabled={index === highlights.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteHighlight(highlight.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-1">
                    <Label htmlFor={`icon-${highlight.id}`}>图标</Label>
                    <IconSelect
                      selected={highlight.icon}
                      onSelect={(icon) => {
                        handleUpdateHighlight({
                          ...highlight,
                          icon
                        });
                      }}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Label htmlFor={`content-${highlight.id}`}>内容</Label>
                    <Input
                      id={`content-${highlight.id}`}
                      value={highlight.content}
                      onChange={(e) => {
                        handleUpdateHighlight({
                          ...highlight,
                          content: e.target.value
                        });
                      }}
                      className="w-full"
                      placeholder="请输入亮点内容"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleAddHighlight}
          disabled={isLoading}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          添加亮点
        </Button>
        <Button
          variant="outline"
          onClick={handleResetHighlights}
          disabled={isResetting || isLoading}
          className="text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300 hover:bg-amber-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
          重置为默认亮点
        </Button>
      </CardFooter>
    </Card>
  );
}
