
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-gray-800 to-black">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">准备好开始您的学习之旅了吗？</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            加入我们的学习社区，获取最新的知识和技能，拓展您的职业发展空间
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/courses">
              <Button size="lg" className="bg-white text-gray-800 hover:bg-gray-100 hover:text-gray-900 rounded-10">
                浏览课程
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-700 text-white border border-gray-700 rounded-10">
                免费注册
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-80">
            已有账号？ <Link to="/login" className="underline">登录</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
