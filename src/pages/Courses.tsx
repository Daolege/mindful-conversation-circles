import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { Course } from '@/lib/types/course';
import { transformCourseData } from '@/lib/types/course';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, Sliders } from 'lucide-react';
import CourseGrid from '@/components/courses/CourseGrid';
import LoadingState from '@/components/courses/LoadingState';
import { getAllCoursesNew } from '@/lib/services/courseNewService';
import { transformCourseNewToOld } from '@/lib/utils/courseTransformers';
import { useTranslations } from '@/hooks/useTranslations';

// The mockCourses data will be used as a fallback if the API fails
const mockCourses: Course[] = [
  {
    id: 1,
    title: "Zero to Hero Python",
    instructor: "Jane Smith",
    category: "Programming",
    price: 49.99,
    originalprice: 99.99,
    imageUrl: "/placeholder.svg",
    rating: 4.8,
    studentCount: 12500,
    featured: true,
    description: "Learn Python from scratch and build real-world applications",
    duration: "30 hours",
    lectures: 120,
    level: "Beginner",
    language: "en",
    enrollment_count: 12500,
    published_at: "2023-01-15",
    requirements: ["No prior coding experience needed", "Basic computer skills"],
    lastUpdated: "2023-05-20",
    display_order: 1,
    whatYouWillLearn: ["Python fundamentals", "Object-oriented programming", "Web development with Flask"],
    currency: "usd" // Added missing currency
  },
  {
    id: 2,
    title: "Complete React Developer",
    instructor: "John Doe",
    category: "Programming",
    price: 59.99,
    originalprice: 129.99,
    imageUrl: "/placeholder.svg",
    rating: 4.9,
    studentCount: 8700,
    featured: true,
    description: "Master React and Redux with real projects",
    duration: "28 hours",
    lectures: 95,
    level: "Intermediate",
    language: "en",
    enrollment_count: 8700,
    published_at: "2023-02-10",
    requirements: ["JavaScript knowledge", "HTML and CSS basics"],
    lastUpdated: "2023-06-15",
    display_order: 2,
    whatYouWillLearn: ["React Hooks", "Context API", "Redux Toolkit"],
    currency: "usd" // Added missing currency
  },
  {
    id: 3,
    title: "Data Science Masterclass",
    instructor: "Dr. Sarah Lee",
    category: "Data Science",
    price: 79.99,
    originalprice: 199.99,
    imageUrl: "/placeholder.svg",
    rating: 4.7,
    studentCount: 5300,
    featured: true,
    description: "Comprehensive guide to data science and machine learning",
    duration: "45 hours",
    lectures: 150,
    level: "Advanced",
    language: "en",
    enrollment_count: 5300,
    published_at: "2023-03-05",
    requirements: ["Basic Python", "Statistics fundamentals"],
    lastUpdated: "2023-07-10",
    display_order: 3,
    whatYouWillLearn: ["Machine Learning", "Deep Learning", "Data Visualization"],
    currency: "usd" // Added missing currency
  },
  {
    id: 4,
    title: "Digital Marketing Essentials",
    instructor: "Mike Johnson",
    category: "Marketing",
    price: 39.99,
    originalprice: 89.99,
    imageUrl: "/placeholder.svg",
    rating: 4.6,
    studentCount: 9800,
    featured: false,
    description: "Learn the fundamentals of digital marketing",
    duration: "20 hours",
    lectures: 72,
    level: "Beginner",
    language: "en",
    enrollment_count: 9800,
    published_at: "2023-01-25",
    requirements: ["No prior knowledge needed"],
    lastUpdated: "2023-05-30",
    display_order: 4,
    whatYouWillLearn: ["SEO", "Social Media Marketing", "Email Campaigns"],
    currency: "usd" // Added missing currency
  },
  {
    id: 5,
    title: "UX/UI Design Bootcamp",
    instructor: "Lisa Wang",
    category: "Design",
    price: 69.99,
    originalprice: 149.99,
    imageUrl: "/placeholder.svg",
    rating: 4.9,
    studentCount: 4200,
    featured: false,
    description: "Master UX/UI design principles and tools",
    duration: "32 hours",
    lectures: 110,
    level: "Intermediate",
    language: "en",
    enrollment_count: 4200,
    published_at: "2023-02-20",
    requirements: ["Basic design knowledge", "Familiarity with design tools"],
    lastUpdated: "2023-06-25",
    display_order: 5,
    whatYouWillLearn: ["User Research", "Wireframing", "Prototyping"],
    currency: "usd" // Added missing currency
  },
  {
    id: 6,
    title: "AWS Certified Solutions Architect",
    instructor: "Robert Chen",
    category: "Cloud Computing",
    price: 89.99,
    originalprice: 199.99,
    imageUrl: "/placeholder.svg",
    rating: 4.8,
    studentCount: 3100,
    featured: false,
    description: "Prepare for the AWS Solutions Architect certification",
    duration: "38 hours",
    lectures: 130,
    level: "Advanced",
    language: "en",
    enrollment_count: 3100,
    published_at: "2023-03-15",
    requirements: ["Basic IT knowledge", "Cloud computing concepts"],
    lastUpdated: "2023-07-20",
    display_order: 6,
    whatYouWillLearn: ["EC2", "S3", "Lambda", "VPC"],
    currency: "usd" // Added missing currency
  },
  {
    id: 7,
    title: "Financial Analysis Fundamentals",
    instructor: "David Brown",
    category: "Finance",
    price: 54.99,
    originalprice: 119.99,
    imageUrl: "/placeholder.svg",
    rating: 4.7,
    studentCount: 6500,
    featured: false,
    description: "Learn financial analysis techniques for business",
    duration: "25 hours",
    lectures: 85,
    level: "Intermediate",
    language: "en",
    enrollment_count: 6500,
    published_at: "2023-01-30",
    requirements: ["Basic accounting knowledge", "Excel skills"],
    lastUpdated: "2023-06-05",
    display_order: 7,
    whatYouWillLearn: ["Financial Statements", "Ratio Analysis", "Valuation"],
    currency: "usd" // Added missing currency
  },
  {
    id: 8,
    title: "Photography Masterclass",
    instructor: "Emily Wong",
    category: "Photography",
    price: 44.99,
    originalprice: 99.99,
    imageUrl: "/placeholder.svg",
    rating: 4.8,
    studentCount: 7800,
    featured: false,
    description: "Master photography from basics to advanced techniques",
    duration: "22 hours",
    lectures: 78,
    level: "All Levels",
    language: "en",
    enrollment_count: 7800,
    published_at: "2023-02-05",
    requirements: ["DSLR or mirrorless camera", "Basic computer skills"],
    lastUpdated: "2023-05-15",
    display_order: 8,
    whatYouWillLearn: ["Camera Settings", "Composition", "Editing"],
    currency: "usd" // Added missing currency
  },
  {
    id: 9,
    title: "Modern JavaScript Complete Guide",
    instructor: "Alex Martinez",
    category: "Programming",
    price: 49.99,
    originalprice: 109.99,
    imageUrl: "/placeholder.svg",
    rating: 4.9,
    studentCount: 9400,
    featured: false,
    description: "Comprehensive guide to modern JavaScript",
    duration: "26 hours",
    lectures: 92,
    level: "Intermediate",
    language: "en",
    enrollment_count: 9400,
    published_at: "2023-03-10",
    requirements: ["Basic HTML knowledge", "Basic programming concepts"],
    lastUpdated: "2023-07-05",
    display_order: 9,
    whatYouWillLearn: ["ES6+", "Async JavaScript", "DOM Manipulation"],
    currency: "usd" // Added missing currency
  },
  {
    id: 10,
    title: "Graphic Design for Beginners",
    instructor: "Sophia Garcia",
    category: "Design",
    price: 39.99,
    originalprice: 89.99,
    imageUrl: "/placeholder.svg",
    rating: 4.6,
    studentCount: 8200,
    featured: false,
    description: "Learn graphic design principles and tools",
    duration: "18 hours",
    lectures: 65,
    level: "Beginner",
    language: "en",
    enrollment_count: 8200,
    published_at: "2023-01-20",
    requirements: ["No prior experience required"],
    lastUpdated: "2023-06-10",
    display_order: 10,
    whatYouWillLearn: ["Design Principles", "Typography", "Color Theory"],
    currency: "usd" // Added missing currency
  },
  {
    id: 11,
    title: "Mobile App Development with Flutter",
    instructor: "James Wilson",
    category: "Programming",
    price: 59.99,
    originalprice: 129.99,
    imageUrl: "/placeholder.svg",
    rating: 4.8,
    studentCount: 4800,
    featured: false,
    description: "Build iOS and Android apps with Flutter",
    duration: "28 hours",
    lectures: 95,
    level: "Intermediate",
    language: "en",
    enrollment_count: 4800,
    published_at: "2023-02-15",
    requirements: ["Basic programming knowledge", "Dart is a plus but not required"],
    lastUpdated: "2023-07-15",
    display_order: 11,
    whatYouWillLearn: ["Dart Programming", "UI Development", "State Management"],
    currency: "usd" // Added missing currency
  },
  {
    id: 12,
    title: "Blockchain Development Bootcamp",
    instructor: "Thomas Lee",
    category: "Programming",
    price: 79.99,
    originalprice: 179.99,
    imageUrl: "/placeholder.svg",
    rating: 4.7,
    studentCount: 2900,
    featured: false,
    description: "Learn blockchain development and smart contracts",
    duration: "35 hours",
    lectures: 120,
    level: "Advanced",
    language: "en",
    enrollment_count: 2900,
    published_at: "2023-03-25",
    requirements: ["JavaScript knowledge", "Basic understanding of blockchain"],
    lastUpdated: "2023-07-25",
    display_order: 12,
    whatYouWillLearn: ["Ethereum", "Smart Contracts", "DApps Development"],
    currency: "usd" // Added missing currency
  }
];

const Courses = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('relevance');
  const [visibleCount, setVisibleCount] = useState(12);
  const { t } = useTranslations();

  // Update the queryFn to properly pass the search parameter
  const { data: coursesResponse, isLoading } = useQuery({
    queryKey: ['courses-new', search, category, sort],
    queryFn: () => getAllCoursesNew(search),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const courses = useMemo(() => {
    if (coursesResponse?.data && coursesResponse.data.length > 0) {
      // Transform the new course format to the old format for compatibility
      return coursesResponse.data.map(course => transformCourseNewToOld(course));
    }
    // Use mock data as fallback
    return mockCourses.map(course => transformCourseData(course));
  }, [coursesResponse]);

  const filteredCourses = useMemo(() => {
    let filtered = courses as Course[];

    if (search) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        (course.description && course.description.toLowerCase().includes(search.toLowerCase())) ||
        (course.instructor && course.instructor.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(course => course.category === category);
    }

    // Sorting logic
    if (sort === 'relevance') {
      // No specific sorting for relevance, can be default
    } else if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime());
    } else if (sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [courses, search, category, sort]);

  // Get displayed courses based on visible count
  const displayedCourses = useMemo(() => {
    return filteredCourses.slice(0, visibleCount);
  }, [filteredCourses, visibleCount]);

  // Check if there are more courses to load
  const hasMore = useMemo(() => {
    return displayedCourses.length < filteredCourses.length;
  }, [displayedCourses.length, filteredCourses.length]);

  // Load more courses handler
  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + 6);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">{t('courses:allCourses')}</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="search"
                placeholder={t('actions:searchCourses')}
                className="pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <button className="flex items-center py-2 px-4 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {t('courses:category')}: {category === 'all' ? t('courses:all') : t(`courses:categories.${category.toLowerCase()}`)}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              {/* Implement category selection dropdown here */}
            </div>
            <div className="relative">
              <button className="flex items-center py-2 px-4 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {t('courses:sort')}: {t(`courses:sortOptions.${sort}`)}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              {/* Implement sorting options dropdown here */}
            </div>
            <button className="py-2 px-4 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Sliders className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full mb-4">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setCategory('all')}>{t('courses:all')}</TabsTrigger>
            <TabsTrigger value="programming" onClick={() => setCategory('Programming')}>{t('courses:categories.programming')}</TabsTrigger>
            <TabsTrigger value="design" onClick={() => setCategory('Design')}>{t('courses:categories.design')}</TabsTrigger>
            <TabsTrigger value="marketing" onClick={() => setCategory('Marketing')}>{t('courses:categories.marketing')}</TabsTrigger>
            <TabsTrigger value="finance" onClick={() => setCategory('Finance')}>{t('courses:categories.finance')}</TabsTrigger>
            {/* Add more categories as needed */}
          </TabsList>
          <TabsContent value="all" className="pt-4">
            <CourseGrid 
              courses={displayedCourses as Course[]} 
              hasMore={hasMore} 
              onLoadMore={loadMore}
              isLoading={isLoading} 
            />
          </TabsContent>
          <TabsContent value="programming" className="pt-4">
            <CourseGrid 
              courses={displayedCourses as Course[]} 
              hasMore={hasMore} 
              onLoadMore={loadMore}
              isLoading={isLoading} 
            />
          </TabsContent>
          <TabsContent value="design" className="pt-4">
            <CourseGrid 
              courses={displayedCourses as Course[]} 
              hasMore={hasMore} 
              onLoadMore={loadMore}
              isLoading={isLoading} 
            />
          </TabsContent>
          <TabsContent value="marketing" className="pt-4">
            <CourseGrid 
              courses={displayedCourses as Course[]} 
              hasMore={hasMore} 
              onLoadMore={loadMore}
              isLoading={isLoading} 
            />
          </TabsContent>
          <TabsContent value="finance" className="pt-4">
            <CourseGrid 
              courses={displayedCourses as Course[]} 
              hasMore={hasMore} 
              onLoadMore={loadMore}
              isLoading={isLoading} 
            />
          </TabsContent>
          {/* Add more TabsContent as needed */}
        </Tabs>

        {isLoading && <LoadingState />}
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
