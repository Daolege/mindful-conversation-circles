
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslations } from "@/hooks/useTranslations";
import { Loader2, CreditCard, History, Calendar, ArrowLeftRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Tables } from '@/lib/supabase/database.types';

type ExchangeRate = Tables<'exchange_rates'>;

const ExchangeRateSettings = () => {
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<Partial<ExchangeRate>>({
    cny_to_usd: 7.23,
  });
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeRate[]>([]);

  // Load exchange rate on component mount
  useEffect(() => {
    loadExchangeRate();
    loadExchangeHistory();
  }, []);

  // Function to load current exchange rate
  const loadExchangeRate = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // No rows returned is OK for new sites
        throw error;
      }
      
      if (data) {
        setExchangeRate({
          cny_to_usd: data.cny_to_usd,
        });
      }
    } catch (error) {
      console.error("Error loading exchange rate:", error);
      toast.error("加载汇率失败");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load exchange rate history
  const loadExchangeHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      setExchangeHistory(data || []);
    } catch (error) {
      console.error("Error loading exchange history:", error);
      toast.error("加载汇率历史失败");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Handle input change
  const handleChange = (field: keyof ExchangeRate, value: string) => {
    setExchangeRate(prev => ({
      ...prev,
      [field]: parseFloat(value),
    }));
  };

  // Save exchange rate
  const saveExchangeRate = async () => {
    setIsSaving(true);
    try {
      // Create a new record for the exchange rate
      const { error } = await supabase
        .from('exchange_rates')
        .insert({
          cny_to_usd: exchangeRate.cny_to_usd!,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      toast.success("汇率已保存");
      loadExchangeHistory();
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

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
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
      return formatDistanceToNow(date, { addSuffix: true, locale: zhCN });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Exchange Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowLeftRight className="mr-2 h-5 w-5" />
            汇率设置
          </CardTitle>
          <CardDescription>
            设置人民币兑美元的汇率，用于价格换算
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cny_to_usd">人民币/美元汇率</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="cny_to_usd"
                type="number"
                step="0.01"
                min="0.01"
                value={exchangeRate.cny_to_usd}
                onChange={(e) => handleChange('cny_to_usd', e.target.value)}
                placeholder="例如: 7.23"
              />
              <Button 
                onClick={saveExchangeRate}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {isSaving ? '保存中...' : '保存汇率'}
              </Button>
            </div>
            <p className="text-sm text-gray-500">当前值: 1美元 = {exchangeRate.cny_to_usd}人民币</p>
          </div>
        </CardContent>
      </Card>

      {/* Exchange Rate History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            汇率修改历史
          </CardTitle>
          <CardDescription>
            查看汇率的历史修改记录
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
                  <TableHead className="w-[180px]">修改时间</TableHead>
                  <TableHead>人民币/美元汇率</TableHead>
                  <TableHead className="text-right">操作时间</TableHead>
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
                      <div className="font-medium">{item.cny_to_usd}</div>
                      <div className="text-sm text-gray-500">
                        1美元 = {item.cny_to_usd}人民币
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
              <p className="text-gray-500">暂无汇率修改记录</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExchangeRateSettings;
