
import React from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Apple, Chrome, MessageSquare } from "lucide-react";
import { Provider } from '@supabase/supabase-js';

export const SocialLoginButtons = () => {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth?callback=google`,
      }
    });
    
    if (error) {
      console.error('Google login error:', error);
    }
  };

  const handleAppleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth?callback=apple`,
      }
    });
    
    if (error) {
      console.error('Apple login error:', error);
    }
  };
  
  const handleWeChatLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'wechat' as Provider,
      options: {
        redirectTo: `${window.location.origin}/auth?callback=wechat`,
      }
    });
    
    if (error) {
      console.error('WeChat login error:', error);
    }
  };

  return (
    <div className="flex justify-center gap-4">
      <Button 
        variant="outline"
        size="icon"
        onClick={handleGoogleLogin}
        className="rounded-full hover:bg-gray-100"
      >
        <Chrome className="h-4 w-4" />
      </Button>

      <Button 
        variant="outline"
        size="icon"
        onClick={handleAppleLogin}
        className="rounded-full hover:bg-gray-100"
      >
        <Apple className="h-4 w-4" />
      </Button>

      <Button 
        variant="outline"
        size="icon"
        onClick={handleWeChatLogin}
        className="rounded-full hover:bg-gray-100"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
    </div>
  );
};
