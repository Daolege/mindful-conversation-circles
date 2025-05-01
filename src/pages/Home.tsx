
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
import { useTranslations } from "@/hooks/useTranslations";

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
  const { t } = useTranslations();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />

        {/* 三个不同的课程推荐模块 */}
        <CourseSection
          title={t('courses:explorePopularCourses')}
          description={t('courses:carefullySelectedCoursesHelp')}
        />
        <CourseSection
          title={t('courses:instructorRecommendedCourses')}
          description={t('courses:expertTeamRecommendations')}
        />
        <CourseSection
          title={t('courses:highRatedCourses')}
          description={t('courses:selectedBasedOnUserRatings')}
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
