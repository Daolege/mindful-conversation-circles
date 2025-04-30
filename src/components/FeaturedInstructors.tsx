
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import InstructorCard from "./InstructorCard";
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
  }
];

const FeaturedInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchInstructors() {
      const { data, error } = await getAllInstructors();
      
      console.log('Instructors from API:', data);
      
      if (data && data.length > 0) {
        // Transform the instructor data to match the format expected by InstructorCard
        const transformedInstructors = data.map(instructor => ({
          id: instructor.id,
          name: instructor.name,
          title: instructor.expertise || "专业教师",
          imageUrl: instructor.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
          courseCount: 3, // Default value
          studentCount: 1000, // Default value
          featured: true
        }));
        
        setInstructors(transformedInstructors);
      } else {
        console.log('Using mock instructor data');
        if (error) {
          console.error('Error fetching instructors:', error);
        }
        
        toast({
          title: "使用示例数据",
          description: "无法从服务器获取导师数据，正在展示示例数据",
          variant: "default",
        });
        
        setInstructors(mockInstructorsData);
      }
    }
    
    fetchInstructors();
  }, [toast]);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-3">顶尖专家师资</h2>
            <p className="text-gray-600 max-w-2xl">
              与行业领军人物和学术专家一起学习，获取前沿知识与实践经验
            </p>
          </div>
          <Link to="/instructors">
            <Button variant="outline" className="mt-4 md:mt-0 border-knowledge-primary text-knowledge-primary hover:bg-knowledge-primary hover:text-white">
              查看全部导师
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructors.slice(0, 4).map(instructor => (
            <InstructorCard key={instructor.id} {...instructor} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedInstructors;
