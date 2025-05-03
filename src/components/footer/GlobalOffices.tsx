
import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslations } from "@/hooks/useTranslations";
import CountryFlag from './CountryFlag';

const GlobalOffices: React.FC = () => {
  const { t } = useTranslations();
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4 text-white flex items-center">
        <Globe className="h-4 w-4 mr-2 text-[#999999]" />
        {t('common:globalOffices')}
      </h3>
      
      {/* 北美地区 */}
      <div className="mb-4">
        <h4 className="text-white font-medium mb-2">北美地区</h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          <CountryFlag countryCode="us" countryName="美国" />
          <CountryFlag countryCode="ca" countryName="加拿大" />
        </div>
      </div>
      
      {/* 欧洲地区 */}
      <div className="mb-4">
        <h4 className="text-white font-medium mb-2">欧洲地区</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
          <CountryFlag countryCode="gb" countryName="英国" />
          <CountryFlag countryCode="es" countryName="西班牙" />
          <CountryFlag countryCode="fr" countryName="法国" />
          <CountryFlag countryCode="de" countryName="德国" />
          <CountryFlag countryCode="it" countryName="意大利" />
          <CountryFlag countryCode="ie" countryName="爱尔兰" />
        </div>
      </div>
      
      {/* 东南亚地区 */}
      <div className="mb-4">
        <h4 className="text-white font-medium mb-2">东南亚地区</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
          <CountryFlag countryCode="vn" countryName="越南" />
          <CountryFlag countryCode="ph" countryName="菲律宾" />
          <CountryFlag countryCode="my" countryName="马来西亚" />
          <CountryFlag countryCode="th" countryName="泰国" />
          <CountryFlag countryCode="sg" countryName="新加坡" />
          <CountryFlag countryCode="id" countryName="印尼" />
        </div>
      </div>
    </div>
  );
};

export default GlobalOffices;
