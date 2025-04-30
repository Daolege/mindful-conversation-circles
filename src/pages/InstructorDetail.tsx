import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Star, Users, Award, Link } from "lucide-react";

// Mock instructor data
const instructorsData = [
  {
    id: 1,
    name: "李明",
    title: "人工智能专家",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    courseCount: 5,
    studentCount: 3240,
    bio: "李明是人工智能领域的专家，拥有超过10年的研究和教学经验。曾在多家知名科技公司担任AI顾问，出版过多部AI相关著作。他专注于将复杂的AI概念简化，使学生能够轻松理解和应用。",
    expertise: ["人工智能", "机器学习", "深度学习", "计算机视觉", "自然语言处理"],
    education: [
      { degree: "计算机科学博士", school: "北京大学", year: "2010" },
      { degree: "计算机科学硕士", school: "清华大学", year: "2007" }
    ],
    experience: [
      { position: "AI研究总监", company: "科技创新公司", period: "2015-至今" },
      { position: "技术顾问", company: "互联网集团", period: "2012-2015" },
      { position: "研究员", company: "国际AI研究所", period: "2010-2012" }
    ],
    social: {
      website: "https://example.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    },
    featured: true
  }
];

// Mock courses by this instructor with all required fields
const coursesByInstructor = [
  {
    id: 1,
    title: "人工智能基础：从入门到精通",
    instructor: "李明教授",
    category: "技术",
    price: 299,
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    rating: 4.8,
    studentCount: 1250,
    featured: true,
    description: "全面介绍人工智能的基础知识和实践应用",
    duration: "24小时",
    lectures: 42,
    level: "初级到中级",
    requirements: ["基础编程知识", "高中数学"],
  },
  {
    id: 5,
    title: "数据分析与可视化入门",
    instructor: "李明教授",
    category: "技术",
    price: 349,
    imageUrl: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1176&q=80",
    rating: 4.7,
    studentCount: 950,
    featured: false,
    description: "学习如何分析和可视化数据",
    duration: "18小时",
    lectures: 36,
    level: "初级",
    requirements: ["基础统计知识", "Excel基础"],
  },
  {
    id: 9,
    title: "网络安全基础知识",
    instructor: "李明教授",
    category: "技术",
    price: 399,
    imageUrl: "https://images.unsplash.com/photo-1563968743333-b868282eebc4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80",
    rating: 4.8,
    studentCount: 760,
    featured: false,
    description: "网络安全的基础知识和实践技能",
    duration: "20小时",
    lectures: 38,
    level: "初级到中级",
    requirements: ["基础网络知识", "计算机基础"],
  },
  {
    id: 11,
    title: "前端开发全栈技能",
    instructor: "李明教授",
    category: "技术",
    price: 349,
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1172&q=80",
    rating: 4.9,
    studentCount: 1450,
    featured: false,
    description: "从零开始学习前端开发技能",
    duration: "30小时",
    lectures: 56,
    level: "初级到高级",
    requirements: ["HTML基础", "CSS基础", "JavaScript基础"],
  },
  {
    id: 13,
    title: "Python编程实战",
    instructor: "李明教授",
    category: "技术",
    price: 279,
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
    rating: 4.7,
    studentCount: 1120,
    featured: false,
    description: "Python编程语言的实战应用",
    duration: "22小时",
    lectures: 45,
    level: "初级",
    requirements: ["基础编程概念", "逻辑思维"],
  }
];

const InstructorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const instructorId = Number(id);
  const instructor = instructorsData.find(i => i.id === instructorId);
  
  if (!instructor) {
    return (
      <div>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">导师未找到</h1>
          <p>抱歉，您查找的导师不存在。</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            返回上一页
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="bg-knowledge-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="md:w-1/4">
              <img 
                src={instructor.imageUrl}
                alt={instructor.name}
                className="w-48 h-48 md:w-full md:h-auto rounded-full md:rounded-lg object-cover"
              />
            </div>
            <div className="md:w-3/4 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{instructor.name}</h1>
              <p className="text-xl opacity-90 mb-4">{instructor.title}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span>4.9 导师评分</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span>{instructor.courseCount} 门课程</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{instructor.studentCount} 名学员</span>
                </div>
              </div>
              
              <p className="mb-6 max-w-3xl">{instructor.bio}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {instructor.social.website && (
                  <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-knowledge-dark">
                    <Link className="h-4 w-4 mr-2" />
                    个人网站
                  </Button>
                )}
                {instructor.social.linkedin && (
                  <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-knowledge-dark">
                    领英
                  </Button>
                )}
                {instructor.social.twitter && (
                  <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-knowledge-dark">
                    推特
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="courses" className="data-[state=active]:bg-knowledge-primary data-[state=active]:text-white">课程</TabsTrigger>
              <TabsTrigger value="about" className="data-[state=active]:bg-knowledge-primary data-[state=active]:text-white">关于导师</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses" className="mt-0">
              <h2 className="text-2xl font-bold mb-6">导师的课程</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {coursesByInstructor.map(course => (
                  <CourseCard 
                    key={course.id} 
                    {...course} 
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="about" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">专业领域</h2>
                    <div className="flex flex-wrap gap-2">
                      {instructor.expertise.map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-knowledge-soft text-knowledge-primary rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">工作经历</h2>
                    <div className="space-y-4">
                      {instructor.experience.map((exp, index) => (
                        <div key={index} className="border-l-4 border-knowledge-primary pl-4 py-1">
                          <h3 className="font-bold">{exp.position}</h3>
                          <p className="text-gray-600">{exp.company} · {exp.period}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold mb-4">教育背景</h2>
                    <div className="space-y-4">
                      {instructor.education.map((edu, index) => (
                        <div key={index} className="border-l-4 border-knowledge-primary pl-4 py-1">
                          <h3 className="font-bold">{edu.degree}</h3>
                          <p className="text-gray-600">{edu.school} · {edu.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-knowledge-gray rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">导师统计</h3>
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-knowledge-soft flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-knowledge-primary" />
                        </div>
                        <div>
                          <p className="text-gray-600">总课程数</p>
                          <p className="font-bold text-lg">{instructor.courseCount}</p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-knowledge-soft flex items-center justify-center">
                          <Users className="h-5 w-5 text-knowledge-primary" />
                        </div>
                        <div>
                          <p className="text-gray-600">总学员数</p>
                          <p className="font-bold text-lg">{instructor.studentCount}</p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-knowledge-soft flex items-center justify-center">
                          <Star className="h-5 w-5 text-knowledge-primary" />
                        </div>
                        <div>
                          <p className="text-gray-600">平均评分</p>
                          <p className="font-bold text-lg">4.9</p>
                        </div>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-knowledge-soft flex items-center justify-center">
                          <Award className="h-5 w-5 text-knowledge-primary" />
                        </div>
                        <div>
                          <p className="text-gray-600">教学经验</p>
                          <p className="font-bold text-lg">10+ 年</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default InstructorDetail;
