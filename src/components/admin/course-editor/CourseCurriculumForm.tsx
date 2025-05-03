
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface CourseCurriculumFormProps {
  courseId: number;
}

const CourseCurriculumForm: React.FC<CourseCurriculumFormProps> = ({ courseId }) => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load course sections when component mounts
    const loadCourseSections = async () => {
      try {
        setLoading(true);
        // This would typically fetch sections from a backend service
        // For now, we'll just set a placeholder message
        setSections([]);
      } catch (error) {
        console.error("Error loading course sections:", error);
        toast.error("加载课程大纲失败");
      } finally {
        setLoading(false);
      }
    };

    loadCourseSections();
  }, [courseId]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>课程大纲</CardTitle>
          <Button size="sm" className="h-8">
            <PlusCircle className="mr-2 h-4 w-4" />
            添加章节
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : sections.length > 0 ? (
            <div>
              {/* This is where the actual sections would be rendered */}
              <p>这里将显示课程章节列表</p>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <h3 className="text-lg font-medium text-gray-600 mb-2">还没有添加章节</h3>
              <p className="text-gray-500 mb-4">点击"添加章节"按钮开始创建课程大纲</p>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                添加第一个章节
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseCurriculumForm;
