
import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { useTheme } from '@/hooks/use-theme';

// Banner images - feel free to replace with your own
const bannerImages = [
  'https://images.unsplash.com/photo-1581092160562-40aa08e78252?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
  'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1772&q=80',
];

const ModernBanner = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smoother motion with springs
  const springConfig = { damping: 25, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Auto-switching for carousel
  const [activeIndex, setActiveIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });

  useEffect(() => {
    // Auto-switch slides every 5 seconds
    const interval = setInterval(() => {
      if (emblaApi) {
        emblaApi.scrollNext();
        const index = emblaApi.selectedScrollSnap();
        setActiveIndex(index);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [emblaApi]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        
        // Calculate mouse position relative to container
        const relativeX = e.clientX - left;
        const relativeY = e.clientY - top;
        
        // Convert to normalized coordinates (-1 to 1)
        const normalizedX = (relativeX / width) * 2 - 1;
        const normalizedY = (relativeY / height) * 2 - 1;
        
        mouseX.set(normalizedX);
        mouseY.set(normalizedY);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Transform values for parallax effect - ONLY for images
  const xTransform = useTransform(smoothMouseX, [-1, 1], [-20, 20]);
  const yTransform = useTransform(smoothMouseY, [-1, 1], [-20, 20]);
  const rotateTransform = useTransform(smoothMouseX, [-1, 1], [-2, 2]);
  const scaleTransform = useTransform(smoothMouseY, [-1, 1], [0.98, 1.02]);

  // These are NOT affected by mouse movements - fixed positions for text
  const shape1X = useTransform(smoothMouseX, [-1, 1], [-15, 15]);
  const shape1Y = useTransform(smoothMouseY, [-1, 1], [-10, 10]);
  const shape2X = useTransform(smoothMouseX, [-1, 1], [-25, 25]);
  const shape2Y = useTransform(smoothMouseY, [-1, 1], [-15, 15]);

  return (
    <div 
      ref={containerRef} 
      className="relative overflow-hidden w-full h-[400px]"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-knowledge-dark via-knowledge-primary to-gray-800"></div>

      {/* Animated shapes */}
      <motion.div
        className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-knowledge-primary opacity-20 blur-3xl"
        style={{ x: shape1X, y: shape1Y }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <motion.div
        className="absolute bottom-10 right-1/4 w-48 h-48 rounded-full bg-blue-500 opacity-10 blur-3xl"
        style={{ x: shape2X, y: shape2Y }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.5
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 container mx-auto h-full flex items-center px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
          {/* Text content - NOT affected by mouse movement */}
          <div className="text-white space-y-4 md:space-y-6">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              开启<span className="text-gray-300">跨境电商</span>
              <br />
              <span className="text-gray-300">全球</span>商机
            </motion.h1>
            
            <motion.p 
              className="text-lg text-gray-300 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              突破地域限制，接触全球买家，掌握跨境电商核心技能，拓展无限商机
            </motion.p>

            <motion.p 
              className="text-md text-gray-300 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              我们的专业课程助您从零起步，轻松进入全球市场
            </motion.p>
          </div>

          {/* Image carousel - WITH mouse interaction effects */}
          <motion.div
            className="relative hidden md:block h-[350px] w-full"
            style={{ 
              x: xTransform, 
              y: yTransform,
              rotateY: rotateTransform,
              scale: scaleTransform 
            }}
          >
            <Carousel ref={emblaRef} className="w-full h-full">
              <CarouselContent>
                {bannerImages.map((image, index) => (
                  <CarouselItem key={index} className="h-full">
                    <motion.div 
                      className="relative h-full w-full overflow-hidden rounded-xl border border-white/10"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img 
                        src={image} 
                        alt={`Banner image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Carousel indicators */}
            <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeIndex === index ? "bg-white w-6" : "bg-white/40"
                  }`}
                  onClick={() => {
                    if (emblaApi) {
                      emblaApi.scrollTo(index);
                      setActiveIndex(index);
                    }
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ModernBanner;
