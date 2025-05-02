
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
      {/* Dark gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-800/90 z-10"></div>
      
      {/* Background image related to global e-commerce */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80" 
          alt="Global e-commerce network with shipping containers and digital connectivity" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content container */}
      <div className="container mx-auto px-4 py-24 md:py-32 relative z-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Label */}
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 inline-flex items-center space-x-2 text-white/90 text-sm">
              <Globe className="h-4 w-4" />
              <span>跨境电商 | Global E-Commerce Education</span>
            </div>
            
            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {t('home:crossBorderCommerce')} <br />
              <span className="text-yellow-400">{t('home:yourGlobalSuccess')}</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
              {t('home:professionalEcommerceTraining')} 亚马逊、eBay、Shopify、AliExpress、Wish等平台跨境销售技能培训。
            </p>
            
            {/* Button group - simplified to just one strong CTA */}
            <div className="pt-6">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => navigate('/courses')}
                  className="bg-yellow-500 text-gray-900 hover:bg-yellow-400 px-8 py-6 text-lg rounded-md flex items-center"
                >
                  {t('home:startLearning')} - 开启全球销售之旅
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </div>
            
            {/* Stats and social proof */}
            <div className="pt-8 border-t border-white/20 flex flex-wrap items-center gap-6 md:gap-10 mt-4">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-yellow-400 mr-2" />
                <span className="text-white">
                  <span className="font-bold">5,000+</span> {t('home:activeStudents')}
                </span>
              </div>
              
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 text-yellow-400 mr-2" />
                <span className="text-white">
                  <span className="font-bold">50+</span> {t('home:expertInstructors')}
                </span>
              </div>
              
              <div className="flex items-center">
                <Send className="h-6 w-6 text-yellow-400 mr-2" />
                <span className="text-white">
                  <span className="font-bold">Amazon · eBay · Shopify · TikTok</span>
                </span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-white/80">跨境电商认证课程</span>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm text-white/80">行业专家授课</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-white/5 rounded-tl-full blur-3xl"></div>
      <div className="absolute top-0 left-0 w-1/4 h-1/4 bg-yellow-500/5 rounded-br-full blur-3xl"></div>
    </div>
  );
};

export default CrossBorderHeroBanner;
