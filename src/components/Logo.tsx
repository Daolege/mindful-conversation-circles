
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Logo = ({ 
  className = "", 
  showText = true,
  size = "default",
  variant = "default"
}: { 
  className?: string;
  showText?: boolean;
  size?: "default" | "small";
  variant?: "default" | "auth";
}) => {
  const sizeClasses = {
    default: "w-12 h-12 text-2xl",
    small: "w-10 h-10 text-xl"
  };

  // Change text color to pure black for the website name
  const textColorClass = variant === "auth" 
    ? "text-gray-200" 
    : "text-black";

  return (
    <Link to="/" className="flex items-center">
      <motion.div 
        className={`flex items-center space-x-3 ${className}`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <motion.div 
          className={`
            relative overflow-hidden rounded-10 flex items-center justify-center font-bold
            ${sizeClasses[size]} 
            bg-gradient-to-br from-gray-700 to-gray-900
            shadow-[0_0_15px_rgba(55,55,55,0.2)]
            hover:shadow-[0_0_20px_rgba(55,55,55,0.35)]
            transition-all duration-300
          `}
          whileHover={{ 
            scale: 1.1,
            transition: { duration: 0.3 }
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(160,160,160,0.3),rgba(255,255,255,0))]" />
          <span className="relative z-10 text-white font-black tracking-wider">S</span>
        </motion.div>
        {showText && (
          <motion.span 
            className={`text-2xl font-bold ${textColorClass}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            SecondRise
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
};

export default Logo;
