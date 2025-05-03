import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "@/hooks/useTranslations";
import { Loader2, CreditCard, History, Calendar, ArrowLeftRight, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { ExchangeRate, exchangeRatesService } from '@/lib/supabaseUtils';
import { defaultExchangeRates } from '@/lib/defaultData';
import { Alert, AlertDescription } from "@/components/ui/alert";

const ExchangeRateSettings = () => {
  const { t, currentLanguage } = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<Partial<ExchangeRate>>({
    rate: 7.23,
    from_currency: 'CNY',
    to_currency: 'USD'
  });
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeRate[]>([]);
  const [isUsingSampleData, setIsUsingSampleData] = useState(false);

  // Load exchange rate on component mount
  useEffect(() => {
    loadExchangeRate();
    loadExchangeHistory();
  }, []);

  // Function to load current exchange rate
  const loadExchangeRate = async () => {
    setIsLoading(true);
    try {
      // Using our updated service
      const rates = await exchangeRatesService.getLatest();
      
      if (rates && rates.length > 0) {
        setExchangeRate({
          rate: rates[0].rate,
          from_currency: rates[0].from_currency,
          to_currency: rates[0].to_currency
        });
        setIsUsingSampleData(false);
      } else {
        // Use sample data if no exchange rate found
        if (defaultExchangeRates.length > 0) {
          setExchangeRate({
            rate: defaultExchangeRates[0].rate,
            from_currency: defaultExchangeRates[0].from_currency,
            to_currency: defaultExchangeRates[0].to_currency
          });
          setIsUsingSampleData(true);
        }
      }
    } catch (error) {
      console.error("Error loading exchange rate:", error);
      toast.error("加载汇率失败，使用示例数据");
      
      // Use sample data on error
      if (defaultExchangeRates.length > 0) {
        setExchangeRate({
          rate: defaultExchangeRates[0].rate,
          from_currency: defaultExchangeRates[0].from_currency,
          to_currency: defaultExchangeRates[0].to_currency
        });
        setIsUsingSampleData(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load exchange rate history
  const loadExchangeHistory = async () => {
    setIsHistoryLoading(true);
    try {
      // Using our updated service
      const rates = await exchangeRatesService.getLatest();
      
      if (rates && rates.length > 0) {
        setExchangeHistory(rates);
        setIsUsingSampleData(false);
      } else {
        // Use sample data if no exchange history found
        setExchangeHistory(defaultExchangeRates);
        setIsUsingSampleData(true);
      }
    } catch (error) {
      console.error("Error loading exchange history:", error);
      toast.error("加载汇率历史失败，使用示例数据");
      
      // Use sample data on error
      setExchangeHistory(defaultExchangeRates);
      setIsUsingSampleData(true);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Reset to sample data
  const resetToSampleData = () => {
    if (defaultExchangeRates.length > 0) {
      setExchangeRate({
        rate: defaultExchangeRates[0].rate,
        from_currency: defaultExchangeRates[0].from_currency,
        to_currency: defaultExchangeRates[0].to_currency
      });
    }
    setExchangeHistory(defaultExchangeRates);
    setIsUsingSampleData(true);
    toast.success("已重置为示例数据");
  };

  // Handle input change
  const handleChange = (value: string) => {
    setExchangeRate(prev => ({
      ...prev,
      rate: parseFloat(value),
    }));
  };

  // Save exchange rate
  const saveExchangeRate = async () => {
    setIsSaving(true);
    try {
      // Try to save to database
      try {
        // Using our updated service with improved persistence
        const { data, error } = await exchangeRatesService.insert({
          rate: exchangeRate.rate!,
          from_currency: exchangeRate.from_currency || 'CNY',
          to_currency: exchangeRate.to_currency || 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (error) {
          throw error;
        }
        
        console.log("Exchange rate saved successfully:", data);
        
        // Reload history if saved successfully to database
        await loadExchangeHistory();
        setIsUsingSampleData(false);
        toast.success("汇率已成功保存到数据库");
      } catch (error) {
        console.error("Error saving exchange rate to database:", error);
        toast.error("保存汇率到数据库失败，仅在内存中更新");
        
        // Update the history in memory
        const newRate: ExchangeRate = {
          id: `temp-${Date.now()}`,
          rate: exchangeRate.rate!,
          from_currency: exchangeRate.from_currency || 'CNY',
          to_currency: exchangeRate.to_currency || 'USD',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setExchangeHistory([newRate, ...exchangeHistory]);
        setIsUsingSampleData(true);
      }
    } catch (error) {
      console.error("Error saving exchange rate:", error);
      toast.error("保存汇率失败");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get the appropriate locale for date-fns based on the current language
  const getLocale = () => {
    switch (currentLanguage) {
      case 'zh': return zhCN;
      case 'en': return enUS;
      default: return enUS;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString(currentLanguage === 'zh' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format time ago for display
  const timeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: getLocale() });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {isUsingSampleData && (
        <Alert className="bg-amber-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('admin:usingSampleData')}
            <Button variant="link" className="p-0 h-auto text-amber-600" onClick={resetToSampleData}>
              {t('admin:resetToDefaultSampleData')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Exchange Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowLeftRight className="mr-2 h-5 w-5" />
            {t('admin:exchangeRateSettings')}
          </CardTitle>
          <CardDescription>
            {t('admin:exchangeRateDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cny_to_usd">{t('admin:cnyToUsdRate')}</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="cny_to_usd"
                type="number"
                step="0.01"
                min="0.01"
                value={exchangeRate.rate}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={t('admin:exchangeRatePlaceholder')}
              />
              <Button 
                onClick={saveExchangeRate}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isSaving ? t('admin:saving') : t('admin:saveRate')}
              </Button>
            </div>
            <p className="text-sm text-gray-500">{t('admin:currentRateValue', { rate: exchangeRate.rate })}</p>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rate History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            {t('admin:exchangeRateHistory')}
          </CardTitle>
          <CardDescription>
            {t('admin:viewExchangeRateHistory')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isHistoryLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : exchangeHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">{t('admin:modificationTime')}</TableHead>
                  <TableHead>{t('admin:cnyToUsdRate')}</TableHead>
                  <TableHead className="text-right">{t('admin:operationTime')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exchangeHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(item.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.rate}</div>
                      <div className="text-sm text-gray-500">
                        1{item.to_currency} = {item.rate}{item.from_currency}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-gray-500">
                      {timeAgo(item.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('admin:noExchangeRateHistory')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeRateSettings;
