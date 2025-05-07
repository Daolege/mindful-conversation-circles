
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

  // Enhance content rendering by ensuring images are properly displayed
  const processedContent = content
    .replace(/&lt;img/g, '<img')  // Fix escaped HTML for images
    .replace(/&lt;\/img&gt;/g, '</img>')  // Fix escaped closing tags
    .replace(/&lt;p&gt;/g, '<p>')  // Fix escaped paragraph tags
    .replace(/&lt;\/p&gt;/g, '</p>')  // Fix escaped closing paragraph tags
    .replace(/&lt;/g, '<')  // Fix all remaining escaped opening brackets
    .replace(/&gt;/g, '>'); // Fix all remaining escaped closing brackets

  return (
    <div 
      className={`rich-text-display ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }} 
    />
  );
};

export default RichTextDisplay;
