
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AnimatedCollapsibleProps {
  children: React.ReactNode;
  headerContent: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const AnimatedCollapsible: React.FC<AnimatedCollapsibleProps> = ({
  children,
  headerContent,
  isOpen,
  onToggle,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`border rounded-lg overflow-hidden ${className} transition-all duration-300 ease-in-out ${
        isOpen ? 'shadow-md' : 'shadow-sm'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onToggle}
        className={`w-full flex justify-between items-center p-4 text-left transition-all duration-300 ease-in-out ${
          isHovered ? 'bg-gray-50' : 'bg-white'
        } ${isOpen ? 'bg-gray-100' : ''}`}
      >
        {headerContent}
        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-500 ease-in-out ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className={`p-4 border-t transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-[-10px]'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
