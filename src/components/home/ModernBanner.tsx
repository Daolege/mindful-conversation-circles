
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const ModernBanner = () => {
  // Mouse position tracking for 3D effects
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

  // Text animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.8,
        ease: [0.215, 0.61, 0.355, 1]
      }
    })
  };

  return (
    <div 
      ref={bannerRef} 
      className="relative h-[680px] overflow-hidden perspective-1000"
      style={{ perspective: '1000px' }}
    >
      {/* 3D Space Container */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: `rotateY(${mousePosition.x * 4}deg) rotateX(${-mousePosition.y * 2}deg)`
        }}
      >
        {/* Background Deep Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900"></div>
          
          {/* 3D Floating Background Elements */}
          <div 
            className="absolute left-0 top-0 w-full h-full"
            style={{ transform: `translateZ(-50px)` }}
          >
            <div className="absolute top-1/4 left-1/5 w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/10 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/5 w-96 h-96 rounded-full bg-gradient-to-r from-indigo-500/20 to-cyan-500/10 blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
          </div>
          
          {/* Middle Layer Elements */}
          <div 
            className="absolute left-0 top-0 w-full h-full"
            style={{ transform: `translateZ(-20px)` }}
          >
            <div className="absolute top-1/3 right-1/4 w-60 h-60 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/10 blur-2xl animate-pulse" style={{ animationDuration: '7s' }}></div>
          </div>
        </div>

        {/* 3D Ribbon Elements */}
        <div className="absolute inset-0 z-10">
          {/* Top Ribbon */}
          <svg className="absolute top-0 left-0 w-full h-40 overflow-visible" viewBox="0 0 1440 140" preserveAspectRatio="none">
            <motion.path 
              d="M0,50 C150,100 350,0 600,50 C800,90 1000,20 1200,40 C1320,50 1380,30 1440,20 L1440,0 L0,0 Z"
              fill="url(#ribbonGradient1)"
              fillOpacity="0.6"
              style={{ 
                filter: 'drop-shadow(0 10px 15px rgba(59, 130, 246, 0.3))',
                transform: `translateZ(20px) translateY(${mousePosition.y * -15}px)`
              }}
              animate={{
                d: [
                  "M0,50 C150,100 350,0 600,50 C800,90 1000,20 1200,40 C1320,50 1380,30 1440,20 L1440,0 L0,0 Z",
                  "M0,40 C150,70 350,20 600,40 C800,70 1000,30 1200,50 C1320,40 1380,20 1440,10 L1440,0 L0,0 Z",
                  "M0,50 C150,100 350,0 600,50 C800,90 1000,20 1200,40 C1320,50 1380,30 1440,20 L1440,0 L0,0 Z"
                ],
                transition: {
                  duration: 15,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
            />
            <defs>
              <linearGradient id="ribbonGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.7" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Middle Ribbon */}
          <svg className="absolute top-1/3 left-0 w-full h-40 overflow-visible" viewBox="0 0 1440 140" preserveAspectRatio="none">
            <motion.path 
              d="M1440,120 C1280,80 1100,140 900,100 C700,60 500,140 300,100 C200,80 100,120 0,100 L0,140 L1440,140 Z"
              fill="url(#ribbonGradient2)"
              fillOpacity="0.6"
              style={{ 
                filter: 'drop-shadow(0 -10px 15px rgba(124, 58, 237, 0.3))',
                transform: `translateZ(30px) translateY(${mousePosition.y * 20}px) translateX(${mousePosition.x * -20}px)`
              }}
              animate={{
                d: [
                  "M1440,120 C1280,80 1100,140 900,100 C700,60 500,140 300,100 C200,80 100,120 0,100 L0,140 L1440,140 Z",
                  "M1440,100 C1280,120 1100,90 900,110 C700,90 500,110 300,90 C200,100 100,90 0,110 L0,140 L1440,140 Z",
                  "M1440,120 C1280,80 1100,140 900,100 C700,60 500,140 300,100 C200,80 100,120 0,100 L0,140 L1440,140 Z"
                ],
                transition: {
                  duration: 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
            />
            <defs>
              <linearGradient id="ribbonGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EC4899" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.7" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Bottom Ribbon */}
          <svg className="absolute bottom-0 left-0 w-full h-72 overflow-visible" viewBox="0 0 1440 180" preserveAspectRatio="none">
            <motion.path 
              d="M0,120 C150,80 300,140 500,110 C700,80 900,140 1100,110 C1300,80 1380,120 1440,100 L1440,180 L0,180 Z"
              fill="url(#ribbonGradient3)"
              style={{ transform: `translateZ(10px) translateY(${mousePosition.y * -10}px)` }}
              animate={{
                d: [
                  "M0,120 C150,80 300,140 500,110 C700,80 900,140 1100,110 C1300,80 1380,120 1440,100 L1440,180 L0,180 Z",
                  "M0,140 C150,100 300,120 500,130 C700,100 900,120 1100,90 C1300,120 1380,100 1440,120 L1440,180 L0,180 Z",
                  "M0,120 C150,80 300,140 500,110 C700,80 900,140 1100,110 C1300,80 1380,120 1440,100 L1440,180 L0,180 Z"
                ],
                transition: {
                  duration: 18,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
            />
            <motion.path 
              d="M0,140 C150,100 300,160 500,130 C700,100 900,160 1100,130 C1300,100 1380,140 1440,120 L1440,180 L0,180 Z"
              fill="white"
              animate={{
                d: [
                  "M0,140 C150,100 300,160 500,130 C700,100 900,160 1100,130 C1300,100 1380,140 1440,120 L1440,180 L0,180 Z",
                  "M0,150 C150,120 300,140 500,150 C700,130 900,140 1100,110 C1300,140 1380,120 1440,140 L1440,180 L0,180 Z",
                  "M0,140 C150,100 300,160 500,130 C700,100 900,160 1100,130 C1300,100 1380,140 1440,120 L1440,180 L0,180 Z"
                ],
                transition: {
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
            />
            <defs>
              <linearGradient id="ribbonGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#6366F1" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 z-20 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div 
            key={i}
            className="absolute bg-white/20 rounded-full"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Decorative geometric shapes */}
      <motion.div 
        className="absolute top-1/4 right-1/6 w-24 h-24 border-2 border-white/20 z-20"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: `rotateY(${mousePosition.x * 20}deg) rotateX(${-mousePosition.y * 20}deg)`
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div 
        className="absolute bottom-1/3 left-1/6 w-40 h-40 border-2 border-white/10 rounded-full z-20"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: `translateZ(40px) rotateY(${mousePosition.x * -30}deg) rotateX(${-mousePosition.y * -30}deg)`
        }}
      />
      
      {/* Main content */}
      <div className="container mx-auto h-full relative z-30 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full items-center">
          {/* Text content with sequential animations */}
          <div className="text-white space-y-8 pt-10">
            <motion.div
              custom={0}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="inline-block bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-sm font-medium">专业跨境电商平台</span>
              </span>
            </motion.div>
            
            <motion.h1 
              custom={1}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              开启您的<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200">跨境电商之旅</span>
            </motion.h1>
            
            <motion.p 
              custom={2}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="text-xl md:text-2xl text-blue-100/90 max-w-lg leading-relaxed"
            >
              打破地域限制，链接全球商机
              <br />从零基础到专业卖家的进阶之路
            </motion.p>
            
            <motion.div
              custom={3}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-4 pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="bg-white text-indigo-900 hover:bg-blue-50 px-8 py-6 text-lg rounded-md shadow-lg shadow-blue-900/20 font-medium"
                  asChild
                >
                  <Link to="/courses">
                    探索课程
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline" 
                  className="border-2 border-white/70 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-md backdrop-blur-sm"
                  asChild
                >
                  <Link to="/auth">
                    立即注册
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              custom={4}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="pt-8 flex items-center space-x-8 max-w-lg"
            >
              <div 
                className="flex items-center p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
                style={{ 
                  transform: `translateZ(20px) translateX(${mousePosition.x * 10}px) translateY(${mousePosition.y * 10}px)` 
                }}
              >
                <div className="flex -space-x-3 mr-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white/70 overflow-hidden">
                      <img 
                        src={`https://randomuser.me/api/portraits/women/${18 + i}.jpg`} 
                        alt="Student" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-white/80 text-sm">加入千万学员的行列</span>
              </div>
              
              <div 
                className="hidden md:flex items-center p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
                style={{ 
                  transform: `translateZ(20px) translateX(${mousePosition.x * -10}px) translateY(${mousePosition.y * -10}px)` 
                }}
              >
                <span className="text-white font-bold mr-2">4.9</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
                <span className="text-white/80 text-sm ml-1">学员平均评分</span>
              </div>
            </motion.div>
          </div>

          {/* 3D Image content */}
          <motion.div 
            className="hidden md:flex items-center justify-center h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div 
              className="relative w-4/5 h-4/5"
              style={{ 
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Glowing background effect */}
              <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur-2xl opacity-70"></div>
              
              {/* Main image with 3D transform */}
              <motion.div
                className="relative rounded-xl overflow-hidden border border-white/20 shadow-2xl"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: `translateZ(50px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)`,
                  transition: 'transform 0.2s ease-out'
                }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1772&q=80" 
                  alt="跨境电商" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-transparent to-transparent"></div>
                
                {/* Floating info cards */}
                <motion.div 
                  className="absolute -left-12 top-1/4 bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-xl border border-white/20"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: `translateZ(30px) rotateY(${mousePosition.x * -5}deg) rotateX(${-mousePosition.y * 5}deg)`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <div className="text-blue-900">
                      <p className="font-bold text-sm">全球销售</p>
                      <p className="text-xs text-blue-700">无边界商业</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute -right-12 bottom-1/4 bg-white/90 backdrop-blur-md p-4 rounded-lg shadow-xl border border-white/20"
                  style={{ 
                    transformStyle: 'preserve-3d',
                    transform: `translateZ(40px) rotateY(${mousePosition.x * -5}deg) rotateX(${-mousePosition.y * 5}deg)`,
                  }}
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="text-purple-900">
                      <p className="font-bold text-sm">专业课程</p>
                      <p className="text-xs text-purple-700">系统学习</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ModernBanner;
