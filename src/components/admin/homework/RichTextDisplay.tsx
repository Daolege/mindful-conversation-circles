
import React from 'react';
import './RichTextDisplay.css';

interface RichTextDisplayProps {
  content?: string;
  className?: string;
}

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  className = "" 
}) => {
  if (!content) return null;

  return (
    <div 
      className={`rich-text-display ${className}`}
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
};

export default RichTextDisplay;
