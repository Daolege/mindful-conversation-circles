
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "@/hooks/useTranslations";
import { Loader2, CreditCard, History, Calendar, ArrowLeftRight, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, CalendarArrowDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { ExchangeRate, exchangeRatesService } from '@/lib/supabaseUtils';
import { defaultExchangeRates } from '@/lib/defaultData';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkSupabaseConnection } from '@/integrations/supabase/client';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import { DateRange } from "react-day-picker";

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
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Date filter state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [useAllRecords, setUseAllRecords] = useState(true);
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  // Load exchange rate on component mount or when connection is established
  useEffect(() => {
    if (connectionStatus === 'connected') {
      loadExchangeRate();
      loadExchangeHistory();
    }
  }, [connectionStatus]);

  // Function to check database connection
  const checkConnection = async () => {
    setConnectionStatus('checking');
    const isConnected = await checkSupabaseConnection();
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    setHasError(!isConnected);
    
    if (!isConnected) {
      setErrorMessage(t('admin:databaseConnectionError'));
      setIsUsingSampleData(true);
    }
  };

  // Function to load current exchange rate
  const loadExchangeRate = async () => {
    setIsLoading(true);
    setErrorMessage('');
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
      toast.error(t('admin:errorLoadingExchangeRate'));
      setHasError(true);
      setErrorMessage(t('admin:errorLoadingExchangeRate'));
      
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

  // Function to load exchange rate history with pagination and optional date filter
  const loadExchangeHistory = async (page = currentPage, itemsPerPage = pageSize, dateFilter = useAllRecords ? undefined : dateRange) => {
    setIsHistoryLoading(true);
    try {
      // Use the new getAllHistory function with pagination
      const result = await exchangeRatesService.getAllHistory(
        page, 
        itemsPerPage,
        dateFilter
      );
      
      if (result && result.data && result.data.length > 0) {
        setExchangeHistory(result.data);
        setTotalRecords(result.count || 0);
        setCurrentPage(result.page);
        setPageSize(result.pageSize);
        setIsUsingSampleData(false);
      } else {
        // Use sample data if no exchange history found
        setExchangeHistory(defaultExchangeRates);
        setTotalRecords(defaultExchangeRates.length);
        setIsUsingSampleData(true);
      }
    } catch (error) {
      console.error("Error loading exchange history:", error);
      toast.error(t('admin:errorLoadingExchangeHistory'));
      
      // Use sample data on error
      setExchangeHistory(defaultExchangeRates);
      setTotalRecords(defaultExchangeRates.length);
      setIsUsingSampleData(true);
    } finally {
      setIsHistoryLoading(false);
    }
  };
  
  // Effect for handling date range changes
  useEffect(() => {
    if (!useAllRecords && dateRange && dateRange.from && dateRange.to) {
      loadExchangeHistory(1, pageSize, dateRange);
    } else if (useAllRecords) {
      loadExchangeHistory(currentPage, pageSize);
    }
  }, [dateRange, useAllRecords]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadExchangeHistory(page, pageSize, useAllRecords ? undefined : dateRange);
  };
  
  // Toggle between all records and date filtered records
  const handleToggleAllRecords = (checked: boolean) => {
    setUseAllRecords(checked);
    if (checked) {
      loadExchangeHistory(1, pageSize);
    } else if (dateRange && dateRange.from && dateRange.to) {
      loadExchangeHistory(1, pageSize, dateRange);
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
    setTotalRecords(defaultExchangeRates.length);
    setIsUsingSampleData(true);
    toast.success(t('admin:resetToSampleDataSuccess'));
  };

  // Handle input change
  const handleChange = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return;
    }
    
    setExchangeRate(prev => ({
      ...prev,
      rate: numValue,
    }));
  };

  // Save exchange rate
  const saveExchangeRate = async () => {
    if (connectionStatus !== 'connected') {
      toast.error(t('admin:databaseConnectionError'));
      setErrorMessage(t('admin:databaseConnectionRequired'));
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      // Ensure we have the required fields before saving
      if (!exchangeRate.rate) {
        throw new Error(t('admin:rateCannotBeEmpty'));
      }
      
      // Try to save to database
      const { data, error } = await exchangeRatesService.insert({
        rate: exchangeRate.rate,
        from_currency: exchangeRate.from_currency || 'CNY',
        to_currency: exchangeRate.to_currency || 'USD',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      if (error) {
        // Handle specific error cases
        if (error.message && error.message.includes('already exists')) {
          toast.warning(t('admin:currencyPairExists'));
          throw new Error(t('admin:currencyPairExists'));
        }
        throw error;
      }
      
      console.log("Exchange rate saved successfully:", data);
      
      // Reload history if saved successfully to database
      await loadExchangeHistory();
      setIsUsingSampleData(false);
      toast.success(t('admin:exchangeRateSavedSuccess'));
      setHasError(false);
    } catch (error: any) {
      console.error("Error saving exchange rate:", error);
      toast.error(error.message || t('admin:errorSavingExchangeRate'));
      setHasError(true);
      setErrorMessage(error.message || t('admin:errorSavingExchangeRate'));
    } finally {
      setIsSaving(false);
    }
  };

  // Retry connection if there was an error
  const retryConnection = async () => {
    setErrorMessage('');
    setHasError(false);
    toast.info(t('admin:retryingConnection'));
    
    try {
      await checkConnection();
      if (connectionStatus === 'connected') {
        loadExchangeRate();
        loadExchangeHistory();
      }
    } catch (error) {
      console.error("Failed to reconnect:", error);
      setHasError(true);
      setErrorMessage(t('admin:reconnectionFailed'));
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

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    let pages: (number | 'ellipsis')[] = [];
    
    // Always show first page
    pages.push(1);
    
    // For small number of pages, show all
    if (totalPages <= 7) {
      for (let i = 2; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // For large number of pages, show current region with ellipsis
    if (currentPage > 3) {
      pages.push('ellipsis');
    }
    
    // Pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis for end
    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }
    
    // Always show last page if not already included
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="space-y-6">
      {connectionStatus === 'disconnected' && (
        <Alert variant="destructive" className="bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{t('admin:databaseConnectionError')}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={retryConnection}
              className="ml-2 bg-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('admin:retryConnection')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {hasError && errorMessage && (
        <Alert variant="destructive" className="bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage}
            <Button variant="link" className="p-0 h-auto text-red-600" onClick={retryConnection}>
              {t('admin:retryConnection')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
                disabled={isSaving || connectionStatus !== 'connected'}
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              {t('admin:exchangeRateHistory')}
            </CardTitle>
            <CardDescription>
              {totalRecords > 0 
                ? t('admin:viewingHistoricalRates', { count: totalRecords })
                : t('admin:viewExchangeRateHistory')
              }
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={showDateFilter ? "bg-blue-50" : ""}
            >
              <CalendarArrowDown className="h-4 w-4 mr-2" />
              {t('admin:dateFilter')}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => loadExchangeHistory()}
              disabled={isHistoryLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isHistoryLoading ? 'animate-spin' : ''}`} />
              {t('admin:refresh')}
            </Button>
          </div>
        </CardHeader>
        
        {/* Date filter section */}
        {showDateFilter && (
          <CardContent className="border-b border-gray-200 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-all-records" 
                  checked={useAllRecords} 
                  onCheckedChange={handleToggleAllRecords}
                />
                <Label htmlFor="show-all-records">{t('admin:showAllRecords')}</Label>
              </div>
              
              <div className={`transition-opacity duration-300 ${useAllRecords ? 'opacity-50' : 'opacity-100'}`}>
                <DatePickerWithRange
                  selected={dateRange}
                  onSelect={setDateRange}
                  className="w-full sm:w-auto"
                />
              </div>
            </div>
          </CardContent>
        )}
        
        <CardContent>
          {isHistoryLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : exchangeHistory.length > 0 ? (
            <>
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
                          1 {item.to_currency} = {item.rate} {item.from_currency}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-gray-500">
                        {timeAgo(item.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {getPageNumbers().map((pageNum, index) => (
                        <PaginationItem key={index}>
                          {pageNum === 'ellipsis' ? (
                            <span className="flex h-9 w-9 items-center justify-center text-gray-400">...</span>
                          ) : (
                            <PaginationLink 
                              isActive={pageNum === currentPage}
                              onClick={() => handlePageChange(pageNum as number)}
                            >
                              {pageNum}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
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
