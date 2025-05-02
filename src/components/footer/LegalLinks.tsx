
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useTranslations } from "@/hooks/useTranslations";

const LegalLinks: React.FC = () => {
  const { t } = useTranslations();
  
  return (
    <div className="pt-4 space-y-1.5">
      <h3 className="text-lg font-medium mb-2 text-white">{t('common:legal')}</h3>
      <div className="flex flex-col space-y-1">
        <Link to="/privacy-policy" className="text-sm text-[#BBBBBB] hover:text-white transition-colors">
          {t('common:privacyPolicy')}
        </Link>
        <Link to="/terms-of-use" className="text-sm text-[#BBBBBB] hover:text-white transition-colors">
          {t('common:termsOfUse')}
        </Link>
        <Link to="/cookie-policy" className="text-sm text-[#BBBBBB] hover:text-white transition-colors">
          {t('common:cookiePolicy')}
        </Link>
        <Link to="/faq" className="text-sm text-[#BBBBBB] hover:text-white transition-colors flex items-center">
          <MessageSquare className="h-3 w-3 mr-1" />
          {t('common:faq')}
        </Link>
      </div>
    </div>
  );
};

export default LegalLinks;
