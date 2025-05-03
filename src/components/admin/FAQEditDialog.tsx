
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaqWithTranslation, upsertFaqTranslation, createFaq, MultiFaq } from '@/lib/services/faqService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FAQEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq?: FaqWithTranslation;
  onSuccess?: () => void;
}

interface TranslationForm {
  question: string;
  answer: string;
}

export const FAQEditDialog: React.FC<FAQEditDialogProps> = ({
  open,
  onOpenChange,
  faq,
  onSuccess
}) => {
  const { t } = useTranslations();
  const { supportedLanguages } = useLanguage();
  const [activeLanguage, setActiveLanguage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // FAQ basic data
  const [category, setCategory] = useState<string>('general');
  const [isFeatured, setIsFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  // Translations for each language
  const [translations, setTranslations] = useState<Record<string, TranslationForm>>({});
  
  // Set initial values when faq changes
  useEffect(() => {
    if (faq) {
      setCategory(faq.category || 'general');
      setIsFeatured(faq.is_featured || false);
      setDisplayOrder(faq.display_order || 0);
      setIsActive(faq.is_active !== false); // Default to true if undefined
      
      // Initialize current language translation
      if (faq.language_code && faq.question && faq.answer) {
        setTranslations(prev => ({
          ...prev,
          [faq.language_code]: {
            question: faq.question,
            answer: faq.answer
          }
        }));
        setActiveLanguage(faq.language_code);
      }
    } else {
      // Reset form for new FAQ
      setCategory('general');
      setIsFeatured(false);
      setDisplayOrder(0);
      setIsActive(true);
      setTranslations({});
    }
  }, [faq]);
  
  // Set default active language if not set
  useEffect(() => {
    if (supportedLanguages.length > 0 && !activeLanguage) {
      setActiveLanguage(supportedLanguages[0].code);
    }
  }, [supportedLanguages, activeLanguage]);
  
  const handleTranslationChange = (langCode: string, field: 'question' | 'answer', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [langCode]: {
        ...prev[langCode],
        [field]: value
      }
    }));
  };
  
  const validateForm = (): boolean => {
    // Check if at least one language has translation
    const hasTranslation = Object.keys(translations).length > 0;
    if (!hasTranslation) {
      toast.error(t('admin:errorAtLeastOneTranslation'));
      return false;
    }
    
    // Check that active language has both question and answer
    if (activeLanguage && translations[activeLanguage]) {
      const { question, answer } = translations[activeLanguage];
      if (!question.trim() || !answer.trim()) {
        toast.error(t('admin:errorIncompleteCurrentTranslation'));
        return false;
      }
    }
    
    return true;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      let faqId: number;
      
      // If editing existing FAQ, use its ID, otherwise create new FAQ
      if (faq && faq.id) {
        faqId = faq.id;
        // TODO: Update existing FAQ metadata
      } else {
        // Create new FAQ
        const newFaqData: Omit<MultiFaq, 'id'> = {
          category,
          is_featured: isFeatured,
          display_order: displayOrder,
          is_active: isActive
        };
        
        const { data: newFaq, error } = await createFaq(newFaqData);
        
        if (error || !newFaq) {
          throw new Error(t('admin:errorCreatingFaq'));
        }
        
        faqId = newFaq.id;
      }
      
      // Save translations for each language
      const translationPromises = Object.entries(translations).map(([langCode, content]) => {
        if (content.question && content.answer) {
          return upsertFaqTranslation(
            faqId,
            langCode,
            content.question,
            content.answer
          );
        }
        return Promise.resolve({ success: true, error: null });
      });
      
      const results = await Promise.all(translationPromises);
      const hasErrors = results.some(result => !result.success);
      
      if (hasErrors) {
        throw new Error(t('admin:errorSavingTranslations'));
      }
      
      toast.success(faq ? t('admin:faqUpdated') : t('admin:faqCreated'));
      
      if (onSuccess) {
        onSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error(t('admin:errorSavingFaq'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const categories = [
    { value: 'account', label: t('admin:accountCategory') },
    { value: 'course', label: t('admin:courseCategory') },
    { value: 'payment', label: t('admin:paymentCategory') },
    { value: 'other', label: t('admin:otherCategory') }
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {faq ? t('admin:editFaq') : t('admin:createFaq')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{t('admin:category')}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder={t('admin:selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayOrder">{t('admin:displayOrder')}</Label>
              <Input
                id="displayOrder"
                type="number"
                min="0"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
              <Label htmlFor="featured">{t('admin:isFeatured')}</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="active">{t('admin:isActive')}</Label>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">{t('admin:translations')}</h3>
            
            <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
              <TabsList className="mb-4 flex-wrap">
                {supportedLanguages.map((language) => (
                  <TabsTrigger key={language.code} value={language.code}>
                    {language.nativeName} ({language.code})
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {supportedLanguages.map((language) => (
                <TabsContent key={language.code} value={language.code} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${language.code}`}>{t('admin:question')}</Label>
                    <Input
                      id={`question-${language.code}`}
                      value={translations[language.code]?.question || ''}
                      onChange={(e) => handleTranslationChange(language.code, 'question', e.target.value)}
                      placeholder={t('admin:enterQuestion')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`answer-${language.code}`}>{t('admin:answer')}</Label>
                    <Textarea
                      id={`answer-${language.code}`}
                      value={translations[language.code]?.answer || ''}
                      onChange={(e) => handleTranslationChange(language.code, 'answer', e.target.value)}
                      placeholder={t('admin:enterAnswer')}
                      rows={6}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            {t('admin:cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('admin:saving')}
              </>
            ) : (
              t('admin:save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FAQEditDialog;
