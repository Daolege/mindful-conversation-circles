
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserActionsDropdown } from "../UserActionsDropdown";
import { UserWithRoles } from "@/lib/types/user-types";
import { Mail, User, Github, Facebook, Twitter } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserRowProps {
  user: UserWithRoles;
  isHighlighted: boolean;
  isUpdating: boolean;
  onRoleChange: (userId: string, role: string, hasRole: boolean) => Promise<void>;
  onStatusChange: (userId: string, isCurrentlyActive: boolean) => Promise<void>;
  selected: boolean;
  onSelectChange: (userId: string, checked: boolean) => void;
}

export const UserRow: React.FC<UserRowProps> = ({
  user,
  isHighlighted,
  isUpdating,
  onRoleChange,
  onStatusChange,
  selected,
  onSelectChange
}) => {
  const isUserActive = user.is_active !== false;

  const getLoginMethodIcon = (method: string | null) => {
    const iconClasses = "h-4 w-4 mr-1.5";
    
    switch (method?.toLowerCase()) {
      case 'email':
        return <Mail className={`${iconClasses} text-blue-500`} />;
      case 'google':
        return (
          <div className="h-4 w-4 mr-1.5 flex items-center justify-center">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
        );
      case 'facebook':
        return <Facebook className={`${iconClasses} text-blue-600`} />;
      case 'twitter':
        return <Twitter className={`${iconClasses} text-blue-400`} />;
      case 'github':
        return <Github className={`${iconClasses}`} />;
      default:
        return <User className={`${iconClasses} text-gray-500`} />;
    }
  };

  const rowVariants = {
    highlighted: { 
      backgroundColor: "rgba(253, 224, 71, 0.2)",
      transition: { duration: 0.3 }
    },
    normal: { 
      backgroundColor: "rgba(255, 255, 255, 1)",
      transition: { duration: 0.3 }
    },
    selected: {
      backgroundColor: "rgba(243, 244, 246, 0.8)",
      transition: { duration: 0.2 }
    }
  };
  
  const getVariant = () => {
    if (isHighlighted) return "highlighted";
    if (selected) return "selected";
    return "normal";
  };

  return (
    <motion.tr
      initial={false}
      animate={getVariant()}
      variants={rowVariants}
      className="group border-b border-gray-100 hover:bg-gray-50"
      whileHover={{ scale: 1.005, transition: { duration: 0.15 } }}
      role="row"
    >
      <TableCell className="w-[60px] text-center">
        <div className="flex items-center justify-center">
          <Checkbox 
            checked={selected} 
            onCheckedChange={(checked) => onSelectChange(user.id, !!checked)}
            aria-label={`选择用户 ${user.full_name || user.email?.split('@')[0] || '未知用户'}`}
          />
        </div>
      </TableCell>
      <TableCell className={`w-[150px] font-medium ${isHighlighted ? 'text-black font-bold' : ''}`}>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate block">
                {user.full_name || user.email?.split('@')[0] || '未知用户'}
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white rounded-10 border-gray-700">
              {user.full_name || user.email?.split('@')[0] || '未知用户'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className={`w-[200px] ${isHighlighted ? 'text-black font-bold' : ''}`}>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="truncate block">
                {user.email || '未设置'}
              </span>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white rounded-10 border-gray-700">
              {user.email || '未设置'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="w-[140px]">
        <div className="flex gap-1 flex-wrap">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map((role) => (
              <Badge 
                key={role} 
                variant={role === 'admin' ? "default" : "secondary"}
                className={`rounded-10 transform transition-all duration-200 ${role === 'admin' 
                  ? "bg-gray-800 text-white hover:bg-gray-700 hover:scale-105" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"}`}
              >
                {role === 'admin' ? '管理员' : '用户'}
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="rounded-10">普通用户</Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="w-[100px]">
        <Badge 
          variant={isUserActive ? "success" : "destructive"}
          className={`rounded-10 transform transition-all duration-200 ${isUserActive 
            ? "bg-green-100 text-green-800 hover:bg-green-200 hover:scale-105" 
            : "bg-red-100 text-red-800 hover:bg-red-200 hover:scale-105"}`}
        >
          {isUserActive ? '正常' : '已禁用'}
        </Badge>
      </TableCell>
      <TableCell className={`w-[150px] text-gray-600 ${isHighlighted ? 'text-black font-bold' : ''}`}>
        {format(new Date(user.registration_date || user.created_at), 'yyyy-MM-dd HH:mm')}
      </TableCell>
      <TableCell className={`w-[150px] text-gray-600 ${isHighlighted ? 'text-black font-bold' : ''}`}>
        {user.last_login_at 
          ? format(new Date(user.last_login_at), 'yyyy-MM-dd HH:mm')
          : '从未登录'
        }
      </TableCell>
      <TableCell className="w-[120px]">
        <Badge
          variant="outline"
          className="rounded-10 flex items-center bg-gray-50 border-gray-200 text-gray-700 py-1 px-2 transition-all duration-200 hover:bg-gray-100"
        >
          {getLoginMethodIcon(user.login_method)}
          {user.login_method ? 
            user.login_method.charAt(0).toUpperCase() + user.login_method.slice(1) : 
            '未知'
          }
        </Badge>
      </TableCell>
      <TableCell className="w-[80px] text-right">
        <UserActionsDropdown
          userId={user.id}
          isAdmin={user.roles?.includes('admin') || false}
          isActive={isUserActive}
          onRoleChange={onRoleChange}
          onStatusChange={onStatusChange}
          isUpdating={isUpdating}
        />
      </TableCell>
    </motion.tr>
  );
};
