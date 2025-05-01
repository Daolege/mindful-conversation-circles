
import React, { useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

interface CaptchaProps {
  onChange: (value: string) => void;
}

export const Captcha: React.FC<CaptchaProps> = ({ onChange }) => {
  const [captchaText, setCaptchaText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(false);
  const { t } = useTranslations();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const length = Math.floor(Math.random() * 3) + 4; // Random length between 4-6
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setInputValue('');
    setIsValid(false);
    onChange(''); // Reset validity when generating new captcha
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Case-insensitive comparison for better user experience
    const valid = value.toLowerCase() === captchaText.toLowerCase();
    setIsValid(valid);
    
    // Only pass the captcha value when valid
    onChange(valid ? captchaText : '');
    
    console.log("Captcha validation:", { 
      inputValue: value, 
      captchaText, 
      isValid: valid, 
      passedValue: valid ? captchaText : '' 
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <div 
        className="select-none font-mono text-lg p-2 bg-gray-100 rounded min-w-[100px] text-center"
        style={{
          letterSpacing: '0.25em',
          background: 'linear-gradient(45deg, #f3f4f6 25%, #e5e7eb 25%, #e5e7eb 50%, #f3f4f6 50%, #f3f4f6 75%, #e5e7eb 75%, #e5e7eb)'
        }}
      >
        {captchaText}
      </div>
      <button
        type="button"
        onClick={generateCaptcha}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        {t('common:refresh')}
      </button>
      <input
        type="text"
        value={inputValue}
        className={`flex h-9 w-[120px] rounded-md border ${isValid ? 'border-green-500' : 'border-input'} bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`}
        placeholder={t('auth:enterCaptcha')}
        onChange={handleInputChange}
      />
    </div>
  );
};
