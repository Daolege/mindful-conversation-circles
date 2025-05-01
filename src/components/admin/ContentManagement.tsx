
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { handleCoursesQueryError } from "@/lib/supabaseUtils";
import { useTranslations } from "@/hooks/useTranslations";

export const ContentManagement = () => {
  const { t } = useTranslations();
  
  const { data: courses, isLoading } = useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("id", { ascending: false });
      
      return handleCoursesQueryError(data, error);
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('admin:contentManagement')}</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course: any) => (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                <CardDescription>¥{course.price}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-gray-500 line-clamp-3">{course.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    window.open(`/courses/${course.id}`, '_blank');
                  }}
                >
                  {t('courses:viewCourse')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">{t('common:noContentFound')}</p>
        </div>
      )}
    </div>
  );
};
