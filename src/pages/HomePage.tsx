
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ModernBanner from "@/components/home/ModernBanner";
import CourseSection from "@/components/home/CourseSection";
import { motion } from "framer-motion";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow">
        <ModernBanner />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* 热门课程模块 */}
          <CourseSection 
            title="精选热门课程" 
            subtitle="发现最受欢迎的优质课程，快速提升核心技能" 
          />
          
          {/* 入门课程模块 */}
          <CourseSection 
            title="零基础入门课程" 
            subtitle="专为初学者设计的系统化学习内容" 
            filterBy="category"
            filterValue="beginner"
          />
          
          {/* 高级课程模块 */}
          <CourseSection 
            title="进阶实战课程" 
            subtitle="深度学习与高级案例分析，提升专业水平" 
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
