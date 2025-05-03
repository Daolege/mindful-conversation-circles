
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentIconsService, PaymentIcon } from '@/lib/supabaseUtils';
import { defaultPaymentIcons } from '@/lib/defaultData';

const PaymentIcons: React.FC = () => {
  // Fetch payment icons from the database using our service
  const { data: paymentIcons = [], isError } = useQuery({
    queryKey: ['payment-icons'],
    queryFn: async () => {
      try {
        // Use our service function instead of direct Supabase call
        return await paymentIconsService.getAll();
      } catch (error) {
        console.error("Error fetching payment icons:", error);
        return defaultPaymentIcons;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use database icons if available, otherwise use defaults
  const iconsToDisplay = (!isError && paymentIcons.length > 0) ? paymentIcons : defaultPaymentIcons;

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
