import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Home } from "lucide-react";
import { NavbarSearch } from "./NavbarSearch";
import React from "react"; // 添加 React 导入，使用 memo

interface MobileNavbarMenuProps {
  user: any;
  isAdmin: boolean;
  setIsMenuOpen: (open: boolean) => void;
  handleSignOut: () => void;
  showAboutLink?: boolean;
}

// 使用 React.memo 以避免不必要的重新渲染
export const MobileNavbarMenu = React.memo(({
  user,
  isAdmin,
  setIsMenuOpen,
  handleSignOut,
  showAboutLink = true,
}: MobileNavbarMenuProps) => {
  const navigate = useNavigate();

  const handleLinkClick = React.useCallback(() => {
    setIsMenuOpen(false);
  }, [setIsMenuOpen]);

  const handleLoginClick = React.useCallback(() => {
    navigate("/auth");
    setIsMenuOpen(false);
  }, [navigate, setIsMenuOpen]);

  const handleSignOutClick = React.useCallback(() => {
    handleSignOut();
    setIsMenuOpen(false);
  }, [handleSignOut, setIsMenuOpen]);

  return (
    <div className="md:hidden pt-4 pb-2 space-y-2">
      <Link 
        to="/" 
        className="flex items-center py-2 px-4 hover:bg-knowledge-soft rounded"
        onClick={handleLinkClick}
      >
        <Home size={18} className="mr-2" />
        首页
      </Link>
      
      <Link 
        to="/home" 
        className="block py-2 px-4 hover:bg-knowledge-soft rounded"
        onClick={handleLinkClick}
      >
        全新主页
      </Link>
      
      <Link 
        to="/courses" 
        className="block py-2 px-4 hover:bg-knowledge-soft rounded"
        onClick={handleLinkClick}
      >
        全部课程
      </Link>
      
      {showAboutLink && (
        <Link 
          to="/about" 
          className="block py-2 px-4 hover:bg-knowledge-soft rounded"
          onClick={handleLinkClick}
        >
          关于我们
        </Link>
      )}
      {user && isAdmin && (
        <Link 
          to="/admin" 
          className="flex items-center gap-2 py-2 px-4 text-knowledge-primary hover:bg-knowledge-soft rounded"
          onClick={handleLinkClick}
        >
          <Shield size={18} />
          管理后台
        </Link>
      )}
      {user && (
        <Link 
          to="/auth" 
          className="block py-2 px-4 hover:bg-knowledge-soft rounded"
          onClick={handleLinkClick}
        >
          账号管理
        </Link>
      )}
      <div className="relative mt-3 px-4">
        <NavbarSearch inputClassName="w-full" />
      </div>
      <div className="flex space-x-3 mt-4 px-4">
        {!user && (
          <Button 
            variant="outline" 
            onClick={handleLoginClick}
            className="w-full border-knowledge-primary text-knowledge-primary hover:bg-knowledge-primary hover:text-white"
          >
            登录
          </Button>
        )}
        {!user && (
          <Button 
            onClick={handleLoginClick}
            className="w-full bg-knowledge-primary hover:bg-knowledge-secondary text-white"
          >
            注册
          </Button>
        )}
        {user && (
          <Button 
            variant="outline" 
            onClick={handleSignOutClick}
            className="w-full border-knowledge-primary text-knowledge-primary hover:bg-knowledge-primary hover:text-white"
          >
            退出
          </Button>
        )}
      </div>
    </div>
  );
});

// 设置组件显示名称，便于调试
MobileNavbarMenu.displayName = 'MobileNavbarMenu';
