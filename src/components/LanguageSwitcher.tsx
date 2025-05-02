
import React, { useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "@/hooks/useTranslations";

interface LanguageSwitcherProps {
  mobile?: boolean;
  className?: string;
}

const LanguageSwitcher = ({ mobile, className }: LanguageSwitcherProps) => {
  const { currentLanguage, changeLanguage } = useTranslations();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: "en", name: "English" },
    { code: "zh", name: "中文" },
  ];

  const handleChangeLanguage = (languageCode: string) => {
    changeLanguage(languageCode);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 h-9 px-3 text-gray-600 ${className || ''}`}
        >
          <Globe className="h-4 w-4" />
          <span>{languages.find((l) => l.code === currentLanguage)?.name || "Language"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`${mobile ? 'w-full' : 'w-40'} p-0`}>
        <div className="grid">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant="ghost"
              className={`justify-start rounded-none px-4 py-2 text-left text-sm ${
                currentLanguage === language.code
                  ? "bg-gray-100 font-medium"
                  : ""
              }`}
              onClick={() => handleChangeLanguage(language.code)}
            >
              {language.name}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSwitcher;
