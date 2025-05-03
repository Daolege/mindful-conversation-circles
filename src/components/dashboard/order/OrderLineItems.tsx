
import { TFunction } from "i18next";
import LocalizedCurrency from "@/components/LocalizedCurrency";
import { useTranslations } from "@/hooks/useTranslations";

interface OrderLineItem {
  id: string | number;
  title?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  currency?: string;
  discount?: number;
  type?: string;
  course_id?: string | number;
}

interface OrderLineItemsProps {
  items: OrderLineItem[];
  t: TFunction;
}

const OrderLineItems = ({ items, t }: OrderLineItemsProps) => {
  const { t: tCustom } = useTranslations();
  
  if (!items || !items.length) {
    return <div className="text-sm text-gray-500">{tCustom('orders:noItems')}</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{tCustom('orders:items')}</h3>
      
      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="[&>th]:p-2 [&>th]:text-left [&>th]:font-medium [&>th]:text-muted-foreground">
              <th>{tCustom('orders:item')}</th>
              <th className="text-center">{tCustom('orders:quantity')}</th>
              <th className="text-right">{tCustom('orders:price')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className="[&>td]:p-2">
                <td>
                  <div className="font-medium">{item.title || `${tCustom('orders:product')} #${item.id}`}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  )}
                </td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">
                  <LocalizedCurrency 
                    amount={item.total_price} 
                    currency={item.currency || 'CNY'} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderLineItems;
