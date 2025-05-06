
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
      className={`border rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onToggle}
        className={`w-full flex justify-between items-center p-4 text-left transition-colors ${
          isHovered ? 'bg-gray-50' : 'bg-white'
        }`}
      >
        {headerContent}
        <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 border-t">
          {children}
        </div>
      </div>
    </div>
  );
};
