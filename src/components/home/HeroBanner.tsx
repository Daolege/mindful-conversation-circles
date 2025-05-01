
import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const HeroBanner = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative h-[600px] bg-black overflow-hidden">
      {/* Hero background image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 h-full relative z-10 flex items-center">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              解锁全球商机<br />
              <span className="text-gray-300">掌握跨境电商技能</span>
            </h1>
            
            <p className="text-lg text-gray-300 mb-8">
              无需丰富经验，零门槛进入全球市场。
              专业导师带你拓展收入来源，实现财务自由。
            </p>
            
            <div className="flex space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => navigate('/courses')}
                  className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg"
                >
                  探索课程
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
                >
                  立即注册
                </Button>
              </motion.div>
            </div>
            
            <div className="flex items-center mt-12 text-gray-400">
              <div className="flex -space-x-2 mr-4">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className="w-8 h-8 rounded-full border border-white overflow-hidden"
                  >
                    <img 
                      src={`https://randomuser.me/api/portraits/men/${18 + i}.jpg`} 
                      alt="Student avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span>已有 <span className="text-white">1,000+</span> 位学员加入</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
