
import React from 'react';

interface CountryFlagProps {
  countryCode: string;
  countryName: string;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({ countryCode, countryName }) => (
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

export default CountryFlag;
