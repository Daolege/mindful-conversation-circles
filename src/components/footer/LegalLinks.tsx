
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, FileText } from 'lucide-react';
import { useTranslations } from "@/hooks/useTranslations";

const LegalLinks: React.FC = () => {
  const { t } = useTranslations();
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4 text-white flex items-center">
        <FileText className="h-4 w-4 mr-2 text-[#999999]" />
        {t('common:legal')}
      </h3>
      <div className="flex flex-col space-y-2.5">
        <Link 
          to="/privacy-policy" 
          className="text-sm text-[#BBBBBB] hover:text-white transition-colors flex items-center group hover:bg-[#2d3748] rounded-md p-1 -ml-1"
        >
          <span className="ml-1.5">{t('common:privacyPolicy')}</span>
        </Link>
        <Link 
          to="/terms-of-use" 
          className="text-sm text-[#BBBBBB] hover:text-white transition-colors flex items-center group hover:bg-[#2d3748] rounded-md p-1 -ml-1"
        >
          <span className="ml-1.5">{t('common:termsOfUse')}</span>
        </Link>
        <Link 
          to="/cookie-policy" 
          className="text-sm text-[#BBBBBB] hover:text-white transition-colors flex items-center group hover:bg-[#2d3748] rounded-md p-1 -ml-1"
        >
          <span className="ml-1.5">{t('common:cookiePolicy')}</span>
        </Link>
        <Link 
          to="/faq" 
          className="text-sm text-[#BBBBBB] hover:text-white transition-colors flex items-center group hover:bg-[#2d3748] rounded-md p-1 -ml-1"
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
          <span>{t('common:faq')}</span>
        </Link>
      </div>
    </div>
  );
};

export default LegalLinks;
