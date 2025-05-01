
import React from 'react';
import { Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
  variant?: "default" | "outline" | "ghost" | "knowledge" | null;
  mobile?: boolean;
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = "outline", 
  mobile = false,
  className = ""
}) => {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  
  const currentLanguageData = supportedLanguages.find(lang => lang.code === currentLanguage) 
    || supportedLanguages[0];

  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
  };

  if (mobile) {
    return (
      <div className={`space-y-2 ${className}`}>
        {supportedLanguages.map((language) => (
          <Button
            key={language.code}
            variant={currentLanguage === language.code ? "default" : "outline"}
            className={`w-full justify-start ${currentLanguage === language.code ? 'bg-knowledge-primary text-white' : ''}`}
            onClick={() => handleLanguageChange(language.code)}
          >
            {language.nativeName}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className={`flex items-center gap-2 ${className}`}>
          <Globe size={16} />
          <span className="hidden md:inline">{currentLanguageData.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((language) => (
          <DropdownMenuItem 
            key={language.code}
            className={currentLanguage === language.code ? 'bg-muted' : ''}
            onClick={() => handleLanguageChange(language.code)}
          >
            {language.nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
