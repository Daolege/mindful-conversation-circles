
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AnimatedCollapsibleProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerContent: React.ReactNode;
  onToggle: () => void;
  showIcons?: boolean;
}

export function AnimatedCollapsible({
  isOpen,
  children,
  className,
  contentClassName,
  headerContent,
  onToggle,
  showIcons = true
}: AnimatedCollapsibleProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(isOpen ? undefined : 0);

  useEffect(() => {
    if (!contentRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (isOpen) {
        setHeight(contentRef.current?.scrollHeight);
      }
    });

    resizeObserver.observe(contentRef.current);
    
    return () => {
      if (contentRef.current) {
        resizeObserver.unobserve(contentRef.current);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setHeight(0);
    } else if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen]);

  return (
    <div className={cn("border rounded-10 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300", className)}>
      <div 
        className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-all duration-300"
        onClick={onToggle}
      >
        {headerContent}
        {showIcons && (
          <div className="flex items-center">
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-500 transition-transform duration-300" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-300" />
            )}
          </div>
        )}
      </div>
      
      <div
        ref={contentRef}
        style={{ height: height !== undefined ? `${height}px` : 'auto' }}
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden bg-white",
          contentClassName
        )}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
