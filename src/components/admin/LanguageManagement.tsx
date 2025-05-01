
import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageItem {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  rtl?: boolean;
}

export const LanguageManagement = () => {
  const { t } = useTranslations();
  const { supportedLanguages, currentLanguage } = useLanguage();
  
  // These are the languages planned for future implementation
  const plannedLanguages: LanguageItem[] = [
    { code: 'fr', name: 'French', nativeName: 'Français', enabled: false },
    { code: 'de', name: 'German', nativeName: 'Deutsch', enabled: false },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', enabled: false },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', enabled: false, rtl: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', enabled: false },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', enabled: false },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', enabled: false },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', enabled: false },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', enabled: false },
    { code: 'ko', name: 'Korean', nativeName: '한국어', enabled: false },
  ];

  // Combine current and planned languages
  const allLanguages: LanguageItem[] = [
    ...supportedLanguages.map(lang => ({ ...lang, enabled: true })),
    ...plannedLanguages
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe size={20} />
          {t('admin:languageManagement')}
        </CardTitle>
        <CardDescription>
          {t('admin:languageManagementDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allLanguages.map((language) => (
            <div 
              key={language.code}
              className={`flex items-center justify-between p-4 border rounded-lg ${language.enabled ? 'bg-white' : 'bg-gray-50'}`}
            >
              <div className="flex items-center gap-2">
                <Checkbox 
                  id={`lang-${language.code}`}
                  checked={language.enabled}
                  disabled={!language.enabled || language.code === 'en' || language.code === 'zh'}
                />
                <Label 
                  htmlFor={`lang-${language.code}`}
                  className="flex flex-col"
                >
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-sm text-gray-500">{language.name}</span>
                </Label>
              </div>
              <div>
                {language.enabled ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {t('admin:active')}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                    {t('admin:comingSoon')}
                  </Badge>
                )}
                {language.rtl && (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                    RTL
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <Button variant="outline" disabled className="mr-2">
            {t('admin:addLanguage')}
          </Button>
          <Button variant="outline" disabled>
            {t('admin:importTranslations')}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            {t('admin:languageManagementFutureUpdate')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
