
import React from 'react';
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  gradient?: string;
}

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  delay = 0,
  gradient = "from-gray-50 to-gray-100" 
}: FeatureCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="group cursor-pointer"
    >
      <div className={`p-6 rounded-xl bg-white border border-gray-200 
        hover:border-gray-300 transition-all duration-300 relative overflow-hidden shadow-lg`}>
        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300" />
        
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} 
          flex items-center justify-center text-black mb-4
          shadow-lg shadow-gray-200/50 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        
        <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
        <p className="text-gray-700">{description}</p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
