
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { getAllBanners, getBannerById } from "@/services/bannerService";
import { useTranslations } from "@/hooks/useTranslations";
import { toast } from "sonner";
import DynamicBanner from "../banner/DynamicBanner";

const BannerManagement = () => {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState("list");
  const [banners, setBanners] = useState([]);
  const [selectedBannerId, setSelectedBannerId] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load banners on component mount
  useEffect(() => {
    loadBanners();
  }, []);
  
  // Load specific banner when selected
  useEffect(() => {
    if (selectedBannerId) {
      loadBannerDetails(selectedBannerId);
    }
  }, [selectedBannerId]);
  
  // Load all banners
  const loadBanners = async () => {
    try {
      setLoading(true);
      const allBanners = await getAllBanners();
      setBanners(allBanners);
      
      // Select first banner by default if nothing selected
      if (!selectedBannerId && allBanners.length > 0) {
        setSelectedBannerId(allBanners[0].id);
      }
    } catch (error) {
      console.error("Error loading banners:", error);
      toast.error(t('common:errorOccurred'));
    } finally {
      setLoading(false);
    }
  };
  
  // Load a specific banner details
  const loadBannerDetails = async (id) => {
    try {
      setLoading(true);
      const banner = await getBannerById(id);
      setCurrentBanner(banner);
    } catch (error) {
      console.error(`Error loading banner ${id}:`, error);
      toast.error(t('common:errorOccurred'));
    } finally {
      setLoading(false);
    }
  };
  
  // Save banner changes
  const saveBanner = () => {
    // Here you would normally save to database
    toast.success(t('home:bannerSaveSuccess'));
  };
  
  // Create a new banner
  const createNewBanner = () => {
    // Here you would create a new banner with default values
    setCurrentBanner({
      id: `banner-${Date.now()}`,
      type: "hero",
      isActive: true,
      displayOrder: banners.length + 1,
      backgroundImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2074&q=80",
      overlayGradient: {
        from: "blue-800/90",
        via: "purple-800/80", 
        to: "pink-800/90"
      },
      statsEnabled: true,
      translations: {
        en: {
          headline: "New Banner Title",
          subheadline: "Subtitle Goes Here",
          description: "Add your banner description here.",
          primaryButtonText: "Primary Button",
          secondaryButtonText: "Secondary Button",
          stats: [],
          badges: []
        },
        zh: {
          headline: "新横幅标题",
          subheadline: "副标题在这里",
          description: "在这里添加您的横幅描述。",
          primaryButtonText: "主要按钮",
          secondaryButtonText: "次要按钮",
          stats: [],
          badges: []
        }
      }
    });
    setActiveTab("edit");
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('home:bannerManagement')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="list">{t('common:list')}</TabsTrigger>
              <TabsTrigger value="edit">{t('common:edit')}</TabsTrigger>
              <TabsTrigger value="preview">{t('home:bannerPreview')}</TabsTrigger>
            </TabsList>
            
            <Button onClick={createNewBanner} className="bg-primary">
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('home:createNewBanner')}
            </Button>
          </div>
          
          {/* List View */}
          <TabsContent value="list" className="space-y-4">
            {banners.map((banner) => (
              <div 
                key={banner.id} 
                className={`p-4 border rounded-md flex justify-between items-center cursor-pointer ${selectedBannerId === banner.id ? 'bg-secondary/20 border-primary' : ''}`}
                onClick={() => setSelectedBannerId(banner.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                    {banner.backgroundImage && (
                      <img 
                        src={banner.backgroundImage} 
                        alt={`Banner ${banner.id}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {banner.translations?.en?.headline || banner.translations?.zh?.headline || banner.id}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {banner.isActive ? t('common:active') : t('common:inactive')} • {t('common:order')}: {banner.displayOrder}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBannerId(banner.id);
                      setActiveTab("edit");
                    }}
                  >
                    {t('common:edit')}
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBannerId(banner.id);
                      setActiveTab("preview");
                    }}
                  >
                    {t('common:preview')}
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
          
          {/* Edit View */}
          <TabsContent value="edit" className="space-y-6">
            {currentBanner && (
              <form onSubmit={(e) => {
                e.preventDefault();
                saveBanner();
              }}>
                {/* Basic Banner Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('home:bannerSettings')}</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="banner-type">{t('home:bannerType')}</Label>
                      <Select 
                        defaultValue={currentBanner.type}
                        onValueChange={(value) => {
                          setCurrentBanner({
                            ...currentBanner,
                            type: value
                          });
                        }}
                      >
                        <SelectTrigger id="banner-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hero">Hero Banner</SelectItem>
                          <SelectItem value="promo">Promotional Banner</SelectItem>
                          <SelectItem value="announcement">Announcement Banner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="banner-active"
                          checked={currentBanner.isActive}
                          onCheckedChange={(checked) => {
                            setCurrentBanner({
                              ...currentBanner,
                              isActive: checked
                            });
                          }}
                        />
                        <Label htmlFor="banner-active">{t('home:bannerStatus')}: {currentBanner.isActive ? t('common:active') : t('common:inactive')}</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="number"
                          id="display-order"
                          className="w-20"
                          value={currentBanner.displayOrder}
                          onChange={(e) => {
                            setCurrentBanner({
                              ...currentBanner,
                              displayOrder: parseInt(e.target.value) || 0
                            });
                          }}
                        />
                        <Label htmlFor="display-order">{t('home:displayOrder')}</Label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="background-image">{t('home:backgroundImage')}</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="text"
                          id="background-image"
                          value={currentBanner.backgroundImage}
                          onChange={(e) => {
                            setCurrentBanner({
                              ...currentBanner,
                              backgroundImage: e.target.value
                            });
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Here you would open an image selector
                            toast.info("Image upload would open here");
                          }}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      {currentBanner.backgroundImage && (
                        <div className="mt-2 w-full h-32 bg-gray-100 rounded overflow-hidden">
                          <img 
                            src={currentBanner.backgroundImage}
                            alt="Banner background"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Content Translations */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">{t('common:translations')}</h3>
                    
                    {/* Language Tabs */}
                    <Tabs defaultValue="en">
                      <TabsList>
                        <TabsTrigger value="en">English</TabsTrigger>
                        <TabsTrigger value="zh">中文</TabsTrigger>
                      </TabsList>
                      
                      {/* English Content */}
                      <TabsContent value="en" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="en-headline">{t('home:bannerHeadline')}</Label>
                          <Input 
                            id="en-headline"
                            value={currentBanner.translations.en?.headline || ''}
                            onChange={(e) => {
                              setCurrentBanner({
                                ...currentBanner,
                                translations: {
                                  ...currentBanner.translations,
                                  en: {
                                    ...currentBanner.translations.en,
                                    headline: e.target.value
                                  }
                                }
                              });
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="en-subheadline">{t('home:bannerSubheadline')}</Label>
                          <Input 
                            id="en-subheadline"
                            value={currentBanner.translations.en?.subheadline || ''}
                            onChange={(e) => {
                              setCurrentBanner({
                                ...currentBanner,
                                translations: {
                                  ...currentBanner.translations,
                                  en: {
                                    ...currentBanner.translations.en,
                                    subheadline: e.target.value
                                  }
                                }
                              });
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="en-description">{t('home:bannerDescription')}</Label>
                          <textarea 
                            id="en-description"
                            className="w-full p-2 border rounded-md"
                            rows={3}
                            value={currentBanner.translations.en?.description || ''}
                            onChange={(e) => {
                              setCurrentBanner({
                                ...currentBanner,
                                translations: {
                                  ...currentBanner.translations,
                                  en: {
                                    ...currentBanner.translations.en,
                                    description: e.target.value
                                  }
                                }
                              });
                            }}
                          />
                        </div>
                      </TabsContent>
                      
                      {/* Chinese Content */}
                      <TabsContent value="zh" className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="zh-headline">{t('home:bannerHeadline')}</Label>
                          <Input 
                            id="zh-headline"
                            value={currentBanner.translations.zh?.headline || ''}
                            onChange={(e) => {
                              setCurrentBanner({
                                ...currentBanner,
                                translations: {
                                  ...currentBanner.translations,
                                  zh: {
                                    ...currentBanner.translations.zh,
                                    headline: e.target.value
                                  }
                                }
                              });
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="zh-subheadline">{t('home:bannerSubheadline')}</Label>
                          <Input 
                            id="zh-subheadline"
                            value={currentBanner.translations.zh?.subheadline || ''}
                            onChange={(e) => {
                              setCurrentBanner({
                                ...currentBanner,
                                translations: {
                                  ...currentBanner.translations,
                                  zh: {
                                    ...currentBanner.translations.zh,
                                    subheadline: e.target.value
                                  }
                                }
                              });
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="zh-description">{t('home:bannerDescription')}</Label>
                          <textarea 
                            id="zh-description"
                            className="w-full p-2 border rounded-md"
                            rows={3}
                            value={currentBanner.translations.zh?.description || ''}
                            onChange={(e) => {
                              setCurrentBanner({
                                ...currentBanner,
                                translations: {
                                  ...currentBanner.translations,
                                  zh: {
                                    ...currentBanner.translations.zh,
                                    description: e.target.value
                                  }
                                }
                              });
                            }}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Save/Delete Buttons */}
                <div className="flex justify-between">
                  <Button type="button" variant="destructive" onClick={() => {
                    // Here you would delete the banner
                    toast.success(t('home:bannerDeleteSuccess'));
                    setActiveTab("list");
                  }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('home:deleteBanner')}
                  </Button>
                  
                  <div className="space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setActiveTab("preview")}
                    >
                      {t('common:preview')}
                    </Button>
                    
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      {t('home:saveBanner')}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </TabsContent>
          
          {/* Preview View */}
          <TabsContent value="preview">
            {currentBanner && (
              <div className="space-y-4">
                <div className="rounded-md overflow-hidden border">
                  <DynamicBanner bannerId={currentBanner.id} />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("edit")}
                  >
                    {t('common:edit')}
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      saveBanner();
                      setActiveTab("list");
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {t('home:saveBanner')}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BannerManagement;
