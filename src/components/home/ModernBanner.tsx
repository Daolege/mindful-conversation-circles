
import React from 'react';
import { motion } from 'framer-motion';

const ModernBanner = () => {
  return (
    <div className="h-[480px] relative overflow-hidden">
      {/* Wave shapes and background */}
      <div className="absolute inset-0 z-0">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-indigo-800 to-purple-900"></div>
        
        {/* Wavy curve overlay at bottom */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path d="M0,64 C288,89.3 576,96.5 864,85.7 C1152,74.8 1440,45.9 1440,32 L1440,120 L0,120 Z" 
                fill="white" fillOpacity="0.8"></path>
          <path d="M0,96 C288,107.3 576,104.5 864,87.7 C1152,70.8 1440,39.9 1440,32 L1440,120 L0,120 Z" 
                fill="white"></path>
        </svg>
        
        {/* Animated circles for decoration */}
        <div className="absolute top-1/4 left-1/5 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/30 to-indigo-500/20 blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/6 w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/10 blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/10 blur-xl animate-pulse" style={{ animationDuration: '6s' }}></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Main content */}
      <div className="container mx-auto h-full relative z-10 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center">
          {/* Text content */}
          <motion.div 
            className="text-white space-y-6 pt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="inline-block bg-gradient-to-r from-blue-400 to-cyan-400 text-white px-4 py-1 rounded-full text-sm font-medium mb-2"
            >
              专业认证课程
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              跨境电商精品课程
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-blue-100/90 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              掌握全球贸易技能，开启无限商机
            </motion.p>
            
            <div className="pt-4 flex flex-wrap gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl inline-flex items-center"
              >
                <div className="h-10 w-10 rounded-full bg-blue-500/30 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-white/70">学员总数</div>
                  <div className="text-lg font-bold">10,000+</div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl inline-flex items-center"
              >
                <div className="h-10 w-10 rounded-full bg-purple-500/30 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-white/70">视频课程数</div>
                  <div className="text-lg font-bold">50+</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Image content with perspective effect */}
          <div className="hidden md:block relative h-full">
            <motion.div 
              className="absolute inset-0 flex items-center justify-center perspective-1000"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <motion.div
                className="relative"
                whileHover={{ rotateY: 5, rotateX: -5, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg blur opacity-40"></div>
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1772&q=80" 
                  alt="跨境电商" 
                  className="w-5/6 h-5/6 object-cover rounded-lg shadow-2xl border border-white/10 relative z-10"
                />
                <motion.div 
                  className="absolute -bottom-4 -right-4 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-xl"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <div className="text-white font-bold">精选课程</div>
                  <div className="text-sm text-white/70">自由学习，随时掌握</div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernBanner;
