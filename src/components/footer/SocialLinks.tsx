
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { socialMediaService, SocialMediaLink } from '@/lib/supabaseUtils';
import { defaultSocialMediaLinks } from '@/lib/defaultData';

const SocialLinks: React.FC = () => {
  // Fetch social media links from the database using our service
  const { data: socialLinks = [], isError } = useQuery({
    queryKey: ['social-media-links'],
    queryFn: async () => {
      try {
        // Use our service function instead of direct Supabase call
        return await socialMediaService.getAll();
      } catch (error) {
        console.error("Error fetching social media links:", error);
        return defaultSocialMediaLinks;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use database links if available, otherwise use defaults
  const linksToDisplay = (!isError && socialLinks.length > 0) ? socialLinks : defaultSocialMediaLinks;

  return (
    <div className="flex space-x-3 mb-6">
      {linksToDisplay.map((link, index) => (
        <a 
          key={`social-${index}`} 
          href={link.url} 
          className="group bg-[#2d3748] hover:bg-[#3a4358] rounded-full p-2 transition-all hover:scale-110"
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
        >
          <img 
            src={link.icon_url} 
            alt={link.name} 
            className="h-5 w-5 object-contain"
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
