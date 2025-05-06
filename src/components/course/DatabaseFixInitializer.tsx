
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// 此组件用于确保作业相关表和约束配置正确
export const DatabaseFixInitializer: React.FC = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const fixDatabaseConstraints = async () => {
      try {
        console.log('[DatabaseFixInitializer] Running database constraint fixes...');
        
        // 修复作业表约束
        await supabase.rpc('fix_homework_constraints');
        
        console.log('[DatabaseFixInitializer] Database fixes completed successfully');
        setInitialized(true);
      } catch (error) {
        console.warn('[DatabaseFixInitializer] Error fixing database constraints:', error);
        // 即使失败也标记为已初始化，避免无限重试
        setInitialized(true);
      }
    };

    if (!initialized) {
      fixDatabaseConstraints();
    }

    return () => {
      console.log('[DatabaseFixInitializer] Cleanup on unmount');
    };
  }, [initialized]);

  // 无需渲染任何UI
  return null;
};
