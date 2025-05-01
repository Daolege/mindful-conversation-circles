
import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const HeroBanner = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative h-[600px] overflow-hidden">
      {/* High-quality background image with overlay gradient */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
          alt="Modern workspace with laptop" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50"></div>
      </div>
      
      {/* Content container */}
      <div className="container mx-auto h-full relative z-10">
        <div className="h-full flex flex-col justify-center max-w-2xl pl-8 md:pl-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Clean, minimal heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              知识成就<span className="text-white/80">无限未来</span>
            </h1>
            
            {/* Elegant subheading */}
            <p className="text-xl text-gray-300 leading-relaxed">
              发现精选优质课程，从行业专家直接学习，随时随地提升自我价值。
            </p>
            
            {/* Clean button group */}
            <div className="pt-4 flex flex-wrap gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => navigate('/courses')}
                  className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg rounded-md"
                >
                  探索课程
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-md"
                >
                  立即注册
                </Button>
              </motion.div>
            </div>
            
            {/* Minimal stats display */}
            <div className="pt-8 border-t border-white/20 flex items-center space-x-8">
              <div className="flex items-center">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                    >
                      <img 
                        src={`https://randomuser.me/api/portraits/women/${18 + i}.jpg`} 
                        alt="Student" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="ml-4 text-white/80 text-sm">加入千万学员的行列</span>
              </div>
              
              <div className="hidden md:flex items-center">
                <span className="text-white font-bold">4.9</span>
                <span className="text-white/80 text-sm ml-1">学员平均评分</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
