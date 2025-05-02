
import React from 'react';
import { Mail, Phone, MapPin, Globe, ExternalLink, MessageSquare } from 'lucide-react';
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { handleContactMethodsQueryError, ContactMethod } from "@/lib/supabaseUtils";
import { useTranslations } from "@/hooks/useTranslations";
import { Link } from 'react-router-dom';
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface FooterLink {
  href: string;
  label: string;
  translationKey: string;
  external?: boolean;
}

const Footer = () => {
  const { t } = useTranslations();
  
  const usefulLinks: FooterLink[] = [
    { href: '/courses', label: t('navigation:allCourses'), translationKey: 'navigation:allCourses' },
    { href: '/faq', label: t('common:faq'), translationKey: 'common:faq' },
  ];

  const { data: contactMethods = [] } = useQuery({
    queryKey: ["contact-methods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_methods")
        .select("*")
        .eq("is_active", true as any)
        .order("display_order");
      
      return handleContactMethodsQueryError(data, error);
    },
  });

  const getContactMethodValue = (type: string): string => {
    const method = contactMethods.find(m => m.type === type);
    return method ? method.value : '';
  };

  const email = getContactMethodValue('email') || 'contact@secondrise.com';
  const phone = getContactMethodValue('phone') || '+852 1234 5678';
  const address = getContactMethodValue('address') || 'Hong Kong';
  const whatsapp = getContactMethodValue('whatsapp') || '+852 1234 5678';

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Company & Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center mb-4">
              <Logo />
            </div>
            <p className="text-gray-300 mb-4">
              SecondRise - {t('common:ecommerceEducationPlatform')}
            </p>
            <p className="text-gray-400 text-sm mb-2">
              Mandarin (Hong Kong) International Limited
            </p>
            <div className="flex items-center space-x-4 mt-6">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold mb-4">{t('common:quickLinks')}</h3>
            <ul className="space-y-2">
              {usefulLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a 
                      href={link.href} 
                      className="text-gray-300 hover:text-white transition-colors flex items-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t(link.translationKey)}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  ) : (
                    <Link to={link.href} className="text-gray-300 hover:text-white transition-colors">
                      {t(link.translationKey)}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-semibold mb-4">{t('common:contactUs')}</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">{email}</a>
              </div>
              <div className="flex items-center text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <a href={`tel:${phone}`} className="hover:text-white transition-colors">{phone}</a>
              </div>
              <div className="flex items-center text-gray-300">
                <MessageSquare className="h-4 w-4 mr-2" />
                <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp: {whatsapp}
                </a>
              </div>
              <div className="flex items-start text-gray-300">
                <MapPin className="h-4 w-4 mr-2 mt-1" />
                <span>{address}</span>
              </div>
            </div>
          </div>
          
          {/* Language & Legal */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">{t('common:language')}</h3>
            <div className="mb-6">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
        
        {/* Moved policy links to copyright row */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-3 md:space-y-0">
            <p className="text-gray-400 text-sm mr-4">© {new Date().getFullYear()} SecondRise. Mandarin (Hong Kong) International Limited. {t('common:allRightsReserved')}</p>
            <div className="flex items-center space-x-4">
              <Link to="/terms-of-use" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('common:termsOfUse')}
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('common:privacyPolicy')}
              </Link>
              <span className="text-gray-600">|</span>
              <Link to="/cookie-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                {t('common:cookiePolicy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
