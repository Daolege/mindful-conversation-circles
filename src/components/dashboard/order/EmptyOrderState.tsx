
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

interface EmptyOrderStateProps {
  hasFilters: boolean
  onClearFilters: () => void
}

export const EmptyOrderState = ({ hasFilters, onClearFilters }: EmptyOrderStateProps) => {
  return (
    <div className="text-center py-10">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
        <ShoppingCart className="h-6 w-6 text-gray-500" />
      </div>
      
      <h3 className="text-lg font-medium mb-2">暂无订单记录</h3>
      
      {hasFilters ? (
        <div className="space-y-2">
          <p className="text-muted-foreground">没有找到符合当前筛选条件的订单</p>
          <Button 
            variant="link" 
            onClick={onClearFilters}
            className="mt-2"
          >
            清除筛选条件
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground">当前没有任何订单记录</p>
      )}
    </div>
  )
}
