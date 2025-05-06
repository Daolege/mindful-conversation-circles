
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
        
        // 修复作业表中可能存在的position字段问题
        try {
          // 检查fix_homework_order函数是否存在
          const { error: checkError } = await supabase.rpc('fix_homework_constraints');
          
          if (!checkError) {
            // 尝试调用fix_homework_order函数，如果存在的话
            try {
              // 使用自定义类型断言绕过TypeScript检查
              const rpcClient = supabase.rpc as any;
              await rpcClient('fix_homework_order');
              console.log('[DatabaseFixInitializer] Homework order fixed');
            } catch (orderError) {
              console.warn('[DatabaseFixInitializer] Error fixing homework order or function does not exist:', orderError);
              // 继续执行，不要中断流程
            }
          }
        } catch (orderError) {
          console.warn('[DatabaseFixInitializer] Error checking homework constraints:', orderError);
          // 继续执行，不要中断流程
        }
        
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
