
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
import PaymentIcons from './footer/PaymentIcons';

// 站点设置类型
type SiteSettings = {
  contact_email?: string;
  support_phone?: string;
  site_description?: string;
  company_name?: string;
  company_full_name?: string;
  copyright_text?: string;
};

const Footer = () => {
  const { t } = useTranslations();
  
  // 使用查询获取站点设置
  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
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

  // 获取联系方式
  const { data: contactMethods = [] } = useQuery({
    queryKey: ['contact-methods'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('contact_methods')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error("Error fetching contact methods:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // 获取邮箱和电话联系方式
  const emails = contactMethods
    .filter(method => method.type === 'email')
    .map(method => method.value);
  
  const phones = contactMethods
    .filter(method => method.type === 'phone' || method.type === 'whatsapp')
    .map(method => method.value);
  
  // 获取地址
  const locations = contactMethods
    .filter(method => method.type === 'address')
    .map(method => method.value);
  
  const location = locations.length > 0 ? locations[0] : 'Hong Kong';
  
  // 构建版权信息
  const copyrightText = siteSettings?.copyright_text || 
    `© ${new Date().getFullYear()} ${siteSettings?.company_name || 'SecondRise'}. ${siteSettings?.company_full_name || 'Mandarin (Hong Kong) International Limited'}. 版权所有`;
  
  return (
    <footer className="bg-[#1a202c] text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* 公司信息 */}
          <div className="md:col-span-4 flex flex-col">
            <div className="flex items-center mb-4">
              <Logo variant="default" />
            </div>
            <p className="text-[#999999] mb-6">{siteSettings?.site_description || t('common:footerCompanyDescription')}</p>
            
            {/* 社交媒体链接 */}
            <SocialLinks />
            
            {/* 支付方式图标 - 移动到社交媒体下方 */}
            <div className="mb-6">
              <h4 className="text-[#999999] font-medium mb-2">{t('common:acceptedPayments')}</h4>
              <PaymentIcons />
            </div>
          </div>
          
          {/* 联系信息 - 移除了法律链接 */}
          <div className="md:col-span-3 space-y-1.5">
            <h3 className="text-lg font-medium mb-4 text-white">{t('common:contactAndSupport')}</h3>
            <ContactInfo 
              emails={emails.length > 0 ? emails : ["secondrise@secondrise.com", "info@secondrise.com"]}
              phones={phones.length > 0 ? phones : ["+85298211389", "+1(202)2099688"]}
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
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
            <p>{copyrightText}</p>
            <div className="flex space-x-4">
              <a href="/privacy-policy" className="hover:text-white transition-colors">{t('common:privacyPolicy')}</a>
              <a href="/terms-of-use" className="hover:text-white transition-colors">{t('common:termsOfUse')}</a>
              <a href="/cookie-policy" className="hover:text-white transition-colors">{t('common:cookiePolicy')}</a>
            </div>
          </div>
          
          {/* 语言切换器移动到右下角 */}
          <div className="mt-4 sm:mt-0">
            <LanguageSwitcher variant="footer" className="bg-[#333333] text-white border-[#404040]" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
