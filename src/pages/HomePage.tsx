
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import CourseSection from "@/components/home/CourseSection";
import { motion } from "framer-motion";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <HeroBanner />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* 热门课程模块 */}
          <CourseSection 
            title="热门跨境电商课程" 
            subtitle="精选适合各层次学员的高质量课程，助您轻松入行" 
          />
          
          {/* 入门课程模块 */}
          <CourseSection 
            title="跨境电商入门精选" 
            subtitle="零基础起步，掌握跨境电商核心技能" 
            filterBy="category"
            filterValue="beginner"
          />
          
          {/* 高级课程模块 */}
          <CourseSection 
            title="进阶实战课程" 
            subtitle="深入电商运营与营销策略，提升业务增长" 
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
