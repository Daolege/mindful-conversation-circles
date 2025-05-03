
import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "@/hooks/useTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCountryCodeForLanguage } from "@/lib/utils/languageUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Language } from "@/lib/services/languageService";

interface LanguageSwitcherProps {
  mobile?: boolean;
  className?: string;
  variant?: "default" | "footer" | "navbar";
}

const LanguageSwitcher = ({ mobile, className, variant = "default" }: LanguageSwitcherProps) => {
  const { currentLanguage, changeLanguage } = useTranslations();
  const { supportedLanguages, isLoading } = useLanguage();
  const [open, setOpen] = useState(false);

  // Filter only enabled languages
  const availableLanguages = supportedLanguages.filter(lang => lang.enabled);
  
  const handleChangeLanguage = (languageCode: string) => {
    changeLanguage(languageCode);
    setOpen(false);
  };

  // Different styles based on variant
  const getButtonStyles = () => {
    switch (variant) {
      case "footer":
        return "bg-[#333333] text-white border-[#404040]";
      case "navbar":
        return "bg-white text-gray-600 border-gray-200";
      default:
        return "";
    }
  };

  // Find the current language object
  const currentLangObj = availableLanguages.find(lang => lang.code === currentLanguage);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 h-9 px-3 ${getButtonStyles()} ${className || ''}`}
        >
          <Globe className="h-4 w-4" />
          {!isLoading && currentLangObj && (
            <span className="flex items-center gap-2">
              <img
                src={`https://flagcdn.com/20x15/${getCountryCodeForLanguage(currentLangObj.code)}.png`}
                width="20"
                height="15"
                alt={currentLangObj.name}
                className="rounded-sm"
              />
              {currentLangObj.nativeName}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`${mobile ? 'w-full' : 'w-52'} p-0`}>
        <ScrollArea className="h-72">
          <div className="grid">
            {availableLanguages.map((language) => (
              <Button
                key={language.code}
                variant="ghost"
                className={`justify-start rounded-none px-4 py-2.5 text-left text-sm ${
                  currentLanguage === language.code
                    ? "bg-gray-100 font-medium"
                    : ""
                }`}
                onClick={() => handleChangeLanguage(language.code)}
              >
                <span className="flex items-center gap-2">
                  <img
                    src={`https://flagcdn.com/20x15/${getCountryCodeForLanguage(language.code)}.png`}
                    srcSet={`https://flagcdn.com/40x30/${getCountryCodeForLanguage(language.code)}.png 2x`}
                    width="20"
                    height="15"
                    alt={`${language.name} flag`}
                    className="rounded-sm"
                  />
                  <span>{language.nativeName}</span>
                </span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSwitcher;
