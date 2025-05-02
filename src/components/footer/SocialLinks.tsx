
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const SocialLinks: React.FC = () => {
  // Fetch social media links from the database
  const { data: socialLinks = [] } = useQuery({
    queryKey: ['social-media-links'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('social_media_links')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error("Error fetching social media links:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Default social links if none are found in the database
  const defaultSocialLinks = [
    {
      name: "Facebook",
      icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/600px-Facebook_Logo_%282019%29.png",
      url: "#"
    },
    {
      name: "Instagram",
      icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png",
      url: "#"
    },
    {
      name: "Twitter",
      icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/X_logo_2023.png/600px-X_logo_2023.png",
      url: "#"
    },
    {
      name: "LinkedIn",
      icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/600px-LinkedIn_logo_initials.png",
      url: "#"
    }
  ];

  // Use database links if available, otherwise use defaults
  const linksToDisplay = socialLinks.length > 0 ? socialLinks : defaultSocialLinks;

  return (
    <div className="flex space-x-4 mb-6">
      {linksToDisplay.map((link, index) => (
        <a 
          key={`social-${index}`} 
          href={link.url} 
          className="hover:scale-110 transition-all"
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
        >
          <img 
            src={link.icon_url} 
            alt={link.name} 
            className="h-8 w-8 rounded-full object-contain"
          />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
