
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ModernBanner from "@/components/home/ModernBanner";
import CourseSection from "@/components/home/CourseSection";
import { motion } from "framer-motion";
import { DatabaseFixInitializer } from '@/components/course/DatabaseFixInitializer';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow">
        {/* Database initialization for fixing homework issues */}
        <DatabaseFixInitializer />
        
        {/* 现代化Banner */}
        <ModernBanner />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* 热门课程模块 */}
          <CourseSection 
            title="精选热门课程" 
            subtitle="发现跨境电商领域最受欢迎的优质课程，快速掌握全球贸易技能" 
          />
          
          {/* 入门课程模块 */}
          <CourseSection 
            title="跨境电商入门课程" 
            subtitle="专为初学者设计的跨境电商系统化学习内容" 
            filterBy="category"
            filterValue="beginner"
          />
          
          {/* 高级课程模块 */}
          <CourseSection 
            title="跨境电商实战课程" 
            subtitle="深度学习与高级案例分析，成为跨境贸易专家" 
            filterBy="category"
            filterValue="advanced"
          />
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;
