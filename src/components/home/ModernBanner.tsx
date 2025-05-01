
import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import useEmblaCarousel from 'embla-carousel-react';

// Banner images - cross-border e-commerce focused images
const bannerImages = [
  'https://images.unsplash.com/photo-1612103198005-b238154f4590?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80',
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1772&q=80',
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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"></div>

      {/* Animated shapes */}
      <motion.div
        className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-blue-500 opacity-20 blur-3xl"
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
        className="absolute bottom-10 right-1/4 w-48 h-48 rounded-full bg-indigo-500 opacity-10 blur-3xl"
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
              全球<span className="text-blue-200">商机</span>
              <br />
              <span className="text-blue-200">跨境</span>电商
            </motion.h1>
            
            <motion.p 
              className="text-lg text-blue-100 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              突破地域限制，直接面向全球市场，享受跨境电商高速增长红利
            </motion.p>

            <motion.div 
              className="text-md text-blue-200 max-w-md space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="flex items-center">
                <span className="h-1.5 w-1.5 bg-blue-300 rounded-full inline-block mr-2"></span>
                低门槛进入国际市场，触达全球消费者
              </p>
              <p className="flex items-center">
                <span className="h-1.5 w-1.5 bg-blue-300 rounded-full inline-block mr-2"></span>
                利用全球供应链优势，提升利润空间
              </p>
              <p className="flex items-center">
                <span className="h-1.5 w-1.5 bg-blue-300 rounded-full inline-block mr-2"></span>
                专业课程助您避开风险，掌握成功秘诀
              </p>
            </motion.div>
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
                        alt={`跨境电商场景 ${index + 1}`}
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
