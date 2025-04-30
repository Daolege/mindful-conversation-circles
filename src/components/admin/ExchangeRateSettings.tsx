
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { handleExchangeRateQueryError } from "@/lib/supabaseUtils";

type FormValues = {
  rate: string;
};

export function ExchangeRateSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { data: exchangeRate, isLoading } = useQuery({
    queryKey: ['exchange-rate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('from_currency', 'CNY' as any)
        .eq('to_currency', 'USD' as any)
        .single();

      return handleExchangeRateQueryError(data, error);
    },
  });

  const form = useForm<FormValues>({
    defaultValues: {
      rate: exchangeRate?.rate?.toString() || "0.14",
    },
  });

  const updateRateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const { error } = await supabase.rpc('update_exchange_rate', {
        p_from_currency: 'CNY',
        p_to_currency: 'USD',
        p_rate: parseFloat(values.rate),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-rate'] });
      toast.success("汇率设置已保存");
    },
    onError: (error) => {
      console.error('Error saving exchange rate:', error);
      toast.error("保存汇率设置失败");
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    await updateRateMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>人民币兑美元汇率</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.0001"
                  placeholder="输入汇率"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                设置1人民币等于多少美元，例如：0.14表示1人民币=0.14美元
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              正在保存
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              保存设置
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
