
import { Users, BookOpen, Award, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    id: 1,
    label: "活跃学员",
    value: "10,000+",
    icon: Users,
    description: "来自全国各地的学习者"
  },
  {
    id: 2,
    label: "专业课程",
    value: "200+",
    icon: BookOpen,
    description: "涵盖各个领域的精品课程"
  },
  {
    id: 3,
    label: "行业专家",
    value: "50+",
    icon: Award,
    description: "一流的教师与行业导师"
  },
  {
    id: 4,
    label: "合作企业",
    value: "30+",
    icon: Briefcase,
    description: "提供实习与就业机会"
  }
];

const StatisticsSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wOSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0yaDF2MWgtMXYtMXptLTIgMmgxdjFoLTF2LTF6bS0yLTJoMXYxaC0xdi0xem0yLTJoMXYxaC0xdi0xem0tMiAyaDF2MWgtMXYtMXptLTItMmgxdjFoLTF2LTF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">平台数据</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            智慧园致力于提供优质的在线教育，让知识改变更多人的生活
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {stats.map((stat) => (
            <motion.div 
              key={stat.id} 
              variants={itemVariants}
              className="text-center p-6 rounded-10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:translate-y-[-5px]"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-700/20 flex items-center justify-center transform transition-transform duration-500 hover:scale-110 hover:rotate-6">
                  <stat.icon className="h-8 w-8 text-gray-200" />
                </div>
              </div>
              <h3 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-100 to-white bg-clip-text text-transparent">{stat.value}</h3>
              <p className="font-medium text-lg mb-2 text-white">{stat.label}</p>
              <p className="text-sm text-gray-400">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatisticsSection;
