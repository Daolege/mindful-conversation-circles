
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, Users, Star, Play, Rocket, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslations } from "@/hooks/useTranslations";
import { motion } from "framer-motion";

const HeroSection = () => {
  const { t } = useTranslations();

  return (
    <section className="relative overflow-hidden bg-[#F8F8F8] text-[#404040] py-20">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(#404040 1px, transparent 1px), radial-gradient(#404040 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px'
        }}></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#E5E5E5] border border-[#E5E5E5]">
              <Rocket size={16} className="mr-2 text-[#595959]" />
              <span className="text-sm font-medium text-[#404040]">{t('home:newOnlineLearningPlatform')}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-[#262626]">
              <span className="block mb-2">{t('home:knowledgeEmpowerment')}</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#404040] to-[#595959]">
                {t('home:crossBorderCommerce')}
              </span>
            </h1>
            
            <p className="text-xl text-[#808080] leading-relaxed max-w-xl">
              {t('home:professionalEcommerceTraining')} 
              {t('home:discoverQualityCourses')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                size="lg" 
                asChild
                className="bg-[#595959] hover:bg-[#333333] text-white font-medium rounded-full h-12 px-8"
              >
                <Link to="/courses">
                  {t('home:exploreCourses')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                asChild
                className="border-[#595959] text-[#595959] hover:bg-[#595959] hover:text-white rounded-full h-12 px-8"
              >
                <Link to="/auth">
                  <Play className="mr-2 h-4 w-4" />
                  {t('home:registerNow')}
                </Link>
              </Button>
            </div>
            
            <div className="pt-8 flex flex-wrap gap-8">
              <div className="flex items-center">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className="w-10 h-10 rounded-full border-2 border-[#E5E5E5] bg-gray-300 flex items-center justify-center overflow-hidden"
                    >
                      <img 
                        src={`https://randomuser.me/api/portraits/men/${20 + i}.jpg`} 
                        alt={`User ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <p className="font-medium"><span className="text-[#262626] font-bold">1,000+ </span>{t('home:students')}</p>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-[#595959] fill-[#595959]" />
                    ))}
                    <span className="ml-1 text-xs text-[#808080]">(4.9/5)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-2.5 rounded-full bg-[#E5E5E5]">
                  <Users className="h-5 w-5 text-[#595959]" />
                </div>
                <div className="ml-3">
                  <p className="font-medium"><span className="text-[#262626] font-bold">100+ </span>{t('home:professionals')}</p>
                  <p className="text-xs text-[#808080]">{t('home:expertInstructors')}</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="relative hidden md:block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#E5E5E5] transform rotate-2">
              <img 
                src="https://images.unsplash.com/photo-1665799871626-bd02af2953f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80" 
                alt="Global e-commerce learning"
                className="w-full h-auto object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#262626]/70 to-transparent"></div>
              
              {/* Stats badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-lg p-4 border border-[#E5E5E5]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[#262626] font-bold text-lg">Amazon · eBay · Shopify</p>
                    <p className="text-sm text-[#808080]">{t('home:globalMarkets')}</p>
                  </div>
                  <ChevronRight className="h-6 w-6 text-[#595959]" />
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div 
              className="absolute -top-6 -left-6 bg-white rounded-lg shadow-xl p-3 z-10 border border-[#E5E5E5]"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-[#F8F8F8] rounded-full">
                  <BookOpen className="h-5 w-5 text-[#595959]" />
                </div>
                <div>
                  <p className="font-medium text-[#262626]">{t('courses:newCourses')}</p>
                  <p className="text-xs text-[#808080]">{t('home:weeklyUpdates')}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-4 right-12 bg-white rounded-lg shadow-xl p-3 z-10 border border-[#E5E5E5]"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-[#F8F8F8] rounded-full">
                  <Star className="h-5 w-5 text-[#595959] fill-[#595959]" />
                </div>
                <div>
                  <p className="font-medium text-[#262626]">4.9/5</p>
                  <p className="text-xs text-[#808080]">{t('home:studentSatisfaction')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
