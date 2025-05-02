
import React from 'react';
import { Mail, MapPin, Globe, MessageSquare, Facebook, Instagram, Twitter, Linkedin, Phone } from 'lucide-react';
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from 'react-router-dom';
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Separator } from "@/components/ui/separator";

// Country flag component
const CountryFlag = ({ countryCode, countryName }) => (
  <div className="flex items-center space-x-2 mb-2 group">
    <img 
      src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png 2x,
              https://flagcdn.com/72x54/${countryCode.toLowerCase()}.png 3x`}
      width="24" 
      height="18"
      alt={`${countryName} flag`} 
      className="rounded-sm shadow-sm transition-all group-hover:scale-110"
    />
    <span className="text-sm text-[#E5E5E5] group-hover:text-white transition-all">{countryName}</span>
  </div>
);

// Payment method icons as SVG components
const PaymentIcons = () => {
  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {/* Visa */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#1434CB">
          <path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3c.433 0 .822.287.918.783l.839 4.468L7.15 8.262h1.962zm7.453 5.035c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628.279-.036 1.043-.064 1.911.333l.339-1.589c-.466-.169-1.067-.332-1.814-.332-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.039.756.367 1.01.603.006.985-.516.255-1.236.292-1.95.075-.471-.14-.719-.315-.929-.505l-.341 1.597c.212.097 1.109.464 2.221.464 2.099 0 3.474-1.008 3.482-2.573l-.014-.368zm5.24.004l1.447-1.584-1.005-1.606h-1.3l.639 1.033-.789 1.134-.743-1.134.647-1.033h-2.025l-1.475 1.581.984 1.609h1.309l-.634-1.035.783-1.142.752 1.142-.65 1.035h2.06zM13.49 8.262l-1.548 7.496h-1.852l1.547-7.496h1.853z"/>
        </svg>
      </div>
      
      {/* Mastercard */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <defs>
            <mask id="mastercard-circle-mask">
              <rect width="100%" height="100%" fill="white"/>
              <circle cx="9" cy="12" r="7" fill="black"/>
            </mask>
          </defs>
          <circle cx="9" cy="12" r="7" fill="#EB001B"/>
          <circle cx="15" cy="12" r="7" fill="#F79E1B"/>
          <circle cx="12" cy="12" r="7" fill="#FF5F00" mask="url(#mastercard-circle-mask)"/>
        </svg>
      </div>
      
      {/* American Express */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#006FCF">
          <path d="M22.588 10.516h-1.23l-0.885-2.126h-0.026v2.126h-1.097v-4.866h2.001c1.075 0 1.664 0.696 1.664 1.444 0 0.961-0.666 1.297-0.794 1.359zM21.184 8.318c0.429 0 0.575-0.356 0.575-0.57 0-0.222-0.146-0.577-0.575-0.577h-0.736v1.147h0.736zM20.413 15.001h-1.215l-1.16-1.776h-0.026v1.776h-1.056l-0.378-0.917h-2.028l-0.369 0.917h-1.333l1.993-4.865h1.641l1.804 4.403v-4.403h1.768l1.05 1.603 0.978-1.603h1.783v4.865h-1.109v-3.74h-0.025l-1.275 2.098h-0.883zM17.183 8.58l-0.663 1.675h1.373l-0.71-1.675zM14.398 10.76l0.616-1.782-0.026-0.002-1.468 3.59h-0.577l-1.47-3.588h-0.025l0.616 1.782h-0.908l-0.438-1.076h-2.339l-0.453 1.076h-1.059l1.94-4.866h1.684l1.85 4.575v-4.575h1.855l1.319 2.882 1.207-2.882h1.823v4.866h-1.049v-3.747h-0.023l-1.361 2.212h-0.911zM8 8.317l-0.88-2.086h-0.025v2.086h-1.043v-2.667h1.599l0.805 1.892 0.807-1.892h1.598v2.667h-1.042v-2.086h-0.026l-0.88 2.086h-0.907zM16.988 13.764l-0.766-1.772h-0.023l0.118 1.772h-2.32v-0.595h-2.586l-0.149 0.595h-1.278c-0.562 0-1.293-0.127-1.712-0.542-0.428-0.425-0.481-1.002-0.481-1.482 0-0.439 0.053-1.046 0.506-1.482 0.293-0.271 0.743-0.419 1.283-0.419h0.904v1.017h-0.874c-0.201 0-0.33 0.028-0.456 0.164-0.105 0.116-0.178 0.32-0.178 0.562 0 0.244 0.095 0.439 0.21 0.544 0.103 0.106 0.254 0.146 0.422 0.146h0.544l1.699-2.433h1.77l2.037 2.91v-2.91h1.752l1.018 2.113 0.932-2.113h1.783v4.865h-1.118v-3.329h-0.023l-1.354 3.329h-0.937zM11.637 12.673h1.564l-0.855-1.228-0.783 1.119-0.052 0.109h0.126z"/>
        </svg>
      </div>
      
      {/* UnionPay */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <rect x="1" y="6" width="22" height="12" rx="2" fill="#0D6AB7"/>
          <rect x="1" y="10" width="7" height="8" fill="#D42E2E"/>
          <rect x="8" y="10" width="7" height="8" fill="#1FA346"/>
          <rect x="15" y="10" width="8" height="8" fill="#F9AC1D"/>
          <path d="M3 14 H6 V15 H3 V14" fill="white"/>
          <path d="M10 14 H13 V15 H10 V14" fill="white"/>
          <path d="M17 14 H20 V15 H17 V14" fill="white"/>
        </svg>
      </div>
      
      {/* PayPal */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#003087">
          <path d="M7.076 21.337H2.47a.389.389 0 0 1-.392-.356L.006 2.859A.389.389 0 0 1 .394 2.5h8.233c2.74 0 4.75.65 6.075 1.959 1.281 1.281 1.773 2.934 1.466 4.925-.307 1.991-1.359 3.593-2.975 4.52-1.616.927-3.763 1.406-6.482 1.406h-2.93a.39.39 0 0 0-.39.354l-1.027 6.028a.389.389 0 0 1-.391.354l-5.027.25a.466.466 0 0 0 .13.041zm4.413-9.433c2.83 0 4.694-.52 6.084-1.591 1.39-1.072 2.229-2.76 2.229-5.046 0-1.548-.514-2.767-1.535-3.594C17.247 1.044 15.635.5 13.259.5H5.568a.773.773 0 0 0-.771.686L2.704 15.433a.778.778 0 0 0 .77.904h4.207a.778.778 0 0 0 .771-.686l.456-2.683a.778.778 0 0 1 .77-.686h1.813z"/>
        </svg>
      </div>
      
      {/* Apple Pay */}
      <div className="bg-white rounded-md p-1 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path d="M7.078 5.396c.381-.6.571-1.121.571-1.886-.552.03-1.221.368-1.622.833-.354.41-.667.996-.667 1.771.614.05 1.232-.32 1.718-.718zm1.86 5.772c-.599.878-1.222 1.75-2.19 1.75-.958 0-1.264-.565-2.36-.565-1.11 0-1.416.55-2.332.55-2.424 0-4.056-4.138-4.056-6.51v-.465c0-1.52.599-2.942 1.62-3.794C.66 2.494 1.995 2.134 3.077 2.134c.982 0 1.802.58 2.424.58.597 0 1.529-.595 2.687-.595.433 0 1.997.059 2.937.985-2.574 1.009-2.195 3.68.19 5.09-.401.705-.874 1.38-1.377 1.973z" fill="#000000"/>
          <path d="M18.375 16.805c.387 0 .738.046.974.134v-3.178c.007-.137.02-.27.043-.396l.003-.017c.046-.268.11-.469.192-.606l.013-.022c.162-.255.487-.434.973-.535v-.25c-.82 0-1.355.518-1.608 1.005a6.32 6.32 0 0 0-.36.855 6.772 6.772 0 0 0-.188.801c-.021.12-.038.242-.052.368v1.841z" fill="#000000"/>
        </svg>
      </div>
    </div>
  );
};

// Define a simple interface for contact methods returned from Supabase
interface ContactMethodsData {
  contact_email?: string;
  support_phone?: string;
  site_description?: string;
  [key: string]: any;
}

const Footer = () => {
  const { t } = useTranslations();
  
  // Query for contact methods
  const { data: contactMethods = {} as ContactMethodsData, isLoading: isLoadingContactMethods } = useQuery({
    queryKey: ['contact-methods'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('category', 'contact_methods')
          .single();
        
        if (error) throw error;
        return data || {} as ContactMethodsData;
      } catch (error) {
        console.error("Error fetching contact methods:", error);
        return {} as ContactMethodsData;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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
            <div className="flex space-x-4 mb-6">
              <a href="#" className="bg-[#333333] hover:bg-knowledge-primary transition-all p-2 rounded-full">
                <Facebook className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="bg-[#333333] hover:bg-knowledge-primary transition-all p-2 rounded-full">
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="bg-[#333333] hover:bg-knowledge-primary transition-all p-2 rounded-full">
                <Twitter className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="bg-[#333333] hover:bg-knowledge-primary transition-all p-2 rounded-full">
                <Linkedin className="h-5 w-5 text-white" />
              </a>
            </div>
            
            {/* Language Switcher */}
            <LanguageSwitcher variant="footer" className="bg-[#333333] text-white border-[#404040]" />
          </div>
          
          {/* Contact and Legal */}
          <div className="md:col-span-3 space-y-1.5">
            <h3 className="text-lg font-medium mb-4 text-white">{t('common:contactAndSupport')}</h3>
            {contactMethods.contact_email && (
              <div className="flex items-center group">
                <Mail className="h-4 w-4 mr-2 text-[#999999] group-hover:text-knowledge-primary transition-colors" />
                <a href={`mailto:${contactMethods.contact_email}`} className="text-sm text-[#BBBBBB] hover:text-white transition-colors">
                  {contactMethods.contact_email}
                </a>
              </div>
            )}
            {contactMethods.support_phone && (
              <div className="flex items-center group">
                <Phone className="h-4 w-4 mr-2 text-[#999999] group-hover:text-knowledge-primary transition-colors" />
                <a href={`https://wa.me/${contactMethods.support_phone.replace(/\D/g, '')}`} className="text-sm text-[#BBBBBB] hover:text-white transition-colors">
                  {contactMethods.support_phone}
                </a>
              </div>
            )}
            {siteConfig.address && (
              <div className="flex items-start group">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-[#999999] group-hover:text-knowledge-primary transition-colors" />
                <span className="text-sm text-[#BBBBBB] group-hover:text-white transition-colors">
                  {siteConfig.address}
                </span>
              </div>
            )}
            
            <div className="pt-4 space-y-1.5">
              <h3 className="text-lg font-medium mb-2 text-white">{t('common:legal')}</h3>
              <div className="flex flex-col space-y-1">
                <Link to="/privacy-policy" className="text-sm text-[#BBBBBB] hover:text-white transition-colors">{t('common:privacyPolicy')}</Link>
                <Link to="/terms-of-use" className="text-sm text-[#BBBBBB] hover:text-white transition-colors">{t('common:termsOfUse')}</Link>
                <Link to="/cookie-policy" className="text-sm text-[#BBBBBB] hover:text-white transition-colors">{t('common:cookiePolicy')}</Link>
                <Link to="/faq" className="text-sm text-[#BBBBBB] hover:text-white transition-colors flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {t('common:faq')}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Global Offices */}
          <div className="md:col-span-5">
            <h3 className="text-lg font-medium mb-4 text-white flex items-center">
              <Globe className="h-4 w-4 mr-2 text-[#999999]" />
              {t('common:globalOffices')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* North America */}
              <div>
                <h4 className="text-[#999999] font-medium mb-2">{t('common:northAmerica')}</h4>
                <CountryFlag countryCode="us" countryName="United States" />
                <CountryFlag countryCode="ca" countryName="Canada" />
                <CountryFlag countryCode="mx" countryName="Mexico" />
              </div>
              
              {/* Europe */}
              <div>
                <h4 className="text-[#999999] font-medium mb-2">{t('common:europe')}</h4>
                <CountryFlag countryCode="gb" countryName="United Kingdom" />
                <CountryFlag countryCode="de" countryName="Germany" />
                <CountryFlag countryCode="fr" countryName="France" />
              </div>
              
              {/* Asia Pacific */}
              <div>
                <h4 className="text-[#999999] font-medium mb-2">{t('common:asiaPacific')}</h4>
                <CountryFlag countryCode="au" countryName="Australia" />
                <CountryFlag countryCode="sg" countryName="Singapore" />
                <CountryFlag countryCode="jp" countryName="Japan" />
              </div>
              
              {/* Payments */}
              <div>
                <h4 className="text-[#999999] font-medium mb-2">{t('common:acceptedPayments')}</h4>
                <PaymentIcons />
              </div>
            </div>
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
