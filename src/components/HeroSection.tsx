
import React, { useState, useEffect } from 'react';
import DynamicBanner from './banner/DynamicBanner';
import { getActiveBanners } from '@/services/bannerService';

const HeroSection = () => {
  const [activeBannerId, setActiveBannerId] = useState("hero-main");
  
  useEffect(() => {
    const loadActiveBanners = async () => {
      try {
        const banners = await getActiveBanners();
        if (banners && banners.length > 0) {
          // Use the first active banner by default
          setActiveBannerId(banners[0].id);
        }
      } catch (error) {
        console.error("Error loading active banners:", error);
      }
    };
    
    loadActiveBanners();
  }, []);
  
  return <DynamicBanner bannerId={activeBannerId} />;
};

export default HeroSection;
