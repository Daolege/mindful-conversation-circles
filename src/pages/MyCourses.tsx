
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/authHooks";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Navigate } from "react-router-dom";
import { transformCourseData } from "@/lib/types/course";
import { handleSupabaseQueryError } from "@/lib/supabaseUtils";

const MyCourses = () => {
  const { user, loading } = useAuth();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['my-courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_courses')
        .select(`
          course_id,
          courses (*)
        `)
        .eq('user_id', user.id);

      const processedData = handleSupabaseQueryError(data, error, []);
      
      // Transform the course data to normalize field names
      return processedData?.map(item => transformCourseData(item.courses)) || [];
    },
    enabled: !!user
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">我的课程</h1>
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : courses?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">您还没有购买任何课程</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyCourses;
