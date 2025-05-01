
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CourseCardNew from './CourseCardNew';
import { motion } from 'framer-motion';
import { CourseNew } from '@/lib/types/course-new';

interface CourseSectionProps {
  title: string;
  subtitle: string;
  limit?: number;
  filterBy?: string;
  filterValue?: string;
}

const CourseSection = ({
  title,
  subtitle,
  limit = 4,
  filterBy,
  filterValue,
}: CourseSectionProps) => {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['homepage-courses', filterBy, filterValue, limit],
    queryFn: async () => {
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
        return [];
      }
      
      return data as CourseNew[];
    }
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-20 bg-gray-50">
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
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-[380px] bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
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
              <motion.div 
                key={course.id} 
                variants={itemVariants}
              >
                <CourseCardNew course={course} variantIndex={index} />
              </motion.div>
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
