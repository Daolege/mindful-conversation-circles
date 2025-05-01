
import React from 'react';
import { motion } from 'framer-motion';

const ModernBanner = () => {
  return (
    <div className="h-[360px] relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-violet-900">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-indigo-900/80 to-violet-900/90"></div>
        
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-600/20 blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto h-full relative z-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center">
          {/* Text content */}
          <div className="text-white space-y-4">
            <motion.h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              跨境电商精品课程
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-blue-100/90 max-w-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              掌握全球贸易技能，开启无限商机
            </motion.p>
          </div>

          {/* Image content */}
          <div className="hidden md:block relative h-full">
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1772&q=80" 
                alt="跨境电商" 
                className="w-5/6 h-5/6 object-cover rounded-lg shadow-2xl border border-white/10"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernBanner;
