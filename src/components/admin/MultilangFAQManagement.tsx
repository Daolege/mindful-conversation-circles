
import React, { useState, useEffect } from 'react';
import { 
  getAllFaqTranslations, 
  getFaqsByLanguage,
  FaqWithTranslation 
} from '@/lib/services/faqService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  CheckSquare, 
  XSquare,
  Plus 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Define interfaces
interface EditableFaq extends FaqWithTranslation {
  isEditing?: boolean;
}

export const MultilangFAQManagement = () => {
  const { supportedLanguages } = useLanguage();
  const { t } = useTranslations();
  
  const [selectedLanguage, setSelectedLanguage] = useState<string>('zh');
  const [faqs, setFaqs] = useState<EditableFaq[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<EditableFaq[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (selectedLanguage) {
      loadFaqs();
    }
  }, [selectedLanguage]);
  
  useEffect(() => {
    if (searchQuery || selectedCategory !== 'all') {
      filterFaqs();
    } else {
      setFilteredFaqs(faqs);
    }
  }, [searchQuery, selectedCategory, faqs]);
  
  const loadFaqs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getFaqsByLanguage(selectedLanguage);
      
      if (error) {
        toast.error(t('errors:failedToLoadFaqs'));
      } else if (Array.isArray(data)) {
        // Make sure we have valid FAQ objects
        const validFaqs = data.filter(faq => 
          typeof faq === 'object' && 
          faq !== null && 
          'id' in faq && 
          'question' in faq && 
          'answer' in faq
        ) as FaqWithTranslation[];
        
        setFaqs(validFaqs);
        setFilteredFaqs(validFaqs);
      }
    } catch (error) {
      toast.error(t('errors:unexpectedError'));
      console.error('Error loading FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filterFaqs = () => {
    let filtered = faqs;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }
    
    setFilteredFaqs(filtered);
  };
  
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
  };
  
  const categories = [
    { value: 'all', label: t('admin:allCategories') },
    { value: 'account', label: t('admin:accountCategory') },
    { value: 'course', label: t('admin:courseCategory') },
    { value: 'payment', label: t('admin:paymentCategory') },
    { value: 'other', label: t('admin:otherCategory') },
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('admin:faqManagement')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="faqs">
          <TabsList className="mb-4">
            <TabsTrigger value="faqs">{t('admin:manageFAQs')}</TabsTrigger>
            <TabsTrigger value="translations">{t('admin:faqTranslations')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faqs">
            <div className="space-y-4">
              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="language-select">{t('admin:language')}</Label>
                  <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                    <SelectTrigger id="language-select">
                      <SelectValue placeholder={t('admin:selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedLanguages.map(lang => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.nativeName} ({lang.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="category-select">{t('admin:category')}</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger id="category-select">
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
                
                <div>
                  <Label htmlFor="faq-search">{t('admin:search')}</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="faq-search"
                      placeholder={t('admin:searchFAQs')}
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-between items-center">
                <div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin:addFAQ')}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {filteredFaqs.length} {t('admin:questionsFound')}
                </div>
              </div>
              
              {/* FAQ List */}
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border rounded-md p-4 animate-pulse">
                      <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded w-full mb-1"></div>
                      <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                    </div>
                  ))}
                </div>
              ) : filteredFaqs.length > 0 ? (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4 pr-4">
                    {Array.isArray(filteredFaqs) && filteredFaqs.map(faq => (
                      <div key={faq.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{faq.question}</h3>
                            <Badge variant={faq.is_featured ? "default" : "outline"}>
                              {faq.is_featured ? t('admin:featured') : t('admin:notFeatured')}
                            </Badge>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t('admin:actions')}</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                {t('admin:edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('admin:delete')}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                {t('admin:clone')}
                              </DropdownMenuItem>
                              {faq.is_featured ? (
                                <DropdownMenuItem>
                                  <XSquare className="h-4 w-4 mr-2" />
                                  {t('admin:unfeature')}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>
                                  <CheckSquare className="h-4 w-4 mr-2" />
                                  {t('admin:feature')}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-gray-500">{faq.answer}</p>
                        <div className="mt-2 text-xs text-gray-400">{t('admin:category')}: {faq.category}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12 border rounded-lg">
                  <p className="text-muted-foreground">{t('admin:noFAQsFound')}</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="translations">
            <div className="text-center py-12 border rounded-lg">
              <p>{t('admin:faqTranslationsTool')}</p>
              <Button className="mt-4">{t('admin:openTranslationTool')}</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MultilangFAQManagement;
