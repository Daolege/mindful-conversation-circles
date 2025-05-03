import React from 'react';
import { useTranslations } from "@/hooks/useTranslations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { siteConfig } from "@/config/site";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
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
    <footer className="bg-[#1a202c] text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        {/* 顶部区域 - 添加语言切换器到右上角 */}
        <div className="flex justify-between items-center mb-8">
          <Logo variant="default" />
          <LanguageSwitcher variant="footer" className="bg-[#333333] text-white border-[#404040]" />
        </div>
        
        {/* 优化的网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10">
          {/* 公司信息 */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <p className="text-[#999999] text-sm leading-relaxed mb-4">{siteSettings?.site_description || t('common:footerCompanyDescription')}</p>
            
            {/* 社交媒体链接 */}
            <SocialLinks />
            
            {/* 支付方式图标 */}
            <div>
              <h4 className="text-[#999999] font-medium mb-3">{t('common:acceptedPayments')}</h4>
              <PaymentIcons />
            </div>
          </div>
          
          {/* 中间区域 - 联系信息 */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            {/* 联系信息 */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-white">{t('common:contactAndSupport')}</h3>
              <ContactInfo 
                emails={emails.length > 0 ? emails : ["secondrise@secondrise.com", "info@secondrise.com"]}
                phones={phones.length > 0 ? phones : ["+85298211389", "+1(202)2099688"]}
                location={location}
              />
            </div>
          </div>
          
          {/* 右侧区域 - 全球办公室 */}
          <div className="lg:col-span-5">
            <GlobalOffices />
          </div>
        </div>
        
        {/* 使用更明显的分隔线 */}
        <Separator className="my-8 bg-[#3A3A3A] opacity-60" />
        
        {/* 改进的底部版权区域 - 移除重复的法律链接 */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-[#999999] text-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4 sm:mb-0">
            <p className="text-center sm:text-left">{copyrightText}</p>
          </div>
          
          {/* 法律链接作为内联链接 */}
          <div className="flex space-x-4 sm:space-x-6 mb-6 sm:mb-0 text-xs sm:text-sm">
            <a href="/privacy-policy" className="hover:text-white transition-colors">{t('common:privacyPolicy')}</a>
            <a href="/terms-of-use" className="hover:text-white transition-colors">{t('common:termsOfUse')}</a>
            <a href="/cookie-policy" className="hover:text-white transition-colors">{t('common:cookiePolicy')}</a>
            <a href="/faq" className="hover:text-white transition-colors">{t('common:faq')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
