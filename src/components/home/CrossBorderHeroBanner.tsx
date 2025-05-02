
import React from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Globe, Send, Users, BookOpen } from 'lucide-react';
import { useTranslations } from "@/hooks/useTranslations";

const CrossBorderHeroBanner = () => {
  const navigate = useNavigate();
  const { t } = useTranslations();
  
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Dark gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-900/80 z-10"></div>
      
      {/* Background image related to global e-commerce */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80" 
          alt="Global e-commerce network" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content container */}
      <div className="container mx-auto px-4 py-20 md:py-28 relative z-20">
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
              <span>SecondRise E-Commerce Academy</span>
            </div>
            
            {/* Main headline */}
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {t('home:crossBorderCommerce')} <br />
              <span className="text-gray-300">{t('home:yourGlobalSuccess')}</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl text-gray-300 leading-relaxed">
              {t('home:professionalEcommerceTraining')}
            </p>
            
            {/* Button group */}
            <div className="pt-4 flex flex-wrap gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => navigate('/courses')}
                  className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-md"
                >
                  {t('home:startLearning')}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-md"
                >
                  {t('home:joinCommunity')}
                </Button>
              </motion.div>
            </div>
            
            {/* Stats and social proof */}
            <div className="pt-8 border-t border-white/20 flex flex-wrap items-center gap-6 md:gap-10">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-white/80 mr-2" />
                <span className="text-white">
                  <span className="font-bold">5,000+</span> {t('home:activeStudents')}
                </span>
              </div>
              
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 text-white/80 mr-2" />
                <span className="text-white">
                  <span className="font-bold">50+</span> {t('home:expertInstructors')}
                </span>
              </div>
              
              <div className="flex items-center">
                <Send className="h-6 w-6 text-white/80 mr-2" />
                <span className="text-white">
                  <span className="font-bold">{t('home:globalMarkets')}</span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-white/5 rounded-tl-full blur-3xl"></div>
      <div className="absolute top-0 left-0 w-1/4 h-1/4 bg-white/5 rounded-br-full blur-3xl"></div>
    </div>
  );
};

export default CrossBorderHeroBanner;
