
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, Users, Star, Play } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-knowledge-dark to-knowledge-primary text-white py-24">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                全新在线学习平台
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              开启您的<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">知识旅程</span>
            </h1>
            
            <p className="text-xl opacity-90 leading-relaxed max-w-xl">
              从顶尖专家那里获取最新、最实用的知识。我们精心挑选的课程将助您成为所在领域的专家。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                asChild
                className="bg-white hover:bg-gray-100 text-knowledge-dark hover:text-knowledge-primary transition-colors font-medium text-base px-8 rounded-full h-12"
              >
                <Link to="/courses">
                  浏览所有课程
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                asChild
                className="border-white text-white hover:bg-white/20 rounded-full h-12 px-8 font-medium text-base"
              >
                <Link to="/about">
                  <Play className="mr-2 h-4 w-4" />
                  观看平台介绍
                </Link>
              </Button>
            </div>
            
            <div className="pt-4 flex items-center space-x-8">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center overflow-hidden"
                      style={{ zIndex: 5 - i }}
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
                  <p className="font-medium text-sm">已有<span className="text-white font-bold"> 1,000+ </span>名学员</p>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-1 text-xs">(4.9/5)</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden sm:block h-12 w-px bg-white/20"></div>
              
              <div className="hidden sm:flex items-center">
                <Users className="h-5 w-5 mr-2 text-white/70" />
                <span className="text-sm">
                  <span className="font-bold">100+</span> 专业导师
                </span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block relative">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                alt="Students learning"
                className="w-full h-auto rounded-xl"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-knowledge-dark/60 to-transparent"></div>
            </div>
            
            {/* 悬浮卡片 */}
            <div className="absolute -top-5 -left-5 z-10">
              <div className="animate-float bg-white rounded-lg shadow-xl p-4 w-48">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-knowledge-primary" />
                  <div>
                    <p className="font-medium">新课程</p>
                    <p className="text-xs text-gray-500">每周更新</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-5 -right-5 z-10">
              <div className="animate-float bg-white rounded-lg shadow-xl p-4 w-48" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-knowledge-primary mr-2" />
                  <div>
                    <p className="font-medium text-knowledge-primary">100+</p>
                    <p className="text-xs text-gray-500">专业导师</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute top-1/2 right-0 transform translate-x-1/3 -translate-y-1/2 z-10">
              <div className="animate-float bg-white rounded-lg shadow-xl p-4 w-40" style={{ animationDelay: "1s" }}>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 mr-2" />
                  <div>
                    <p className="font-medium">4.9/5</p>
                    <p className="text-xs text-gray-500">学员满意度</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
