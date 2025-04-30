
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "王小明",
    role: "软件工程师",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    content: "智慧园的AI课程让我的职业发展更上一层楼。课程内容深入浅出，实践项目丰富，对我的实际工作帮助很大。",
  },
  {
    id: 2,
    name: "李华",
    role: "市场经理",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "作为市场人员，商业课程帮助我理解了更深层次的战略思维。导师们都是行业内的顶尖人才，分享了很多实用案例。",
  },
  {
    id: 3,
    name: "张伟",
    role: "创业者",
    image: "https://randomuser.me/api/portraits/men/62.jpg",
    content: "创业过程中遇到了很多挑战，通过这里的课程，我学到了如何构建可扩展的商业模式，现在公司正在健康成长。",
  },
  {
    id: 4,
    name: "刘丽",
    role: "产品设计师",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    content: "设计课程非常实用，从理论到实践都有详细的讲解和示例。我的设计技能得到了显著提升，也收获了职业圈的人脉。",
  },
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsPerPage = window.innerWidth >= 768 ? 2 : 1;
  const totalPages = Math.ceil(testimonials.length / itemsPerPage);

  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % totalPages);
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + totalPages) % totalPages);
  };

  const visibleTestimonials = testimonials.slice(
    activeIndex * itemsPerPage,
    activeIndex * itemsPerPage + itemsPerPage
  );

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">学员反馈</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            来自我们学员的真实评价，了解他们如何通过我们的课程获得成长
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {visibleTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-knowledge-gray border-none shadow-sm">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-knowledge-primary mb-4 opacity-40" />
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation controls */}
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-knowledge-soft"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex space-x-2 items-center">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    activeIndex === index
                      ? "bg-knowledge-primary"
                      : "bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-knowledge-soft"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
