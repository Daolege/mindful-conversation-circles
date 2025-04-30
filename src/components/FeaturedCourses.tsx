import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@/lib/types/course";
import { transformCourseData } from "@/lib/types/course";
import { getAllCoursesNew } from "@/lib/services/courseNewService";
import CourseGrid from "./courses/CourseGrid";
import LoadingState from "./courses/LoadingState";
import { transformCourseNewToOld } from "@/lib/utils/courseTransformers";

const mockCourses: Course[] = [
  {
    id: 1,
    title: "人工智能基础：从入门到精通",
    instructor: "李明教授",
    instructorId: 1,
    category: "技术",
    price: 299,
    originalprice: 499,
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    rating: 4.8,
    ratingCount: 320,
    studentCount: 1250,
    description: "学习人工智能的基础知识和应用技巧",
    duration: "24小时",
    lectures: 48,
    level: "初级到中级",
    lastUpdated: "2023-12-15",
    featured: true,
    whatYouWillLearn: ["人工智能基础理论", "机器学习算法", "神经网络基础", "AI实际应用案例"],
    requirements: ["基础编程知识", "高中数学水平"],
    language: "zh",
    enrollment_count: 1250,
    published_at: "2023-12-15T12:00:00Z",
    display_order: 1,
    syllabus: [
      {
        title: "人工智能导论",
        lectures: [
          { title: "什么是人工智能", duration: "45分钟" },
          { title: "人工智能的历史发展", duration: "55分钟" }
        ]
      }
    ],
    currency: "cny" // Added currency for Chinese course
  },
  {
    id: 2,
    title: "现代设计方法与案例分析",
    instructor: "王晓设计师",
    instructorId: 2,
    category: "设计",
    price: 199,
    originalprice: 299,
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    rating: 4.7,
    ratingCount: 215,
    studentCount: 890,
    description: "掌握现代设计方法，提升设计技巧",
    duration: "18小时",
    lectures: 36,
    level: "所有级别",
    lastUpdated: "2023-11-20",
    featured: true,
    whatYouWillLearn: ["设计思维", "用户体验设计", "视觉设计原则", "设计工具使用"],
    requirements: ["对设计有基本兴趣", "无需专业知识"],
    language: "zh",
    enrollment_count: 890,
    published_at: "2023-11-20T10:00:00Z",
    display_order: 2,
    syllabus: [
      {
        title: "设计基础",
        lectures: [
          { title: "设计原则介绍", duration: "50分钟" },
          { title: "色彩理论基础", duration: "45分钟" }
        ]
      }
    ],
    currency: "cny" // Added currency for Chinese course
  },
  {
    id: 3,
    title: "高效商业战略：如何构建可扩展商业模式",
    instructor: "张企业家",
    instructorId: 3,
    category: "商业",
    price: 399,
    originalprice: 599,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1115&q=80",
    rating: 4.9,
    ratingCount: 450,
    studentCount: 1560,
    description: "学习构建可扩展的商业模式和高效商业战略",
    duration: "30小时",
    lectures: 60,
    level: "中级到高级",
    lastUpdated: "2023-12-05",
    featured: true,
    whatYouWillLearn: ["商业模式设计", "市��分析方法", "竞争战略", "增长策略"],
    requirements: ["基础商业知识", "一定的工作经验"],
    language: "zh",
    enrollment_count: 1560,
    published_at: "2023-12-05T15:30:00Z",
    display_order: 3,
    syllabus: [
      {
        title: "商业模式基础",
        lectures: [
          { title: "商业模式画布", duration: "60分钟" },
          { title: "价值主张设计", duration: "55分钟" }
        ]
      }
    ],
    currency: "cny" // Added currency for Chinese course
  },
  {
    id: 4,
    title: "������生活方式：营养学与运动科学",
    instructor: "王健康教练",
    instructorId: 4,
    category: "健康",
    price: 249,
    originalprice: null,
    imageUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    rating: 4.6,
    ratingCount: 180,
    studentCount: 720,
    description: "学习科学的营养知识和运动方法",
    duration: "15小时",
    lectures: 30,
    level: "初级",
    lastUpdated: "2023-10-20",
    featured: false,
    whatYouWillLearn: ["基础营养学", "健康饮食规划", "科学运动方法", "健康生活习惯"],
    requirements: ["无需专业知识"],
    language: "zh",
    enrollment_count: 720,
    published_at: "2023-10-20T09:15:00Z",
    display_order: 4,
    syllabus: [
      {
        title: "营养学基础",
        lectures: [
          { title: "营养元素简介", duration: "40分钟" },
          { title: "合理膳食搭配", duration: "45分钟" }
        ]
      }
    ],
    currency: "cny" // Added currency for Chinese course
  },
  {
    id: 5,
    title: "数据分析与可视化入门",
    instructor: "张数据专家",
    instructorId: 5,
    category: "技术",
    price: 349,
    originalprice: null,
    imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1176&q=80",
    rating: 4.7,
    ratingCount: 230,
    studentCount: 950,
    description: "掌握数据分析与可视化的基本技能",
    duration: "20小时",
    lectures: 40,
    level: "初级到中级",
    lastUpdated: "2023-11-15",
    featured: false,
    whatYouWillLearn: ["数据分析基础", "Excel高级技巧", "数据可视化工具", "数据解读方法"],
    requirements: ["基础计算机操作", "Excel基础知识"],
    language: "zh",
    enrollment_count: 950,
    published_at: "2023-11-15T14:00:00Z",
    display_order: 5,
    syllabus: [
      {
        title: "数据分析入门",
        lectures: [
          { title: "数据分析思维", duration: "50分钟" },
          { title: "数据收集方法", duration: "45分钟" }
        ]
      }
    ],
    currency: "cny" // Added currency for Chinese course
  },
  {
    id: 6,
    title: "高效沟通：职场人际交流技巧",
    instructor: "刘沟通导师",
    instructorId: 6,
    category: "职业发展",
    price: 189,
    originalprice: null,
    imageUrl: "https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    rating: 4.8,
    ratingCount: 320,
    studentCount: 1320,
    description: "提升职场沟通能力，建立良好人际关系",
    duration: "12小时",
    lectures: 24,
    level: "所有级别",
    lastUpdated: "2023-09-30",
    featured: false,
    whatYouWillLearn: ["有效沟通原则", "倾听技巧", "非语言沟通", "冲突处理"],
    requirements: ["无需专业知识"],
    language: "zh",
    enrollment_count: 1320,
    published_at: "2023-09-30T16:45:00Z",
    display_order: 6,
    syllabus: [
      {
        title: "沟通基础",
        lectures: [
          { title: "沟通的要素", duration: "35分钟" },
          { title: "沟通障碍与克服", duration: "40分钟" }
        ]
      }
    ],
    currency: "cny" // Added currency for Chinese course
  }
];

const FeaturedCourses = () => {
  const [visibleCount, setVisibleCount] = useState(6);
  const [coursesData, setCoursesData] = useState<Course[]>([]);
  const hasToasted = useRef(false);
  const dataFetchedRef = useRef(false);
  const { toast } = useToast();

  const { data: coursesResponse, isLoading, isError, error } = useQuery({
    queryKey: ['courses-new'], 
    queryFn: async () => await getAllCoursesNew(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    gcTime: 1000 * 60 * 10
  });

  useEffect(() => {
    if (dataFetchedRef.current) return;

    const shouldUseApiData = coursesResponse?.data && coursesResponse.data.length > 0;
    const shouldUseMockData = isError || (coursesResponse?.data && coursesResponse.data.length === 0);
    
    if (shouldUseApiData) {
      console.log('Using API data from courses_new:', coursesResponse.data);
      // Transform the courses data to ensure consistent format - convert CourseNew to Course
      const transformedCourses = coursesResponse.data.map((course) => transformCourseNewToOld(course));
      // Sort courses by display_order
      const sortedCourses = [...transformedCourses].sort((a, b) => 
        (a.display_order || 999) - (b.display_order || 999)
      );
      setCoursesData(sortedCourses);
      dataFetchedRef.current = true;
    } else if (shouldUseMockData && coursesData.length === 0) {
      console.log('Using mock course data due to API error or empty response:', error);
      
      if (!hasToasted.current) {
        toast({
          title: "使用示例数据",
          description: "无法从服务器获取课程，正在展示示例数据",
          variant: "default",
        });
        hasToasted.current = true;
      }
      
      import.meta.env.DEV && console.log("Setting mock courses");
      // Transform the mock courses to ensure they match the Course type
      const transformedMockCourses = mockCourses.map((course) => transformCourseData(course));
      setCoursesData(transformedMockCourses);
      dataFetchedRef.current = true;
    }
  }, [coursesResponse, isError, error, toast, coursesData.length]);

  const filteredCourses = useMemo(() => {
    return coursesData;
  }, [coursesData]);

  const { displayedCourses, hasMore } = useMemo(() => {
    const displayed = filteredCourses.slice(0, visibleCount);
    return {
      displayedCourses: displayed,
      hasMore: displayed.length < filteredCourses.length
    };
  }, [filteredCourses, visibleCount]);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + 3);
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <section className="py-8">
      {isError && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>正在显示示例课程数据，稍后再试获取最新课程</p>
          </div>
        </div>
      )}

      <CourseGrid 
        courses={displayedCourses}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </section>
  );
};

export default FeaturedCourses;
