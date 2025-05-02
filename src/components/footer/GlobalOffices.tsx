
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
      
      {/* 所有国家排列在一个矩阵内 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mb-6">
        <CountryFlag countryCode="us" countryName="United States" />
        <CountryFlag countryCode="ca" countryName="Canada" />
        <CountryFlag countryCode="mx" countryName="Mexico" />
        <CountryFlag countryCode="gb" countryName="United Kingdom" />
        <CountryFlag countryCode="de" countryName="Germany" />
        <CountryFlag countryCode="fr" countryName="France" />
        <CountryFlag countryCode="sg" countryName="Singapore" />
        <CountryFlag countryCode="hk" countryName="Hong Kong" />
        <CountryFlag countryCode="jp" countryName="Japan" />
        <CountryFlag countryCode="au" countryName="Australia" />
        <CountryFlag countryCode="id" countryName="Indonesia" />
      </div>
      
      {/* Payments */}
      <div>
        <h4 className="text-[#999999] font-medium mb-2">{t('common:acceptedPayments')}</h4>
        <PaymentIcons />
      </div>
    </div>
  );
};

export default GlobalOffices;
