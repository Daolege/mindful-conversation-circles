
import React from 'react';
import { Globe } from 'lucide-react';
import { useTranslations } from "@/hooks/useTranslations";
import CountryFlag from './CountryFlag';
import { useIsMobile } from "@/hooks/use-mobile";

const GlobalOffices: React.FC = () => {
  const { t } = useTranslations();
  const isMobile = useIsMobile();
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4 text-white flex items-center">
        <Globe className="h-4 w-4 mr-2 text-[#999999]" />
        {t('common:globalOffices')}
      </h3>
      
      <div className="space-y-4">
        {/* 北美地区 - 紧凑布局 */}
        <div>
          <h4 className="text-[#BBBBBB] font-medium mb-2 text-sm">北美地区</h4>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2">
            <CountryFlag countryCode="us" countryName="美国" />
            <CountryFlag countryCode="ca" countryName="加拿大" />
          </div>
        </div>
        
        {/* 欧洲地区 - 增加列数且更紧凑 */}
        <div>
          <h4 className="text-[#BBBBBB] font-medium mb-2 text-sm">欧洲地区</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-2">
            <CountryFlag countryCode="gb" countryName="英国" />
            <CountryFlag countryCode="es" countryName="西班牙" />
            <CountryFlag countryCode="fr" countryName="法国" />
            <CountryFlag countryCode="de" countryName="德国" />
            <CountryFlag countryCode="it" countryName="意大利" />
            <CountryFlag countryCode="ie" countryName="爱尔兰" />
          </div>
        </div>
        
        {/* 东南亚地区 - 紧凑布局 */}
        <div>
          <h4 className="text-[#BBBBBB] font-medium mb-2 text-sm">东南亚地区</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-2">
            <CountryFlag countryCode="vn" countryName="越南" />
            <CountryFlag countryCode="ph" countryName="菲律宾" />
            <CountryFlag countryCode="my" countryName="马来西亚" />
            <CountryFlag countryCode="th" countryName="泰国" />
            <CountryFlag countryCode="sg" countryName="新加坡" />
            <CountryFlag countryCode="id" countryName="印尼" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalOffices;
