
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import FeaturedCourses from "@/components/FeaturedCourses";
// import FeaturedInstructors from "@/components/FeaturedInstructors";
// import TestimonialsSection from "@/components/TestimonialsSection";
// import StatisticsSection from "@/components/StatisticsSection";
import CTASection from "@/components/CTASection";
import { memo } from "react";
import HomeFAQSection from "@/components/HomeFAQSection";

// 课程模块包装组件 - 添加标题和描述
const CourseSection = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <section className="mb-16">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">{title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
      </div>
      <FeaturedCourses />
    </div>
  </section>
);

const Index = memo(() => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />

        {/* 三个不同的课程推荐模块 */}
        <CourseSection
          title="探索热门课程"
          description="我们精心挑选的课程，帮助您掌握新技能，拓展职业发展空间"
        />
        <CourseSection
          title="导师推荐课程"
          description="来自各学科专家团队的优质课程推荐，助力您的学习之路"
        />
        <CourseSection
          title="高分爆款课程"
          description="根据用户评价和学习人数精选高分热卖好课"
        />

        <HomeFAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
