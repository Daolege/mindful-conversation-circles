
import React, { useState, useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Shield, Home } from "lucide-react";
import { useAuth } from "@/contexts/authHooks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { NavbarSearch } from "./NavbarSearch";
import { MobileNavbarMenu } from "./MobileNavbarMenu";
import Logo from "@/components/Logo";
import { handleAboutPageQueryError } from "@/lib/supabaseUtils";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  
  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/");
  }, [signOut, navigate]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const { data: aboutPageSettings } = useQuery({
    queryKey: ['about-page-visibility'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_page_settings")
        .select("is_visible")
        .single();

      return handleAboutPageQueryError(data, error);
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });

  const { data: isAdmin = false } = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: async () => {
      if (!user) return false;
      try {
        const { data, error } = await supabase.rpc('has_role', { role: 'admin' });
        if (error) throw error;
        return !!data;
      } catch (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  });

  if (location.pathname === "/auth") {
    return null;
  }

  const showAboutLink = aboutPageSettings?.is_visible !== false;

  const mobileMenuProps = useMemo(() => ({
    user,
    isAdmin,
    setIsMenuOpen,
    handleSignOut,
    showAboutLink
  }), [user, isAdmin, handleSignOut, showAboutLink]);

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white/80 backdrop-blur-md shadow-sm py-4 sticky top-0 z-50 border-b border-gray-100"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Logo />

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center space-x-1 text-gray-600 hover:text-knowledge-primary transition-all duration-200 relative group"
            >
              <Home size={18} />
              <span>首页</span>
              <motion.div
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-knowledge-primary group-hover:w-full transition-all duration-200"
                whileHover={{ width: "100%" }}
              />
            </Link>
            <Link 
              to="/courses" 
              className="text-gray-600 hover:text-knowledge-primary transition-all duration-200 relative group"
            >
              全部课程
              <motion.div
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-knowledge-primary group-hover:w-full transition-all duration-200"
                whileHover={{ width: "100%" }}
              />
            </Link>
            {showAboutLink && (
              <Link 
                to="/about" 
                className="text-gray-600 hover:text-knowledge-primary transition-all duration-200 relative group"
              >
                关于我们
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-knowledge-primary group-hover:w-full transition-all duration-200"
                  whileHover={{ width: "100%" }}
                />
              </Link>
            )}
            {user && isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-1 text-knowledge-primary font-medium hover:text-knowledge-secondary transition-all duration-200 relative group"
              >
                <Shield size={18} />
                <span>管理后台</span>
                <motion.div
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-knowledge-secondary group-hover:w-full transition-all duration-200"
                  whileHover={{ width: "100%" }}
                />
              </Link>
            )}
            <NavbarSearch className="ml-2" inputClassName="w-64" />
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-knowledge-primary transition-all duration-200 relative group"
                >
                  <User size={20} />
                  <span>{user.name || '个人中心'}</span>
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-knowledge-primary group-hover:w-full transition-all duration-200"
                    whileHover={{ width: "100%" }}
                  />
                </Link>
                <Link 
                  to="/auth" 
                  className="text-gray-600 hover:text-knowledge-primary transition-all duration-200 relative group"
                >
                  账号管理
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-knowledge-primary group-hover:w-full transition-all duration-200"
                    whileHover={{ width: "100%" }}
                  />
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="border-knowledge-primary text-knowledge-primary hover:bg-knowledge-primary hover:text-white transition-all duration-200"
                >
                  退出
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/auth")}
                  className="border-knowledge-primary text-knowledge-primary hover:bg-knowledge-primary hover:text-white transition-all duration-200"
                >
                  登录
                </Button>
                <Button 
                  onClick={() => navigate("/auth")}
                  className="bg-knowledge-primary hover:bg-knowledge-secondary text-white transition-all duration-200"
                >
                  注册
                </Button>
              </div>
            )}
          </div>

          <button 
            className="md:hidden flex items-center" 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {isMenuOpen && <MobileNavbarMenu {...mobileMenuProps} />}
      </div>
    </motion.nav>
  );
};

export default Navbar;
