
import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const HeroBanner = () => {
  const navigate = useNavigate();
  
  return (
    <div className="relative overflow-hidden bg-gray-900 text-white">
      {/* 背景动态效果 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
        
        {/* 动态图形元素 */}
        <motion.div 
          className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full opacity-20 bg-gradient-to-r from-gray-600 to-gray-700"
          animate={{ 
            scale: [1, 1.2, 1], 
            rotate: [0, 10, 0],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        <motion.div 
          className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[70%] rounded-full opacity-15 bg-gradient-to-tr from-gray-700 to-gray-800"
          animate={{ 
            scale: [1, 1.3, 1], 
            rotate: [0, -10, 0],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ 
            duration: 18, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        <motion.div 
          className="absolute top-[40%] right-[30%] w-[15%] h-[30%] rounded-full opacity-10 bg-gradient-to-l from-gray-500 to-gray-600"
          animate={{ 
            scale: [1, 1.4, 1], 
            y: [0, -20, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* 网格装饰 */}
        <div className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>
      
      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
              开启您的跨境电商创业之旅
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              无需丰富经验，零门槛进入全球市场。利用碎片时间，拓展收入来源，实现财务自由。
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="lg" 
                  onClick={() => navigate('/courses')}
                  className="bg-white text-gray-900 hover:bg-gray-100 font-medium px-6 py-3 rounded-md"
                >
                  浏览全部课程
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="border border-white text-white hover:bg-white/10 font-medium px-6 py-3 rounded-md"
                >
                  立即注册
                </Button>
              </motion.div>
            </div>
          </motion.div>
          
          {/* 关键优势 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
          >
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">灵活时间</h3>
              <p className="text-gray-400">兼职副业首选，自由安排工作时间</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">全球市场</h3>
              <p className="text-gray-400">接触国际客户，拓展全球商机</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-2">低投入高回报</h3>
              <p className="text-gray-400">小资金起步，掌握正确方法获得稳定收益</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
