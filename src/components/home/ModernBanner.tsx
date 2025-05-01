
import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ModernBanner = () => {
  const navigate = useNavigate();
  const bannerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [bannerRect, setBannerRect] = useState({ width: 0, height: 0 });
  
  // Mouse tracking for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Transform values for 3D effect
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);
  
  // Background animations
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const backgrounds = [
    "bg-gradient-to-br from-indigo-900 via-blue-800 to-blue-900",
    "bg-gradient-to-br from-blue-900 via-violet-800 to-indigo-900",
    "bg-gradient-to-br from-violet-900 via-indigo-800 to-blue-900"
  ];
  
  useEffect(() => {
    // Update banner dimensions on resize
    const updateBannerRect = () => {
      if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        setBannerRect({ width: rect.width, height: rect.height });
      }
    };
    
    // Initialize dimensions
    updateBannerRect();
    window.addEventListener('resize', updateBannerRect);
    
    // Mouse move handler for 3D effect
    const handleMouseMove = (e: MouseEvent) => {
      if (bannerRef.current) {
        const rect = bannerRef.current.getBoundingClientRect();
        
        // Calculate relative position from -0.5 to 0.5
        const relativeX = ((e.clientX - rect.left) / rect.width) - 0.5;
        const relativeY = ((e.clientY - rect.top) / rect.height) - 0.5;
        
        mouseX.set(relativeX);
        mouseY.set(relativeY);
        
        // Update mouse position for other elements
        setMousePosition({ x: relativeX, y: relativeY });
      }
    };
    
    // Add mouse event listener
    if (bannerRef.current) {
      bannerRef.current.addEventListener('mousemove', handleMouseMove);
    }
    
    // Background rotation timer
    const bgInterval = setInterval(() => {
      setCurrentBgIndex(prev => (prev + 1) % backgrounds.length);
    }, 5000);
    
    return () => {
      window.removeEventListener('resize', updateBannerRect);
      if (bannerRef.current) {
        bannerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      clearInterval(bgInterval);
    };
  }, [mouseX, mouseY]);
  
  return (
    <div 
      ref={bannerRef}
      className={`relative overflow-hidden ${backgrounds[currentBgIndex]} transition-colors duration-2000 h-[270px]`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-600/20 blur-[80px]"
          animate={{
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-indigo-500/20 blur-[70px]"
          animate={{
            x: [0, -10, 0],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.5
          }}
        />
      </div>
      
      {/* Main content with separate animation for text and image */}
      <div className="container mx-auto h-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center">
          {/* Text content - static, not affected by mouse movement */}
          <div className="text-white space-y-2 md:space-y-4">
            <motion.h1 
              className="text-2xl md:text-3xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              跨境电商精品课程
            </motion.h1>
            
            <motion.p 
              className="text-sm md:text-base text-blue-100 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              掌握全球贸易技能，开启无限商机
            </motion.p>

            <motion.div 
              className="pt-4 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button 
                onClick={() => navigate('/courses-new')}
                className="bg-white text-blue-900 hover:bg-blue-50"
              >
                立即探索
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </motion.div>
          </div>

          {/* 3D interactive image with perspective effect */}
          <div className="hidden md:block relative h-[200px]">
            <motion.div
              className="relative h-full w-full perspective-1000"
              style={{
                rotateX: rotateX,
                rotateY: rotateY,
                transformStyle: "preserve-3d"
              }}
            >
              <div className="absolute inset-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl" style={{ transform: "translateZ(20px)" }}>
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1772&q=80" 
                  alt="跨境电商" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              
              {/* Floating elements with different transformation values */}
              <motion.div 
                className="absolute top-4 right-4 bg-white/90 p-2 rounded shadow-lg text-sm text-blue-900 font-medium"
                style={{ transform: `translateZ(40px) translateX(${mousePosition.x * -20}px) translateY(${mousePosition.y * -20}px)` }}
              >
                全球物流解决方案
              </motion.div>
              
              <motion.div 
                className="absolute bottom-4 left-4 bg-white/90 p-2 rounded shadow-lg text-sm text-blue-900 font-medium"
                style={{ transform: `translateZ(40px) translateX(${mousePosition.x * -15}px) translateY(${mousePosition.y * -15}px)` }}
              >
                全球市场分析
              </motion.div>
              
              <motion.div 
                className="absolute top-1/2 left-1/4 bg-white/90 p-2 rounded-full shadow-lg"
                style={{ transform: `translateZ(30px) translateX(${mousePosition.x * -25}px) translateY(${mousePosition.y * -25}px)` }}
              >
                <span className="text-xs font-bold text-blue-900">跨境支付</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernBanner;
