import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, Pencil, Trash2, Globe, Check, X, AlertCircle, Loader2, Star
} from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { 
  getFaqsByLanguage, 
  createFaq, 
  upsertFaqTranslation, 
  getAllFaqTranslations,
  getFaqTranslation 
} from "@/lib/services/faqService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const MultilangFAQManagement = () => {
  const { currentLanguage, t } = useTranslations();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [currentEditLang, setCurrentEditLang] = useState(currentLanguage);
  const [formData, setFormData] = useState({
    category: "general",
    question: "",
    answer: "",
    is_featured: false
  });

  // Get all FAQs with translations
  const {
    data: faqs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-multilingual-faqs", currentLanguage],
    queryFn: async () => {
      const { data, error } = await getFaqsByLanguage(currentLanguage);

      if (error) {
        throw error;
      }

      return data || [];
    },
  });

  // Get available languages
  const { data: languages = [] } = useQuery({
    queryKey: ["languages"],
    queryFn: async () => {
      try {
        const { data } = await (supabase as any)
          .from("languages")
          .select("*")
          .eq("enabled", true);
        return data || [];
      } catch (error) {
        console.error("Error fetching languages:", error);
        return [];
      }
    },
  });

  // Get translations for a specific FAQ
  const {
    data: translations = [],
    isLoading: isLoadingTranslations,
  } = useQuery({
    queryKey: ["faq-translations", editingFaq?.id],
    queryFn: async () => {
      if (!editingFaq?.id) return [];
      
      const { data, error } = await getAllFaqTranslations(editingFaq.id);
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: !!editingFaq?.id,
  });

  // Create new FAQ mutation
  const createFaqMutation = useMutation({
    mutationFn: async () => {
      // First create the base FAQ
      const { data, error } = await createFaq({
        category: formData.category,
        display_order: 0,
        is_featured: formData.is_featured,
        is_active: true,
      });
      
      if (error) throw error;
      if (!data) throw new Error("Failed to create FAQ");
      
      // Then add the translation
      const { error: translationError } = await upsertFaqTranslation(
        data.id,
        currentLanguage,
        formData.question,
        formData.answer
      );
      
      if (translationError) throw translationError;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-multilingual-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["featured-faqs"] });
      setIsDialogOpen(false);
      resetForm();
      toast.success(t('common:faqCreated'));
    },
    onError: (error) => {
      console.error("Error creating FAQ:", error);
      toast.error(t('common:errorCreatingFaq'));
    },
  });

  // Update FAQ translation mutation
  const updateTranslationMutation = useMutation({
    mutationFn: async () => {
      if (!editingFaq?.id) throw new Error("No FAQ selected");
      
      const { error } = await upsertFaqTranslation(
        editingFaq.id,
        currentEditLang,
        formData.question,
        formData.answer
      );
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-multilingual-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["featured-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["faq-translations"] });
      toast.success(t('common:translationUpdated'));
    },
    onError: (error) => {
      console.error("Error updating translation:", error);
      toast.error(t('common:errorUpdatingTranslation'));
    },
  });

  // Filter FAQs based on active tab
  const filteredFaqs = faqs.filter((faq) => {
    return activeTab === "all" || faq.category === activeTab;
  });

  const handleCreateNew = () => {
    setEditingFaq(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = async (faq: any) => {
    setEditingFaq(faq);
    setCurrentEditLang(currentLanguage);
    setFormData({
      category: faq.category || "general",
      question: faq.question || "",
      answer: faq.answer || "",
      is_featured: faq.is_featured || false
    });
    setIsDialogOpen(true);
  };

  const handleChangeLanguage = async (langCode: string) => {
    setCurrentEditLang(langCode);
    
    if (editingFaq?.id) {
      // Get translation for this language if it exists
      const { data } = await getFaqTranslation(editingFaq.id, langCode);
      
      if (data) {
        setFormData(prev => ({
          ...prev,
          question: data.question,
          answer: data.answer
        }));
      } else {
        // No translation exists yet
        setFormData(prev => ({
          ...prev,
          question: "",
          answer: ""
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error(t('common:pleaseCompleteAllFields'));
      return;
    }
    
    if (editingFaq) {
      updateTranslationMutation.mutate();
    } else {
      createFaqMutation.mutate();
    }
  };

  const resetForm = () => {
    setFormData({
      category: "general",
      question: "",
      answer: "",
      is_featured: false
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('common:manageFaqs')}</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" /> {t('common:createNewFaq')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 grid grid-cols-4 md:w-[400px]">
          <TabsTrigger value="all">{t('common:allCategories')}</TabsTrigger>
          <TabsTrigger value="account">{t('common:account')}</TabsTrigger>
          <TabsTrigger value="course">{t('common:course')}</TabsTrigger>
          <TabsTrigger value="payment">{t('common:payment')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredFaqs.length > 0 ? (
            <div className="grid gap-4">
              {filteredFaqs.map((faq) => (
                <Card key={faq.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                        <CardDescription className="mt-1 flex items-center">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                            {faq.category}
                          </span>
                          {faq.is_featured && (
                            <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs flex items-center">
                              <Star className="h-3 w-3 mr-1" /> {t('common:featured')}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(faq)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 line-clamp-2">{faq.answer}</p>
                  </CardContent>
                  <CardFooter className="pt-0 text-xs text-gray-400 flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    {t('common:languageVersion', { language: currentLanguage })}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 border rounded-md">
              <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">{t('common:noFaqsFound')}</h3>
              <p className="mt-2 text-gray-500">
                {t('common:createFirstFaq')}
              </p>
              <Button className="mt-4" onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" /> {t('common:createNewFaq')}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? t('common:editFaq') : t('common:createNewFaq')}
            </DialogTitle>
            <DialogDescription>
              {editingFaq 
                ? t('common:editFaqDescription') 
                : t('common:createFaqDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            {editingFaq && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">{t('common:selectLanguage')}</label>
                <Select 
                  value={currentEditLang} 
                  onValueChange={handleChangeLanguage}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('common:selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang: any) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.nativeName} ({lang.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">{t('common:category')}</label>
              <Select 
                value={formData.category} 
                name="category"
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                disabled={!!editingFaq} // Disable category change for existing FAQs
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('common:selectCategory')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{t('common:general')}</SelectItem>
                  <SelectItem value="account">{t('common:account')}</SelectItem>
                  <SelectItem value="course">{t('common:course')}</SelectItem>
                  <SelectItem value="payment">{t('common:payment')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="question">
                {t('common:question')}
              </label>
              <Input
                id="question"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                placeholder={t('common:enterQuestion')}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" htmlFor="answer">
                {t('common:answer')}
              </label>
              <Textarea
                id="answer"
                name="answer"
                value={formData.answer}
                onChange={handleInputChange}
                placeholder={t('common:enterAnswer')}
                rows={5}
                className="resize-y"
              />
            </div>

            {!editingFaq && (
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label htmlFor="is_featured">{t('common:featureFaq')}</label>
              </div>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                <X className="mr-1 h-4 w-4" /> {t('common:cancel')}
              </Button>
              <Button 
                type="submit"
                disabled={createFaqMutation.isPending || updateTranslationMutation.isPending}
              >
                {createFaqMutation.isPending || updateTranslationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common:saving')}
                  </>
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    {editingFaq ? t('common:saveChanges') : t('common:createFaq')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultilangFAQManagement;
