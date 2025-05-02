
import React from 'react';
import { useTranslations } from "@/hooks/useTranslations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Import refactored components
import ContactInfo from './footer/ContactInfo';
import LegalLinks from './footer/LegalLinks';
import SocialLinks from './footer/SocialLinks';
import GlobalOffices from './footer/GlobalOffices';

// Simple type for site settings data
type SiteSettings = {
  contact_email?: string;
  support_phone?: string;
  site_description?: string;
};

const Footer = () => {
  const { t } = useTranslations();
  
  // Use a direct, simplified query to avoid type depth issues
  const { data } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('contact_email, support_phone, site_description')
          .single();
        
        if (error) {
          console.error("Error fetching site settings:", error);
          return {} as SiteSettings;
        }
        
        return data as SiteSettings;
      } catch (error) {
        console.error("Error in site settings query:", error);
        return {} as SiteSettings;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Safely access data with fallbacks
  const siteSettings = data || {};
  
  return (
    <footer className="bg-[#262626] text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Company info */}
          <div className="md:col-span-4 flex flex-col">
            <div className="flex items-center mb-4">
              <Logo variant="default" />
            </div>
            <p className="text-[#BBBBBB] mb-6">{t('common:footerCompanyDescription')}</p>
            
            {/* Social Media */}
            <SocialLinks />
            
            {/* Language Switcher */}
            <LanguageSwitcher variant="footer" className="bg-[#333333] text-white border-[#404040]" />
          </div>
          
          {/* Contact and Legal */}
          <div className="md:col-span-3 space-y-1.5">
            <h3 className="text-lg font-medium mb-4 text-white">{t('common:contactAndSupport')}</h3>
            <ContactInfo 
              email={siteSettings.contact_email} 
              phone={siteSettings.support_phone} 
            />
            
            <LegalLinks />
          </div>
          
          {/* Global Offices */}
          <div className="md:col-span-5">
            <GlobalOffices />
          </div>
        </div>
        
        <Separator className="my-6 bg-[#3A3A3A]" />
        
        <div className="text-center text-[#999999] text-sm">
          <p>{t('common:copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
