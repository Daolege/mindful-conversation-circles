
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PaymentIcons: React.FC = () => {
  // Fetch payment icons from the database
  const { data: paymentIcons = [] } = useQuery({
    queryKey: ['payment-icons'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('payment_icons')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error("Error fetching payment icons:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Default payment methods if none are found in the database
  const defaultPaymentMethods = [
    {
      name: "Visa",
      icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png"
    },
    {
      name: "MasterCard",
      icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png"
    },
    {
      name: "PayPal",
      icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1280px-PayPal.svg.png"
    },
    {
      name: "Apple Pay",
      icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/1280px-Apple_Pay_logo.svg.png"
    },
    {
      name: "Alipay",
      icon_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Alipay_logo.svg/1280px-Alipay_logo.svg.png"
    }
  ];

  // Use database icons if available, otherwise use defaults
  const iconsToDisplay = paymentIcons.length > 0 ? paymentIcons : defaultPaymentMethods;

  return (
    <div className="flex flex-wrap gap-3">
      {iconsToDisplay.map((method, index) => (
        <div key={`payment-${index}`} className="bg-white rounded-md p-1.5 h-8 w-14 flex items-center justify-center">
          <img 
            src={method.icon_url} 
            alt={method.name} 
            title={method.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      ))}
    </div>
  );
};

export default PaymentIcons;
