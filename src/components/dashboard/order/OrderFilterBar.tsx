
import { Search, Calendar, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface OrderFilterBarProps {
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  orderTypeFilter: string
  setOrderTypeFilter: (filter: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export const OrderFilterBar = ({
  dateRange,
  setDateRange,
  searchQuery,
  setSearchQuery,
  orderTypeFilter,
  setOrderTypeFilter,
  statusFilter,
  onStatusFilterChange,
  onClearFilters,
  hasActiveFilters,
}: OrderFilterBarProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Filter className="h-4 w-4 text-muted-foreground mr-2" />
            </TooltipTrigger>
            <TooltipContent>
              <p>筛选订单类型</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Select
          value={orderTypeFilter}
          onValueChange={(value) => setOrderTypeFilter(value)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="订单类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="single">单次购买</SelectItem>
            <SelectItem value="subscription">订阅服务</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
            </TooltipTrigger>
            <TooltipContent>
              <p>选择日期范围</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DatePickerWithRange
          selected={dateRange}
          onSelect={setDateRange}
          className="w-[250px]"
        />
      </div>

      <div className="flex items-center rounded-md border px-3 w-[200px]">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <Input
          type="search"
          placeholder="搜索订单号或课程..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
        />
      </div>
      
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onClearFilters}
        >
          清除筛选
        </Button>
      )}
    </div>
  )
}
