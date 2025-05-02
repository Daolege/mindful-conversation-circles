
import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslations } from "@/hooks/useTranslations";
import CountryFlag from './CountryFlag';
import PaymentIcons from './PaymentIcons';

const GlobalOffices: React.FC = () => {
  const { t } = useTranslations();
  
  return (
    <div>
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
  );
};

export default GlobalOffices;
