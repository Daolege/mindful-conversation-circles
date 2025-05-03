
import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, PlusCircle, Upload, Download, Edit, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getAllLanguages, 
  addLanguage, 
  updateLanguage, 
  toggleLanguageStatus, 
  deleteLanguage,
  Language,
  languageToCountryCode,
  rtlLanguages 
} from '@/lib/services/language';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription, 
  DialogHeader,
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const LanguageManagement = () => {
  const { t } = useTranslations();
  const { currentLanguage, reloadLanguages, forceMigration } = useLanguage();
  const queryClient = useQueryClient();
  
  // State variables
  const [isAddLanguageOpen, setIsAddLanguageOpen] = useState(false);
  const [isEditLanguageOpen, setIsEditLanguageOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [newLanguage, setNewLanguage] = useState<Partial<Language>>({
    code: '',
    name: '',
    nativeName: '',
    enabled: true,
    rtl: false
  });
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Get all languages
  const { data: languages = [], isLoading, error: languageError, refetch: refetchLanguages } = useQuery({
    queryKey: ['admin-languages'],
    queryFn: getAllLanguages,
    staleTime: 30000,
    retry: 2
  });
  
  // Add a debug useEffect to log languages when they change
  useEffect(() => {
    console.log('LanguageManagement - Current languages:', languages);
  }, [languages]);

  // Effect to detect language issues
  useEffect(() => {
    if (languageError) {
      console.error('Error fetching languages:', languageError);
    }
  }, [languageError]);

  // Function to manually execute the language migration
  const executeMigration = async () => {
    try {
      setIsRestoring(true);
      toast.info(t('admin:applyingLanguageMigration'));
      
      // Use the forceMigration function from context
      await forceMigration();
      
      // Refetch languages to update the UI
      await refetchLanguages();
      
      // Refresh the language context to make changes visible application-wide
      reloadLanguages();
      
      toast.success(t('admin:languageMigrationCompleted'));
    } catch (error) {
      console.error('Error executing migration:', error);
      toast.error(t('admin:languageMigrationFailed'));
    } finally {
      setIsRestoring(false);
    }
  };
  
  // Add language mutation
  const addLanguageMutation = useMutation({
    mutationFn: addLanguage,
    onSuccess: () => {
      toast.success(t('admin:languageAdded'));
      setIsAddLanguageOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      reloadLanguages();
      resetNewLanguageForm();
    },
    onError: (error) => {
      toast.error(t('errors:general'), { description: error.message });
    }
  });
  
  // Update language mutation
  const updateLanguageMutation = useMutation({
    mutationFn: updateLanguage,
    onSuccess: () => {
      toast.success(t('admin:languageUpdated'));
      setIsEditLanguageOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      reloadLanguages();
    },
    onError: (error) => {
      toast.error(t('errors:general'), { description: error.message });
    }
  });
  
  // Toggle language status mutation
  const toggleLanguageStatusMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) => 
      toggleLanguageStatus(id, enabled),
    onSuccess: () => {
      toast.success(t('admin:languageStatusUpdated'));
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      reloadLanguages();
    },
    onError: (error) => {
      toast.error(t('errors:general'), { description: error.message });
    }
  });
  
  // Delete language mutation
  const deleteLanguageMutation = useMutation({
    mutationFn: (id: number) => deleteLanguage(id),
    onSuccess: () => {
      toast.success(t('admin:languageDeleted'));
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-languages'] });
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      reloadLanguages();
    },
    onError: (error) => {
      toast.error(t('errors:general'), { description: error.message });
    }
  });
  
  const resetNewLanguageForm = () => {
    setNewLanguage({
      code: '',
      name: '',
      nativeName: '',
      enabled: true,
      rtl: false
    });
  };
  
  const handleAddLanguage = () => {
    if (!newLanguage.code || !newLanguage.name || !newLanguage.nativeName) {
      toast.error(t('errors:formIncomplete'));
      return;
    }
    
    addLanguageMutation.mutate({
      code: newLanguage.code,
      name: newLanguage.name,
      nativeName: newLanguage.nativeName,
      enabled: newLanguage.enabled ?? true,
      rtl: newLanguage.rtl ?? false
    } as Language);
  };
  
  const handleUpdateLanguage = () => {
    if (!selectedLanguage || !selectedLanguage.id) return;
    
    updateLanguageMutation.mutate(selectedLanguage);
  };
  
  const handleToggleLanguageStatus = (language: Language) => {
    if (!language.id) return;
    
    toggleLanguageStatusMutation.mutate({
      id: language.id,
      enabled: !language.enabled
    });
  };
  
  const handleDeleteLanguage = () => {
    if (!selectedLanguage || !selectedLanguage.id) return;
    
    deleteLanguageMutation.mutate(selectedLanguage.id);
  };
  
  const openEditDialog = (language: Language) => {
    setSelectedLanguage({...language});
    setIsEditLanguageOpen(true);
  };
  
  const openDeleteDialog = (language: Language) => {
    setSelectedLanguage({...language});
    setIsDeleteDialogOpen(true);
  };
  
  const isDefaultLanguage = (code: string) => {
    return code === 'en' || code === 'zh';
  };

  const refreshLanguages = async () => {
    await refetchLanguages();
    reloadLanguages();
    toast.info("Languages refreshed");
  };

  return (
    <Card className="w-full">
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {t('admin:languageManagement')}
        </CardTitle>
        <CardDescription>
          {t('admin:languageManagementDescription')}
        </CardDescription>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-4"
          onClick={refreshLanguages}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="space-x-2">
            <Button 
              onClick={() => setIsAddLanguageOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              {t('admin:addLanguage')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsImportDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {t('admin:importTranslations')}
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={executeMigration}
              disabled={isRestoring}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isRestoring ? t('admin:restoringLanguages') : t('admin:restoreAllLanguages')}
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            {t('admin:totalLanguages')}: {languages.length}
          </div>
        </div>

        {languageError && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">{t('errors:languageFetchError')}</p>
            </div>
            <p className="mt-2 text-sm text-red-700">
              {t('errors:languageFetchErrorDescription')}
            </p>
            <div className="mt-3 flex space-x-2">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={refreshLanguages}
              >
                {t('actions:retry')}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={executeMigration}
              >
                {t('admin:restoreAllLanguages')}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {languages.length <= 2 && (
              <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">{t('admin:languagesRestoreNeeded')}</p>
                </div>
                <p className="mt-2 text-sm text-amber-700">
                  {t('admin:languagesRestoreDescription')}
                </p>
                <Button 
                  variant="secondary" 
                  className="mt-3 bg-amber-100 hover:bg-amber-200 text-amber-800"
                  onClick={executeMigration}
                  disabled={isRestoring}
                >
                  {isRestoring ? t('admin:restoringLanguages') : t('admin:restoreAllLanguages')}
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {languages.map((language) => (
                <div 
                  key={language.code}
                  className={`relative flex items-center justify-between p-4 border rounded-lg ${
                    language.enabled ? 'bg-white' : 'bg-gray-50'
                  } ${language.code === currentLanguage ? 'ring-2 ring-knowledge-primary/20' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Switch 
                      id={`lang-${language.code}`}
                      checked={language.enabled}
                      disabled={isDefaultLanguage(language.code)}
                      onCheckedChange={() => handleToggleLanguageStatus(language)}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{language.nativeName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{language.name}</span>
                        <span className="text-xs text-muted-foreground">({language.code})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {language.enabled ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {t('admin:active')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                        {t('admin:disabled')}
                      </Badge>
                    )}
                    {language.rtl && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        RTL
                      </Badge>
                    )}
                  </div>
                  
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => openEditDialog(language)}
                    >
                      <Edit className="h-3 w-3" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    
                    {!isDefaultLanguage(language.code) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => openDeleteDialog(language)}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {languages.length === 0 && !isLoading && !languageError && (
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <p className="text-muted-foreground">{t('admin:noLanguagesFound')}</p>
            <Button 
              variant="secondary" 
              onClick={executeMigration}
              className="mt-4"
              disabled={isRestoring}
            >
              {isRestoring ? t('admin:restoringLanguages') : t('admin:restoreAllLanguages')}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Add language dialog */}
      <Dialog open={isAddLanguageOpen} onOpenChange={setIsAddLanguageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin:addLanguage')}</DialogTitle>
            <DialogDescription>
              {t('admin:addLanguageDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="lang-code">{t('admin:languageCode')}</Label>
              <Input
                id="lang-code"
                className="col-span-2"
                placeholder="en, fr, es, zh, etc."
                value={newLanguage.code}
                onChange={(e) => setNewLanguage({...newLanguage, code: e.target.value.toLowerCase()})}
                maxLength={5}
              />
            </div>
            
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="lang-name">{t('admin:languageName')}</Label>
              <Input
                id="lang-name"
                className="col-span-2"
                placeholder="English, French, Spanish, etc."
                value={newLanguage.name}
                onChange={(e) => setNewLanguage({...newLanguage, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="lang-native-name">{t('admin:nativeName')}</Label>
              <Input
                id="lang-native-name"
                className="col-span-2"
                placeholder="English, Français, Español, etc."
                value={newLanguage.nativeName}
                onChange={(e) => setNewLanguage({...newLanguage, nativeName: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="lang-enabled">{t('admin:enabled')}</Label>
              <div className="col-span-2">
                <Switch
                  id="lang-enabled"
                  checked={newLanguage.enabled}
                  onCheckedChange={(checked) => setNewLanguage({...newLanguage, enabled: checked})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="lang-rtl">RTL</Label>
              <div className="col-span-2 flex items-center gap-2">
                <Switch
                  id="lang-rtl"
                  checked={newLanguage.rtl}
                  onCheckedChange={(checked) => setNewLanguage({...newLanguage, rtl: checked})}
                />
                <span className="text-xs text-muted-foreground">
                  {t('admin:rtlSupport')}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddLanguageOpen(false)}>
              {t('actions:cancel')}
            </Button>
            <Button onClick={handleAddLanguage} disabled={addLanguageMutation.isPending}>
              {addLanguageMutation.isPending ? t('actions:saving') : t('actions:save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit language dialog */}
      <Dialog open={isEditLanguageOpen} onOpenChange={setIsEditLanguageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin:editLanguage')}</DialogTitle>
            <DialogDescription>
              {t('admin:editLanguageDescription')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLanguage && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label>{t('admin:languageCode')}</Label>
                <div className="col-span-2 font-mono bg-gray-100 px-3 py-2 rounded-md text-gray-700">
                  {selectedLanguage.code}
                </div>
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="edit-lang-name">{t('admin:languageName')}</Label>
                <Input
                  id="edit-lang-name"
                  className="col-span-2"
                  value={selectedLanguage.name}
                  onChange={(e) => setSelectedLanguage({...selectedLanguage, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="edit-lang-native-name">{t('admin:nativeName')}</Label>
                <Input
                  id="edit-lang-native-name"
                  className="col-span-2"
                  value={selectedLanguage.nativeName}
                  onChange={(e) => setSelectedLanguage({...selectedLanguage, nativeName: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="edit-lang-enabled">{t('admin:enabled')}</Label>
                <div className="col-span-2">
                  <Switch
                    id="edit-lang-enabled"
                    checked={selectedLanguage.enabled}
                    disabled={isDefaultLanguage(selectedLanguage.code)}
                    onCheckedChange={(checked) => setSelectedLanguage({...selectedLanguage, enabled: checked})}
                  />
                  {isDefaultLanguage(selectedLanguage.code) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('admin:defaultLanguageCantBeDisabled')}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="edit-lang-rtl">RTL</Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Switch
                    id="edit-lang-rtl"
                    checked={selectedLanguage.rtl}
                    onCheckedChange={(checked) => setSelectedLanguage({...selectedLanguage, rtl: checked})}
                  />
                  <span className="text-xs text-muted-foreground">
                    {t('admin:rtlSupport')}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditLanguageOpen(false)}>
              {t('actions:cancel')}
            </Button>
            <Button onClick={handleUpdateLanguage} disabled={updateLanguageMutation.isPending}>
              {updateLanguageMutation.isPending ? t('actions:saving') : t('actions:save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete language confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin:deleteLanguage')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin:deleteLanguageConfirmation')} 
              <span className="font-semibold">{selectedLanguage?.name} ({selectedLanguage?.code})</span>?
              {t('admin:thisActionCannotBeUndone')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions:cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteLanguage}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('actions:delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Import translations dialog - temporarily disabled */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin:importTranslations')}</DialogTitle>
            <DialogDescription>
              {t('admin:importTranslationsDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">{t('admin:comingSoon')}</h3>
            <p className="text-muted-foreground">
              {t('admin:languageManagementFutureUpdate')}
            </p>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsImportDialogOpen(false)}>
              {t('actions:close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LanguageManagement;
