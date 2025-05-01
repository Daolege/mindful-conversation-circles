
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CourseCardNew from './CourseCardNew';
import { motion } from 'framer-motion';
import { CourseNew } from '@/lib/types/course-new';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const { data: courses, isLoading } = useQuery({
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
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold mb-2 text-gray-900"
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(null).map((_, i) => (
              <div key={i} className="h-[250px] bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <ScrollArea className="w-full">
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="flex flex-nowrap gap-6 pb-4 min-w-full"
              style={{ width: 'max-content', paddingRight: '2rem' }}
            >
              {courses.map((course, index) => (
                <motion.div 
                  key={course.id} 
                  variants={item}
                  className="w-[320px] flex-shrink-0"
                >
                  <CourseCardNew course={course} variantIndex={index % 4} />
                </motion.div>
              ))}
            </motion.div>
          </ScrollArea>
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
