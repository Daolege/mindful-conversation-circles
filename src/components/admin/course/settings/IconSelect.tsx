
import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, ChevronDown, Search, X,
  Target, BookOpen, Users,
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
  
  // Additional common icons
  Activity, Anchor, Archive, ArrowRight,
  AtSign, Bell, Bookmark, Calendar, Camera, 
  Clipboard, Clock, Cloud, Code, Coffee,
  Command, Compass, Copy, Database, Download,
  Edit, File, FileText, Flag, Gift, Heart, 
  Home, Image, Inbox, Info, Key, Layers,
  Layout, Link, List, Lock, Mail, Map, 
  Menu, MessageSquare, Mic, Monitor, Moon, 
  Music, Paperclip, Pencil, Phone, PieChart,
  Play, Plus, Power, Printer, Radio, 
  Save, Settings, Share, ShoppingBag, Slash,
  Smartphone, Speaker, Star, Sun, Tablet, 
  Tag, Terminal, ThumbsUp, Tool, Trash2, 
  Truck, Tv, Upload, User, Video, Zap,
  LucideIcon
} from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  
  // Additional common icons
  'activity': Activity,
  'anchor': Anchor,
  'archive': Archive,
  'arrow-right': ArrowRight,
  'at-sign': AtSign,
  'bell': Bell,
  'bookmark': Bookmark,
  'calendar': Calendar,
  'camera': Camera,
  'clipboard': Clipboard,
  'clock': Clock,
  'cloud': Cloud,
  'code': Code,
  'coffee': Coffee,
  'command': Command,
  'compass': Compass,
  'copy': Copy,
  'database': Database,
  'download': Download,
  'edit': Edit,
  'file': File,
  'file-text': FileText,
  'flag': Flag,
  'gift': Gift,
  'heart': Heart,
  'home': Home,
  'image': Image,
  'inbox': Inbox,
  'info': Info,
  'key': Key,
  'layers': Layers,
  'layout': Layout,
  'link': Link,
  'list': List,
  'lock': Lock,
  'mail': Mail,
  'map': Map,
  'menu': Menu,
  'message-square': MessageSquare,
  'mic': Mic,
  'monitor': Monitor,
  'moon': Moon,
  'music': Music,
  'paperclip': Paperclip,
  'pencil': Pencil,
  'phone': Phone,
  'pie-chart': PieChart,
  'play': Play,
  'plus': Plus,
  'power': Power,
  'printer': Printer,
  'radio': Radio,
  'save': Save,
  'settings': Settings,
  'share': Share,
  'shopping-bag': ShoppingBag,
  'slash': Slash,
  'smartphone': Smartphone,
  'speaker': Speaker,
  'star': Star,
  'sun': Sun,
  'tablet': Tablet,
  'tag': Tag,
  'terminal': Terminal,
  'thumbs-up': ThumbsUp,
  'tool': Tool,
  'trash-2': Trash2,
  'truck': Truck,
  'tv': Tv,
  'upload': Upload,
  'user': User,
  'video': Video,
  'zap': Zap,
  'smile': Smile,
  'alert-circle': AlertCircle,
  'bar-chart': BarChart,
  'award': Award
};

// IconGroup type for categorizing icons
interface IconGroup {
  label: string;
  icons: string[];
}

// Organize icons into groups
const iconGroups: IconGroup[] = [
  {
    label: "模块标题图标",
    icons: ['target', 'book-open', 'users']
  },
  {
    label: "学习目标图标",
    icons: ['brand-overseas', 'mastery-of-domestic', 'complete-industry', 
            'localization-operation', 'cross-border', 'local-market']
  },
  {
    label: "学习模式图标",
    icons: ['online-recorded', 'weekly-diagnosis', 'first-line-store', 
            'private-domain', 'open-exchange', 'difficult-cases']
  },
  {
    label: "适合人群图标",
    icons: ['individuals', 'supply-chain', 'transition', 'make-money', 
            'money-hungry', 'digital-nomad', 'anti-rule']
  },
  {
    label: "常用图标",
    icons: ['smile', 'heart', 'star', 'award', 'thumbs-up', 'bell', 'gift']
  },
  {
    label: "其他图标",
    icons: ['activity', 'anchor', 'archive', 'arrow-right', 'at-sign',
            'bookmark', 'calendar', 'camera', 'clipboard', 'clock', 
            'cloud', 'code', 'coffee', 'command', 'compass', 'copy', 
            'database', 'download', 'edit', 'file', 'file-text', 'flag',
            'home', 'image', 'inbox', 'info', 'key', 'layers', 'layout',
            'link', 'list', 'lock', 'mail', 'map', 'menu', 'message-square',
            'mic', 'monitor', 'moon', 'music', 'paperclip', 'pencil',
            'phone', 'pie-chart', 'play', 'plus', 'power', 'printer',
            'radio', 'save', 'settings', 'share', 'shopping-bag', 'slash',
            'smartphone', 'speaker', 'sun', 'tablet', 'tag', 'terminal',
            'tool', 'trash-2', 'truck', 'tv', 'upload', 'user', 'video', 'zap',
            'alert-circle', 'bar-chart']
  }
];

// Human-readable labels for icon names
const iconLabels: Record<string, string> = {
  'target': '目标',
  'book-open': '书籍',
  'users': '用户组',
  'brand-overseas': '品牌出海',
  'mastery-of-domestic': '国货掌握',
  'complete-industry': '行业圈子',
  'localization-operation': '本土化运营',
  'cross-border': '跨境纠纷',
  'local-market': '本土市场',
  'online-recorded': '在线视频',
  'weekly-diagnosis': '周诊断',
  'first-line-store': '一线店铺',
  'private-domain': '私域问题',
  'open-exchange': '开放交流',
  'difficult-cases': '困难案例',
  'individuals': '个人企业',
  'supply-chain': '供应链',
  'transition': '转型副业',
  'make-money': '搞钱流量',
  'money-hungry': '收割者',
  'digital-nomad': '数字游民',
  'anti-rule': '规则对抗',
  'smile': '笑脸',
  // Basic labels for rest
  'activity': '活动',
  'heart': '心形',
  'star': '星形',
  'award': '奖励',
  'thumbs-up': '点赞',
  'bell': '铃铛',
  'gift': '礼物'
};

export interface IconSelectProps {
  value: string;
  onChange: (icon: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  buttonClassName?: string;
  popoverClassName?: string;
  placeholder?: string;
}

export const IconSelect: React.FC<IconSelectProps> = ({
  value,
  onChange,
  size = 'md',
  className = '',
  buttonClassName = '',
  popoverClassName = '',
  placeholder = '选择图标'
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Determine icon sizes based on the size prop
  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'lg': return 28;
      default: return 20; // md
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'h-7 w-7 p-0';
      case 'lg': return 'h-12 w-12 p-0';
      default: return 'h-10 w-10 p-0'; // md
    }
  };

  // Get the icon component
  const IconComponent = value ? iconMap[value] : null;
  const iconSize = getIconSize();
  const buttonSize = getButtonSize();

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={buttonRef}
            variant="outline"
            className={cn(
              buttonSize,
              "flex items-center justify-center rounded-full",
              !value && "text-muted-foreground",
              buttonClassName
            )}
            onClick={() => setOpen(!open)}
          >
            {IconComponent ? (
              <IconComponent size={iconSize} />
            ) : (
              <span className="text-xs">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className={cn("w-[300px] p-0", popoverClassName)} 
          align="start"
        >
          <Command>
            <CommandInput 
              placeholder="搜索图标..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList className="max-h-[300px] overflow-auto">
              <CommandEmpty>未找到图标</CommandEmpty>
              {iconGroups.map((group) => {
                // Filter icons based on search query
                const filteredIcons = group.icons.filter(iconName => {
                  const label = iconLabels[iconName] || iconName;
                  return (
                    iconName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    label.toLowerCase().includes(searchQuery.toLowerCase())
                  );
                });
                
                if (filteredIcons.length === 0) return null;
                
                return (
                  <CommandGroup key={group.label} heading={group.label}>
                    <div className="grid grid-cols-5 gap-1 p-2">
                      {filteredIcons.map(iconName => {
                        const Icon = iconMap[iconName];
                        const label = iconLabels[iconName] || iconName;
                        
                        return (
                          <CommandItem
                            key={iconName}
                            value={`${iconName}-${label}`}
                            onSelect={() => {
                              onChange(iconName);
                              setOpen(false);
                            }}
                            className="flex flex-col items-center justify-center px-2 py-3 rounded-md hover:bg-accent"
                          >
                            <div className={cn(
                              "flex items-center justify-center h-8 w-8 rounded-md",
                              value === iconName && "bg-primary/10"
                            )}>
                              {Icon && <Icon size={20} className={cn(value === iconName && "text-primary")} />}
                            </div>
                            <span className="mt-1 text-xs text-center text-muted-foreground truncate w-full">
                              {label}
                            </span>
                            {value === iconName && (
                              <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </div>
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default IconSelect;
