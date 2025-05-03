
import React, { useState, useEffect } from 'react';
import { 
  getAllFaqTranslations, 
  getFaqsByLanguage,
  FaqWithTranslation,
  upsertFaqTranslation,
  createFaq,
  deleteFromTable,
  updateFaq
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
  Plus,
  RefreshCw
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import FAQEditDialog from './FAQEditDialog';
import { I18nDialog } from '@/components/ui/i18n-dialog';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // State for edit/create dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState<FaqWithTranslation | undefined>(undefined);
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<FaqWithTranslation | null>(null);
  
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
      setIsRefreshing(false);
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
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadFaqs();
  };
  
  const handleAddFaq = () => {
    setCurrentFaq(undefined);
    setEditDialogOpen(true);
  };
  
  const handleEditFaq = (faq: FaqWithTranslation) => {
    setCurrentFaq(faq);
    setEditDialogOpen(true);
  };
  
  const handleDeleteFaq = (faq: FaqWithTranslation) => {
    setFaqToDelete(faq);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteFaq = async () => {
    if (!faqToDelete) return;
    
    try {
      // Delete the FAQ from the database
      await deleteFromTable('multilingual_faqs', { id: faqToDelete.id });
      
      // Remove from state
      setFaqs(prev => prev.filter(f => f.id !== faqToDelete.id));
      toast.success(t('admin:faqDeleted'));
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error(t('admin:errorDeletingFaq'));
    } finally {
      setDeleteDialogOpen(false);
      setFaqToDelete(null);
    }
  };
  
  const toggleFeatured = async (faq: FaqWithTranslation) => {
    try {
      // Update the is_featured status using the updateFaq function
      await updateFaq(faq.id, { is_featured: !faq.is_featured });
      
      // Update in state
      setFaqs(prev => prev.map(f => {
        if (f.id === faq.id) {
          return {
            ...f,
            is_featured: !faq.is_featured
          };
        }
        return f;
      }));
      
      toast.success(faq.is_featured ? t('admin:faqUnfeatured') : t('admin:faqFeatured'));
    } catch (error) {
      console.error('Error updating FAQ featured status:', error);
      toast.error(t('admin:errorUpdatingFaq'));
    }
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
                <div className="flex space-x-2">
                  <Button onClick={handleAddFaq}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin:addFAQ')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh} 
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {t('admin:refresh')}
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
                              <DropdownMenuItem onClick={() => handleEditFaq(faq)}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t('admin:edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteFaq(faq)}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('admin:delete')}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                {t('admin:clone')}
                              </DropdownMenuItem>
                              {faq.is_featured ? (
                                <DropdownMenuItem onClick={() => toggleFeatured(faq)}>
                                  <XSquare className="h-4 w-4 mr-2" />
                                  {t('admin:unfeature')}
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => toggleFeatured(faq)}>
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
      
      {/* Edit FAQ Dialog */}
      <FAQEditDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        faq={currentFaq}
        onSuccess={loadFaqs} 
      />
      
      {/* Delete Confirmation Dialog */}
      <I18nDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('admin:confirmDelete')}
        description={t('admin:confirmDeleteFaqDescription')}
        cancelText={t('admin:cancel')}
        confirmText={t('admin:delete')}
        onConfirm={confirmDeleteFaq}
        variant="destructive"
      />
    </Card>
  );
};

export default MultilangFAQManagement;
