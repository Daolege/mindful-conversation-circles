
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const ModernBanner = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const bannerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!bannerRef.current) return;
      
      const { left, top, width, height } = bannerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      setMousePosition({ x, y });
    };
    
    const banner = bannerRef.current;
    if (banner) {
      banner.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (banner) {
        banner.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div ref={bannerRef} className="h-[640px] relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900"></div>
        
        {/* Abstract shapes for decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <svg className="absolute top-0 opacity-10" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <path d="M435.7,312.5 C543.9,368.2 668.2,470.3 665.5,539.1 C662.9,607.9 533.2,643.4 426.7,673.6 C320.2,703.8 236.9,728.8 158.3,681.3 C79.7,633.9 5.9,514.1 0.7,393 C-4.4,271.9 58.8,149.4 143.4,108.9 C227.9,68.4 333.9,110 435.7,312.5 Z" fill="url(#paint0_radial)" fillOpacity="0.4" />
            <defs>
              <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(400 400) rotate(90) scale(300)">
                <stop stopColor="white" stopOpacity="0.5" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
          
          <svg className="absolute bottom-0 right-0 opacity-10 transform rotate-180" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <path d="M435.7,312.5 C543.9,368.2 668.2,470.3 665.5,539.1 C662.9,607.9 533.2,643.4 426.7,673.6 C320.2,703.8 236.9,728.8 158.3,681.3 C79.7,633.9 5.9,514.1 0.7,393 C-4.4,271.9 58.8,149.4 143.4,108.9 C227.9,68.4 333.9,110 435.7,312.5 Z" fill="url(#paint1_radial)" fillOpacity="0.4" />
            <defs>
              <radialGradient id="paint1_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(400 400) rotate(90) scale(300)">
                <stop stopColor="white" stopOpacity="0.5" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
        
        {/* Animated circles for background effects */}
        <div className="absolute top-1/4 left-1/5 w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/6 w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/10 blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/5 blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
      </div>
      
      {/* Wave shapes at top and bottom */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 140" fill="none" preserveAspectRatio="none">
          <path d="M0,64 C288,110 576,30 864,70 C1152,110 1440,40 1440,80 L1440,0 L0,0 Z" 
                fill="white" fillOpacity="0.05"></path>
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 180" fill="none" preserveAspectRatio="none">
          <path d="M0,120 C288,80 576,160 864,130 C1152,100 1440,160 1440,140 L1440,180 L0,180 Z" 
                fill="white" fillOpacity="1"></path>
          <path d="M0,140 C288,100 576,180 864,150 C1152,120 1440,180 1440,160 L1440,180 L0,180 Z" 
                fill="white"></path>
        </svg>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Border decorations */}
      <div className="absolute left-0 top-1/4 w-20 h-40">
        <div className="w-full h-full bg-white/5 backdrop-blur-sm rounded-r-full"></div>
      </div>
      <div className="absolute right-0 bottom-1/3 w-12 h-32">
        <div className="w-full h-full bg-white/5 backdrop-blur-sm rounded-l-full"></div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto h-full relative z-10 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center">
          {/* Text content */}
          <motion.div 
            className="text-white space-y-8 pt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              开启您的<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">跨境电商之旅</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-blue-100/90 max-w-lg leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              打破地域限制，链接全球商机
              <br />从零基础到专业卖家的进阶之路
            </motion.p>
            
            <motion.p
              className="text-lg text-blue-200/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              专业导师一对一指导，系统化学习，快速掌握跨境电商核心技能
            </motion.p>
          </motion.div>

          {/* Image content with 3D effect */}
          <div className="hidden md:flex items-center justify-center h-full perspective-1000">
            <motion.div 
              className="relative w-4/5 h-4/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              style={{
                transform: `rotateY(${mousePosition.x * 20}deg) rotateX(${-mousePosition.y * 20}deg)`,
                transition: 'transform 0.1s ease'
              }}
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-purple-600 rounded-xl blur opacity-30"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg"></div>
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1772&q=80" 
                alt="跨境电商" 
                className="relative w-full h-full object-cover rounded-lg shadow-2xl border border-white/10 z-10"
              />
              
              {/* Decorative elements */}
              <div className="absolute bottom-10 left-0 transform -translate-x-1/4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full backdrop-blur-md z-10 border border-white/20"></div>
              <div className="absolute top-5 right-5 transform w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full backdrop-blur-md z-10 border border-white/20"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernBanner;
