
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { handleContactMethodsQueryError, ContactMethod } from "@/lib/supabaseUtils";
import { useTranslations } from "@/hooks/useTranslations";

interface FooterLink {
  href: string;
  label: string;
  translationKey: string;
}

const Footer = () => {
  const { t } = useTranslations();
  
  const usefulLinks: FooterLink[] = [
    { href: '/courses', label: t('navigation:allCourses'), translationKey: 'navigation:allCourses' },
    { href: '/about', label: t('navigation:aboutUs'), translationKey: 'navigation:aboutUs' },
    { href: '/faq', label: t('common:faq'), translationKey: 'common:faq' },
    { href: '/terms', label: t('common:termsOfService'), translationKey: 'common:termsOfService' },
    { href: '/privacy', label: t('common:privacyPolicy'), translationKey: 'common:privacyPolicy' },
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

  const email = getContactMethodValue('email');
  const phone = getContactMethodValue('phone');
  const address = getContactMethodValue('address');

  return (
    <footer className="bg-gray-100 border-t">
      <div className="container py-12 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="font-bold text-xl mb-4">{siteConfig.name}</div>
            <p className="text-gray-600">
              {siteConfig.description}
            </p>
            <div className="mt-4 space-y-2">
              {email && (
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${email}`}>{email}</a>
                </div>
              )}
              {phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href={`tel:${phone}`}>{phone}</a>
                </div>
              )}
              {address && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="font-bold text-lg mb-4">{t('common:quickLinks')}</div>
            <ul className="space-y-2">
              {usefulLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-gray-600 hover:text-gray-800">
                    {t(link.translationKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-bold text-lg mb-4">{t('common:subscribeToUs')}</div>
            <p className="text-gray-600 mb-4">
              {t('common:subscribeDescription')}
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder={t('common:enterYourEmail')}
                className="border rounded-l px-4 py-2 w-3/4 text-gray-700 focus:outline-none"
              />
              <button className="bg-knowledge-primary hover:bg-knowledge-secondary text-white rounded-r px-4 py-2">
                {t('common:subscribe')}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500">
          &copy; {new Date().getFullYear()} {siteConfig.name}. {t('common:allRightsReserved')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
