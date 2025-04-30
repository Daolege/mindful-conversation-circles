
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Check, Users, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface CoursePurchaseCardProps {
  courseId: number;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  duration?: string;
  studentCount?: number;
  currency?: string;
}

export const CoursePurchaseCard = ({
  courseId,
  title,
  price,
  originalPrice,
  imageUrl,
  duration,
  studentCount,
  currency = 'usd'
}: CoursePurchaseCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handlePurchase = () => {
    // 确保传递courseId和currency到结账页面
    navigate(`/checkout?courseId=${courseId}`);
    console.log("Navigating to checkout with course currency:", currency);
  };

  const handleAddToCart = () => {
    // 这里可以添加购物车功能的逻辑
    console.log("Added to cart:", courseId, "price:", price, "currency:", currency);
    // 可以在这里添加一个Toast通知
  };

  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;

  // 格式化价格显示，根据货币类型
  const formatPrice = (amount: number) => {
    return formatCurrency(amount, currency.toUpperCase());
  };

  return (
    <Card 
      className="overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          className="w-full h-48 object-cover"
        />
        {discount > 0 && (
          <Badge className="absolute top-4 right-4 bg-red-500 text-white font-bold py-1 px-2">
            {discount}% 优惠
          </Badge>
        )}
      </div>
      <CardContent className="p-6 bg-white">
        <h3 className="font-semibold text-lg text-gray-900 mb-4">{title}</h3>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">价格:</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{formatPrice(price)}</span>
              {originalPrice && discount > 0 && (
                <span className="text-gray-500 line-through text-sm">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>
          
          {duration && (
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" /> 课程时长:
              </span>
              <span>{duration}</span>
            </div>
          )}
          
          {studentCount && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" /> 学员人数:
              </span>
              <span>{studentCount}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            className={`w-full flex items-center justify-center gap-2 transition-all duration-300 ${
              isHovered 
                ? "bg-knowledge-dark hover:bg-knowledge-dark" 
                : "bg-knowledge-primary hover:bg-knowledge-secondary"
            }`}
            onClick={handlePurchase}
          >
            <Check className="h-4 w-4" />
            立即购买
          </Button>
          
          <Button
            variant="outline"
            className="w-full border-knowledge-primary text-knowledge-primary hover:bg-knowledge-primary hover:text-white transition-all duration-300"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            加入购物车
          </Button>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            购买即表示您同意我们的
            <a href="/terms" className="text-knowledge-primary hover:underline mx-1">服务条款</a>
            和
            <a href="/privacy" className="text-knowledge-primary hover:underline mx-1">隐私政策</a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
