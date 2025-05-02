
import React from 'react';
import { useTranslations } from "@/hooks/useTranslations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/config/site";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Import refactored components
import ContactInfo from './footer/ContactInfo';
import SocialLinks from './footer/SocialLinks';
import GlobalOffices from './footer/GlobalOffices';

// 新的站点设置类型
type SiteSettings = {
  contact_email?: string;
  support_phone?: string;
  site_description?: string;
};

const Footer = () => {
  const { t } = useTranslations();
  
  // 使用简化的查询
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

  // 安全访问数据并设置联系信息
  const emails = ["secondrise@secondrise.com", "info@secondrise.com"];
  const phones = ["+85298211389", "+1(202)2099688"];
  const location = "Hong Kong";
  
  return (
    <footer className="bg-[#1a202c] text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* 公司信息 */}
          <div className="md:col-span-4 flex flex-col">
            <div className="flex items-center mb-4">
              <Logo variant="default" />
            </div>
            <p className="text-[#999999] mb-6">{t('common:footerCompanyDescription')}</p>
            
            {/* 社交媒体链接 */}
            <SocialLinks />
            
            {/* 语言切换器 */}
            <LanguageSwitcher variant="footer" className="bg-[#333333] text-white border-[#404040]" />
          </div>
          
          {/* 联系和法律信息 */}
          <div className="md:col-span-3 space-y-1.5">
            <h3 className="text-lg font-medium mb-4 text-white">{t('common:contactAndSupport')}</h3>
            <ContactInfo 
              emails={emails}
              phones={phones}
              location={location}
            />
          </div>
          
          {/* 全球办公室 */}
          <div className="md:col-span-5">
            <GlobalOffices />
          </div>
        </div>
        
        <Separator className="my-6 bg-[#3A3A3A]" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center text-[#999999] text-sm">
          <p>© {new Date().getFullYear()} SecondRise. Mandarin (Hong Kong) International Limited. 版权所有</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="/privacy-policy" className="hover:text-white transition-colors">{t('common:privacyPolicy')}</a>
            <a href="/terms-of-use" className="hover:text-white transition-colors">{t('common:termsOfUse')}</a>
            <a href="/cookie-policy" className="hover:text-white transition-colors">{t('common:cookiePolicy')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
