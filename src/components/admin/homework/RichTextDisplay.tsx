
import React, { useState } from 'react';
import './RichTextDisplay.css';

interface RichTextDisplayProps {
  content?: string;
  className?: string;
}

export const RichTextDisplay: React.FC<RichTextDisplayProps> = ({ 
  content, 
  className = "" 
}) => {
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  
  if (!content) return null;
  
  // Enhanced content processing with image loading state handling
  const processContent = () => {
    // First replace common HTML entities and tags
    let processedContent = content
      .replace(/&lt;img/g, '<img')
      .replace(/&lt;\/img&gt;/g, '</img>')
      .replace(/&lt;p&gt;/g, '<p>')
      .replace(/&lt;\/p&gt;/g, '</p>')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    
    // Extract all image URLs to set up loading states
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    const imageUrls: string[] = [];
    
    while ((match = imgRegex.exec(processedContent)) !== null) {
      if (match[1]) imageUrls.push(match[1]);
    }
    
    // Add loading attributes to images
    if (imageUrls.length > 0) {
      processedContent = processedContent.replace(
        /<img([^>]+)src="([^">]+)"([^>]*)>/g, 
        '<img$1src="$2"$3 loading="lazy" onload="this.classList.add(\'loaded\')" onerror="this.classList.add(\'error\')">'
      );
    }
    
    return processedContent;
  };
  
  const processedContent = processContent();

  return (
    <div 
      className={`rich-text-display ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }} 
    />
  );
};

export default RichTextDisplay;
