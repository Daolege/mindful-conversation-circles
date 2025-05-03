
import { formatAmount } from "@/lib/utils/currencyUtils";

interface LocalizedCurrencyProps {
  amount: number;
  currency?: string;
  className?: string;
}

const LocalizedCurrency = ({ amount, currency = 'CNY', className = '' }: LocalizedCurrencyProps) => {
  return (
    <span className={className}>
      {formatAmount(amount, currency)}
    </span>
  );
};

export default LocalizedCurrency;
