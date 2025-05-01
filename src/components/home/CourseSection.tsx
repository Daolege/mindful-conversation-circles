
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import HomePageCourseCard from './HomePageCourseCard';

interface CourseSectionProps {
  title: string;
  subtitle: string;
  limit?: number;
  filterBy?: string;
  filterValue?: string;
}

const CourseSection: React.FC<CourseSectionProps> = ({
  title,
  subtitle,
  limit = 4,
  filterBy,
  filterValue,
}) => {
  const fetchCourses = async () => {
    try {
      let query = supabase
        .from('courses_new')
        .select('*')
        .eq('status', 'published')
        .order('display_order', { ascending: true });
      
      if (filterBy && filterValue) {
        query = query.eq(filterBy, filterValue);
      }
      
      const { data, error } = await query.limit(limit);
      
      if (error) {
        console.error('Error fetching courses:', error);
        toast.error('加载课程信息失败');
        return [];
      }
      
      if (!data || data.length === 0) {
        console.log('No published courses found');
        return [];
      }
      
      return data;
    } catch (e) {
      console.error('Exception in fetchCourses:', e);
      toast.error('加载课程信息失败');
      return [];
    }
  };

  // Use the query with explicit typing
  const { data: courses = [], isLoading, isError } = useQuery({
    queryKey: ['homepage-courses', filterBy, filterValue, limit],
    queryFn: fetchCourses
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-3 text-gray-900">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array(limit).fill(0).map((_, i) => (
              <div key={i} className="h-[300px] bg-gray-200 animate-pulse rounded-lg">
                <div className="h-48 bg-gray-300 animate-pulse rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-300 animate-pulse rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 animate-pulse rounded w-1/2"></div>
                  <div className="h-4 bg-gray-300 animate-pulse rounded w-2/3"></div>
                  <div className="h-10 bg-gray-300 animate-pulse rounded mt-6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <p className="text-red-500">加载课程失败，请刷新页面重试</p>
          </div>
        ) : courses.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {courses.map((course, index) => (
              <HomePageCourseCard 
                key={course.id} 
                course={course}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-gray-100/50 rounded-lg">
            <p className="text-gray-500">暂无课程</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CourseSection;
