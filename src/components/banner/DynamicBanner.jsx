
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Globe, Send, Users, BookOpen, ArrowRight } from 'lucide-react';
import { useTranslations } from "@/hooks/useTranslations";
import { getBannerById, getBannerTranslation } from "@/services/bannerService";

const DynamicBanner = ({ bannerId = "hero-main" }) => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslations();
  const [banner, setBanner] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load banner data
  useEffect(() => {
    const loadBanner = async () => {
      try {
        setLoading(true);
        const bannerData = await getBannerById(bannerId);
        setBanner(bannerData);
        
        // Get translation based on current language
        const translation = getBannerTranslation(bannerData, currentLanguage);
        setContent(translation);
      } catch (error) {
        console.error("Error loading banner:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBanner();
  }, [bannerId, currentLanguage]);
  
  // Show loading state
  if (loading || !banner || !content) {
    return (
      <div className="bg-gray-900 h-96 flex items-center justify-center">
        <div className="animate-pulse w-32 h-32 rounded-full bg-gray-800"></div>
      </div>
    );
  }
  
  // Define gradient based on banner config
  const gradientClasses = banner.overlayGradient ? 
    `bg-gradient-to-r from-${banner.overlayGradient.from} via-${banner.overlayGradient.via} to-${banner.overlayGradient.to}` : 
    "bg-gradient-to-r from-purple-900/90 via-blue-900/80 to-indigo-800/90";
  
  // Define button style based on banner config
  const primaryButtonClasses = banner.buttonStyle?.primary ? 
    `bg-gradient-to-r from-${banner.buttonStyle.primary.bgFrom} to-${banner.buttonStyle.primary.bgTo} text-${banner.buttonStyle.primary.textColor}` : 
    "bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900";
    
  const primaryButtonHoverClasses = banner.buttonStyle?.primary ? 
    `hover:from-${banner.buttonStyle.primary.bgFrom.replace('500', '400')} hover:to-${banner.buttonStyle.primary.bgTo.replace('500', '400')}` : 
    "hover:from-yellow-400 hover:to-orange-400";
  
  // Render dynamic icons
  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'Users': return <Users className="h-5 w-5 text-yellow-400 mr-2" />;
      case 'BookOpen': return <BookOpen className="h-5 w-5 text-yellow-400 mr-2" />;
      case 'Send': return <Send className="h-5 w-5 text-yellow-400 mr-2" />;
      case 'Globe': return <Globe className="h-5 w-5 text-yellow-400 mr-2" />;
      default: return <ArrowRight className="h-5 w-5 text-yellow-400 mr-2" />;
    }
  };
  
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Colorful gradient overlay for better visual impact */}
      <div className={`absolute inset-0 ${gradientClasses} z-10`}></div>
      
      {/* Background image */}
      <div className="absolute inset-0">
        <img 
          src={banner.backgroundImage} 
          alt="Banner background" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content container */}
      <div className="container mx-auto px-4 py-12 md:py-16 relative z-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-5"
          >
            {/* Colorful label */}
            <div className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-sm rounded-full px-4 py-2 inline-flex items-center space-x-2 text-white text-sm">
              <Globe className="h-4 w-4" />
              <span>跨境电商 | Global E-Commerce Education</span>
            </div>
            
            {/* Main headline with animation */}
            <motion.h1 
              className="text-3xl md:text-5xl font-bold text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {content.headline} <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                {content.subheadline}
              </span>
            </motion.h1>
            
            {/* Subheading */}
            <p className="text-lg text-gray-200 leading-relaxed max-w-2xl">
              {content.description}
            </p>
            
            {/* Button with enhanced visual */}
            <div className="pt-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => navigate('/courses')}
                  className={`${primaryButtonClasses} ${primaryButtonHoverClasses} px-6 py-5 text-lg rounded-md flex items-center shadow-lg`}
                >
                  {content.primaryButtonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
            
            {/* Stats and social proof */}
            {banner.statsEnabled && (
              <div className="pt-6 border-t border-white/20 flex flex-wrap items-center gap-4 md:gap-8 mt-3">
                {content.stats && content.stats.map((stat, index) => (
                  <div key={index} className="flex items-center">
                    {renderIcon(stat.icon)}
                    <span className="text-white">
                      <span className="font-bold">{stat.value}</span> {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Trust badges */}
            {content.badges && content.badges.length > 0 && (
              <div className="flex items-center space-x-4 pt-2">
                {content.badges.map((badge, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full"
                  >
                    <div className={`w-2 h-2 bg-${badge.color}-400 rounded-full mr-2`}></div>
                    <span className="text-sm text-white/90">{badge.text}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-purple-500/30 to-blue-500/10 rounded-tl-full blur-3xl"></div>
      <div className="absolute top-0 left-0 w-1/4 h-1/4 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 rounded-br-full blur-3xl"></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl"></div>
    </div>
  );
};

export default DynamicBanner;
