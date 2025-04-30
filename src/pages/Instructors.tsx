
import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstructorCard from "@/components/InstructorCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getAllInstructors } from "@/lib/services/instructorService";
import { useToast } from "@/hooks/use-toast";

// Mock data as fallback
const mockInstructorsData = [
  {
    id: 1,
    name: "李明",
    title: "人工智能专家",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    courseCount: 5,
    studentCount: 3240,
    featured: true
  },
  {
    id: 2,
    name: "王晓",
    title: "资深设计师",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80",
    courseCount: 3,
    studentCount: 1820,
    featured: true
  },
  {
    id: 3,
    name: "张业",
    title: "企业战略顾问",
    imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    courseCount: 4,
    studentCount: 2560,
    featured: true
  },
  {
    id: 4,
    name: "周心",
    title: "心理学家",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80",
    courseCount: 2,
    studentCount: 1450,
    featured: false
  },
  {
    id: 5,
    name: "赵安",
    title: "网络安全专家",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    courseCount: 3,
    studentCount: 2150,
    featured: false
  },
  {
    id: 6,
    name: "孙营",
    title: "市场营销总监",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80",
    courseCount: 4,
    studentCount: 1980,
    featured: false
  },
  {
    id: 7,
    name: "张开",
    title: "Web开发专家",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    courseCount: 6,
    studentCount: 3450,
    featured: false
  },
  {
    id: 8,
    name: "王管",
    title: "领导力顾问",
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    courseCount: 2,
    studentCount: 1250,
    featured: false
  }
];

const Instructors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasShownToast, setHasShownToast] = useState(false);
  const { toast } = useToast();
  
  // 使用useCallback来避免不必要的重新渲染
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    
    async function fetchInstructors() {
      setIsLoading(true);
      try {
        const { data, error } = await getAllInstructors();
        
        if (!isMounted) return;
        
        console.log('Instructors from API:', data);
        
        if (data && data.length > 0) {
          // 转换讲师数据以匹配 InstructorCard 预期的格式
          const transformedInstructors = data.map(instructor => ({
            id: instructor.id,
            name: instructor.name,
            title: instructor.expertise || "专业教师",
            imageUrl: instructor.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
            courseCount: 3, // 默认值
            studentCount: 1000, // 默认值
            featured: instructor.status === 'active'
          }));
          
          setInstructors(transformedInstructors);
        } else {
          console.log('Using mock instructor data');
          if (error) {
            console.error('Error fetching instructors:', error);
          }
          
          if (!hasShownToast) {
            toast({
              title: "使用示例数据",
              description: "无法从服务器获取导师数据，正在展示示例数据",
              variant: "default",
            });
            setHasShownToast(true);
          }
          
          setInstructors(mockInstructorsData);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        
        if (!hasShownToast) {
          toast({
            title: "使用示例数据",
            description: "获取导师数据时出错，正在展示示例数据",
            variant: "default",
          });
          setHasShownToast(true);
        }
        
        setInstructors(mockInstructorsData);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    
    fetchInstructors();
    
    // 清理函数
    return () => {
      isMounted = false;
    };
  }, [toast, hasShownToast]);
  
  // 使用useMemo缓存过滤结果可以进一步优化，但这里使用普通过滤也可以
  const filteredInstructors = instructors.filter(instructor => {
    return instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           instructor.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">我们的师资团队</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              来自各行业的专家，拥有丰富的实践经验和教学能力，致力于提供高质量的在线课程
            </p>
          </div>
          
          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="搜索导师..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-knowledge-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredInstructors.map(instructor => (
                  <InstructorCard key={instructor.id} {...instructor} />
                ))}
              </div>
              
              {filteredInstructors.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-500">没有找到匹配的导师</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Instructors;
