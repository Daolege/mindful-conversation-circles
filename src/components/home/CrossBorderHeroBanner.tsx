
import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Globe, Send, Users, BookOpen, ArrowRight } from 'lucide-react';
import { useTranslations } from "@/hooks/useTranslations";

const CrossBorderHeroBanner = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();
  
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Colorful gradient overlay for better visual impact */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-blue-900/80 to-indigo-800/90 z-10"></div>
      
      {/* More vibrant background image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80" 
          alt="Global e-commerce network with digital marketplace" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Reduced height with smaller padding */}
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
              {t('home:crossBorderCommerce')} <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                {t('home:yourGlobalSuccess')}
              </span>
            </motion.h1>
            
            {/* Subheading */}
            <p className="text-lg text-gray-200 leading-relaxed max-w-2xl">
              {t('home:professionalEcommerceTraining')} 亚马逊、eBay、Shopify、AliExpress、Wish等平台跨境销售技能培训。
            </p>
            
            {/* Button with enhanced visual */}
            <div className="pt-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => navigate('/courses')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 hover:from-yellow-400 hover:to-orange-400 px-6 py-5 text-lg rounded-md flex items-center shadow-lg"
                >
                  {t('home:startLearning')} - 开启全球销售之旅
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
            
            {/* Stats and social proof */}
            <div className="pt-6 border-t border-white/20 flex flex-wrap items-center gap-4 md:gap-8 mt-3">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-white">
                  <span className="font-bold">5,000+</span> {t('home:activeStudents')}
                </span>
              </div>
              
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-white">
                  <span className="font-bold">50+</span> {t('home:expertInstructors')}
                </span>
              </div>
              
              <div className="flex items-center">
                <Send className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-white text-sm">
                  <span className="font-bold">Amazon · eBay · Shopify · TikTok</span>
                </span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center space-x-4 pt-2">
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-white/90">跨境电商认证课程</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm text-white/90">行业专家授课</span>
              </div>
            </div>
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

export default CrossBorderHeroBanner;
