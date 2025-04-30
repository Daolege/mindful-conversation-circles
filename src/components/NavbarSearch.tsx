
import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface NavbarSearchProps {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}

export const NavbarSearch = ({
  className = "",
  inputClassName = "",
  placeholder = "搜索课程...",
}: NavbarSearchProps) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.2 }}
    className={`relative ${className}`}
  >
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
    <input
      type="text"
      placeholder={placeholder}
      className={`
        pl-10 pr-4 py-2 rounded-full border border-gray-200 
        focus:outline-none focus:ring-2 focus:ring-knowledge-primary/20 
        focus:border-knowledge-primary/60 
        w-full bg-white/80 backdrop-blur-sm 
        transition-all duration-200
        hover:border-knowledge-primary/40
        ${inputClassName}
      `}
    />
  </motion.div>
);
