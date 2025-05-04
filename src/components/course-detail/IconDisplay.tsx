
import React from 'react';
import { 
  Check, Target, BookOpen, Users,
  Smile, AlertCircle, BarChart, Award,
  
  // Custom icons for objectives
  Globe as BrandOverseas,
  Package as MasteryOfDomestic,
  Network as CompleteIndustry,
  Hammer as LocalizationOperation,
  AlertTriangle as CrossBorder,
  Map as LocalMarket,
  
  // Custom icons for requirements/learning mode
  Video as OnlineRecorded,
  Calendar as WeeklyDiagnosis,
  Briefcase as FirstLineStore,
  MessageCircle as PrivateDomain,
  UserPlus as OpenExchange,
  Puzzle as DifficultCases,
  
  // Custom icons for audience
  User as Individuals,
  ShoppingCart as SupplyChain,
  RefreshCw as Transition,
  TrendingUp as MakeMoney,
  DollarSign as MoneyHungry,
  Laptop as DigitalNomad,
  Shield as AntiRule,
  
  // Common icons
  Activity, Heart, Star, 
  LucideIcon,
  
  // Icons for course highlights
  Video, Clock, Languages, FileText, Book
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface IconDisplayProps {
  iconName?: string;
  className?: string;
  size?: number;
  fallback?: React.ReactNode;
}

// Define the icon map with custom icon names
const iconMap: Record<string, React.ForwardRefExoticComponent<any>> = {
  // Module header icons
  'target': Target,
  'book-open': BookOpen,
  'users': Users,
  
  // Custom icons for objectives
  'brand-overseas': BrandOverseas,
  'mastery-of-domestic': MasteryOfDomestic,
  'complete-industry': CompleteIndustry,
  'localization-operation': LocalizationOperation,
  'cross-border': CrossBorder,
  'local-market': LocalMarket,
  
  // Custom icons for requirements/learning mode
  'online-recorded': OnlineRecorded,
  'weekly-diagnosis': WeeklyDiagnosis,
  'first-line-store': FirstLineStore,
  'private-domain': PrivateDomain,
  'open-exchange': OpenExchange,
  'difficult-cases': DifficultCases,
  
  // Custom icons for audience
  'individuals': Individuals,
  'supply-chain': SupplyChain,
  'transition': Transition,
  'make-money': MakeMoney,
  'money-hungry': MoneyHungry,
  'digital-nomad': DigitalNomad,
  'anti-rule': AntiRule,
  
  // Common icons
  'check': Check,
  'activity': Activity,
  'heart': Heart,
  'star': Star,
  'award': Award,
  'smile': Smile,
  'alert-circle': AlertCircle,
  'bar-chart': BarChart,
  
  // Icons for course highlights
  'video': Video,
  'clock': Clock,
  'language': Languages,
  'file-text': FileText,
  'book': Book,
};

export const IconDisplay: React.FC<IconDisplayProps> = ({
  iconName,
  className,
  size = 24,
  fallback = <Check size={24} />
}) => {
  if (!iconName) {
    return <>{fallback}</>;
  }

  const Icon = iconMap[iconName];
  
  if (!Icon) {
    return <>{fallback}</>;
  }

  return <Icon className={cn(className)} size={size} />;
};

export default IconDisplay;
