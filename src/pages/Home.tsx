
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CrossBorderHeroBanner from "@/components/home/CrossBorderHeroBanner";
import FeaturedCourses from "@/components/FeaturedCourses";
import HomeFAQSection from "@/components/HomeFAQSection";
import { memo } from "react";
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
        <CrossBorderHeroBanner />

        {/* 保留两个不同的课程推荐模块 */}
        <CourseSection
          title={t('courses:explorePopularCourses')}
          description={t('courses:carefullySelectedCoursesHelp')}
        />
        <CourseSection
          title={t('courses:instructorRecommendedCourses')}
          description={t('courses:expertTeamRecommendations')}
        />

        <HomeFAQSection />
      </main>
      <Footer />
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
